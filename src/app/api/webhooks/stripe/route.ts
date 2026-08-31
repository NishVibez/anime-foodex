import { NextResponse } from "next/server";

import {
  isoFromSeconds,
  metadata,
  record,
  string,
  uuid,
  validPlan,
} from "@/lib/billing/event-parsing";
import { stripeClient } from "@/lib/billing/server";
import {
  recordVerifiedWebhook,
  type EntitlementWebhook,
  webhookAuditPayload,
} from "@/lib/billing/webhook-ledger";

export const runtime = "nodejs";

function statusForStripe(value: unknown): EntitlementWebhook["status"] {
  if (
    value === "active" ||
    value === "trialing" ||
    value === "paid" ||
    value === "complete"
  )
    return "active";
  if (value === "past_due" || value === "unpaid" || value === "payment_failed")
    return "past_due";
  if (value === "canceled" || value === "cancelled") return "cancelled";
  return "pending";
}

async function entitlementFromStripe(
  eventType: string,
  object: Record<string, unknown>,
): Promise<EntitlementWebhook | null> {
  let entity = object;
  let meta = metadata(entity);
  let externalPurchaseId =
    string(entity.subscription) ??
    string(entity.payment_intent) ??
    string(entity.id);

  if (
    eventType === "charge.refunded" ||
    eventType === "charge.dispute.created"
  ) {
    const stripe = stripeClient();
    const charge =
      eventType === "charge.dispute.created"
        ? record(await stripe.charges.retrieve(string(entity.charge) ?? ""))
        : entity;
    const paymentIntentId = string(charge.payment_intent);
    if (!paymentIntentId)
      throw new Error("Stripe financial event has no payment intent.");
    const paymentIntent = record(
      await stripe.paymentIntents.retrieve(paymentIntentId),
    );
    meta = {
      ...metadata(paymentIntent),
      ...metadata(charge),
      ...metadata(entity),
    };
    externalPurchaseId = paymentIntentId;
    entity = { ...charge, ...entity };
  }

  if (
    eventType === "checkout.session.completed" &&
    string(entity.subscription)
  ) {
    const subscription = await stripeClient().subscriptions.retrieve(
      string(entity.subscription)!,
    );
    entity = record(subscription);
    meta = { ...metadata(entity), ...meta };
    externalPurchaseId = string(entity.id);
  }

  const userId = uuid(meta.user_id);
  const plan = validPlan(meta.plan);
  if (!userId || !plan || !externalPurchaseId) {
    if (
      eventType === "charge.refunded" ||
      eventType === "charge.dispute.created"
    )
      throw new Error("Stripe financial event could not be correlated.");
    return null;
  }

  if (
    eventType === "charge.refunded" ||
    eventType === "charge.dispute.created"
  ) {
    return {
      userId,
      externalCustomerId: string(entity.customer),
      externalPurchaseId,
      plan,
      status: eventType === "charge.refunded" ? "refunded" : "disputed",
      effectiveFrom: isoFromSeconds(entity.created),
      effectiveUntil:
        plan === "lifetime" ? null : isoFromSeconds(entity.created),
      lifetime: plan === "lifetime",
      revokedReason: eventType,
    };
  }

  const items = record(entity.items);
  const data = Array.isArray(items.data) ? items.data.map(record) : [];
  const periodEnd = entity.current_period_end ?? data[0]?.current_period_end;
  const effectiveUntil =
    plan === "lifetime" ? null : periodEnd ? isoFromSeconds(periodEnd) : null;
  if (plan !== "lifetime" && !effectiveUntil) return null;

  return {
    userId,
    externalCustomerId: string(entity.customer),
    externalPurchaseId,
    plan,
    status:
      eventType === "customer.subscription.deleted"
        ? "cancelled"
        : statusForStripe(entity.status ?? entity.payment_status),
    effectiveFrom: isoFromSeconds(
      entity.current_period_start ?? entity.created,
    ),
    effectiveUntil,
    lifetime: plan === "lifetime",
    revokedReason: null,
  };
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature)
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  const raw = await request.text();
  try {
    const event = stripeClient().webhooks.constructEvent(
      raw,
      signature,
      secret,
    );
    const object = record(event.data.object);
    const entitlement = await entitlementFromStripe(event.type, object);
    const result = await recordVerifiedWebhook({
      gateway: "stripe",
      eventId: event.id,
      eventType: event.type,
      occurredAt: new Date(event.created * 1_000).toISOString(),
      payload: webhookAuditPayload(raw, event.type),
      entitlement,
    });
    return NextResponse.json({
      received: true,
      duplicate: result.duplicate,
      applied: result.applied,
    });
  } catch (error) {
    console.error("stripe_webhook_rejected", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ error: "Invalid webhook." }, { status: 400 });
  }
}
