import { NextResponse } from "next/server";
import { z } from "zod";

import { gatewayForBillingCountry } from "@/domain/entitlements";
import { stripeClient, razorpayClient } from "@/lib/billing/server";
import { createSecretClient } from "@/lib/supabase/secret";
import { createClient, getVerifiedClaims } from "@/lib/supabase/server";

const schema = z.object({
  claimId: z.uuid(),
  billingCountry: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase()),
});

function allowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(
    origin &&
    origin === new URL(process.env.NEXT_PUBLIC_SITE_URL ?? request.url).origin,
  );
}

export async function POST(request: Request) {
  if (!allowedOrigin(request))
    return NextResponse.json(
      { error: "Origin check failed." },
      { status: 403 },
    );
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "A valid claim and billing country are required." },
      { status: 400 },
    );

  const claims = await getVerifiedClaims();
  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  if (!userId)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const supabase = await createClient();
  const { data: contextData, error: contextError } = await supabase.rpc(
    "get_my_account_context",
  );
  const context = contextData?.[0];
  if (
    contextError ||
    context?.account_state !== "active" ||
    context.country_code !== parsed.data.billingCountry
  )
    return NextResponse.json(
      {
        error:
          "Billing country must match the country verified during account setup.",
      },
      { status: 409 },
    );
  const { data, error } = await supabase.rpc("get_checkout_claim", {
    p_claim_id: parsed.data.claimId,
  });
  const claim = data?.[0];
  if (error || !claim)
    return NextResponse.json(
      { error: "The offer claim is expired or already used." },
      { status: 409 },
    );

  const gateway = gatewayForBillingCountry(parsed.data.billingCountry);
  if (gateway !== claim.gateway)
    return NextResponse.json(
      {
        error: "The billing country does not match the claimed regional offer.",
      },
      { status: 409 },
    );

  try {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const processorExpiresAt = Math.floor(Date.now() / 1_000) + 30 * 60;
    let externalCheckoutId: string;
    let checkout: Record<string, unknown>;

    if (gateway === "stripe") {
      const stripe = stripeClient();
      const recurring =
        claim.plan_interval === "lifetime"
          ? undefined
          : {
              interval:
                claim.plan_interval === "monthly"
                  ? ("month" as const)
                  : ("year" as const),
            };
      const metadata = {
        user_id: userId,
        claim_id: claim.claim_id,
        plan: claim.plan_interval,
        billing_country: parsed.data.billingCountry,
      };
      const session = await stripe.checkout.sessions.create({
        mode: claim.plan_interval === "lifetime" ? "payment" : "subscription",
        billing_address_collection: "required",
        automatic_tax: { enabled: true },
        customer_creation:
          claim.plan_interval === "lifetime" ? "always" : undefined,
        expires_at: processorExpiresAt,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: claim.currency.toLowerCase(),
              unit_amount: claim.amount_minor,
              recurring,
              product_data: {
                name: `Anime FooDex Supporter — ${claim.plan_interval}`,
                description:
                  claim.plan_interval === "lifetime"
                    ? "Access for the operating lifetime of Anime FooDex"
                    : "Supporter access with automatic renewal",
              },
            },
          },
        ],
        metadata,
        subscription_data: recurring ? { metadata } : undefined,
        payment_intent_data: recurring ? undefined : { metadata },
        success_url: `${siteUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
      });
      externalCheckoutId = session.id;
      checkout = {
        gateway,
        url: session.url,
        processorExpiresAt: new Date(processorExpiresAt * 1_000).toISOString(),
      };
    } else {
      const razorpay = razorpayClient();
      const notes = {
        user_id: userId,
        claim_id: claim.claim_id,
        plan: claim.plan_interval,
        billing_country: parsed.data.billingCountry,
      };
      if (claim.plan_interval === "lifetime") {
        const order = await razorpay.orders.create({
          amount: claim.amount_minor,
          currency: claim.currency,
          receipt: `foodex_${claim.claim_id.replaceAll("-", "").slice(0, 24)}`,
          notes,
        });
        externalCheckoutId = order.id;
        checkout = {
          gateway,
          kind: "order",
          orderId: order.id,
          amount: claim.amount_minor,
          currency: claim.currency,
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          processorExpiresAt: new Date(
            processorExpiresAt * 1_000,
          ).toISOString(),
        };
      } else {
        const planId =
          claim.plan_interval === "monthly"
            ? process.env.RAZORPAY_MONTHLY_PLAN_ID
            : process.env.RAZORPAY_YEARLY_PLAN_ID;
        if (!planId)
          throw new Error("Razorpay subscription plan is not configured.");
        const subscription = await razorpay.subscriptions.create({
          plan_id: planId,
          total_count: claim.plan_interval === "monthly" ? 120 : 10,
          customer_notify: 1,
          expire_by: processorExpiresAt,
          notes,
        });
        externalCheckoutId = subscription.id;
        checkout = {
          gateway,
          kind: "subscription",
          subscriptionId: subscription.id,
          url: subscription.short_url,
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          processorExpiresAt: new Date(
            processorExpiresAt * 1_000,
          ).toISOString(),
        };
      }
    }

    const secret = createSecretClient();
    const { error: consumeError } = await secret.rpc("consume_checkout_claim", {
      p_claim_id: claim.claim_id,
      p_user_id: userId,
      p_external_checkout_id: externalCheckoutId,
    });
    if (consumeError)
      return NextResponse.json(
        { error: "Checkout could not be attached to the offer claim." },
        { status: 409 },
      );
    return NextResponse.json({ checkout });
  } catch (error) {
    console.error("billing_checkout_failed", {
      message: error instanceof Error ? error.message : "unknown",
      userId,
      claimId: claim.claim_id,
    });
    return NextResponse.json(
      {
        error:
          "The payment gateway is not ready. Your processor checkout was not confirmed.",
      },
      { status: 503 },
    );
  }
}
