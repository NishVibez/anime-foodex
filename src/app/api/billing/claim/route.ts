import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient, getVerifiedClaims } from "@/lib/supabase/server";

const claimSchema = z.object({
  plan: z.enum(["monthly", "yearly", "lifetime"]),
});

const offerCodes = {
  india: {
    monthly: "founder-in-monthly",
    yearly: "founder-in-yearly",
    lifetime: "founder-in-lifetime",
  },
  international: {
    monthly: "founder-intl-monthly",
    yearly: "founder-intl-yearly",
    lifetime: "founder-intl-lifetime",
  },
} as const;

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? request.url)
    .origin;
  return origin === expected;
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { error: "Origin check failed." },
      { status: 403 },
    );
  }

  try {
    const parsed = claimSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Choose a valid region and plan." },
        { status: 400 },
      );
    }

    const claims = await getVerifiedClaims();
    if (!claims) {
      return NextResponse.json(
        { error: "Sign in before claiming a founding price." },
        { status: 401 },
      );
    }

    const supabase = await createClient();
    const { data: contextData, error: contextError } = await supabase.rpc(
      "get_my_account_context",
    );
    const context = contextData?.[0];
    if (contextError || context?.account_state !== "active") {
      return NextResponse.json(
        { error: "Complete account eligibility before claiming an offer." },
        { status: 403 },
      );
    }
    const region = context.country_code === "IN" ? "india" : "international";
    const { data, error } = await supabase.rpc("claim_supporter_offer", {
      offer_code: offerCodes[region][parsed.data.plan],
    });
    const claim = data?.[0];
    if (error || !claim) {
      return NextResponse.json(
        {
          error:
            "The founding campaign is not active yet. No countdown has started.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      claim: {
        id: claim.claim_id,
        amountMinor: claim.amount_minor,
        currency: claim.currency,
        gateway: claim.gateway,
        checkoutExpiresAt: claim.checkout_expires_at,
        alreadyClaimed: claim.already_claimed,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Billing is not configured. No countdown has started." },
      { status: 503 },
    );
  }
}
