import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { record } from "@/lib/billing/event-parsing";
import { razorpayClient, stripeClient } from "@/lib/billing/server";
import { createSecretClient } from "@/lib/supabase/secret";

export const runtime = "nodejs";

function authorized(request: Request) {
  const configured = process.env.CRON_SECRET;
  const supplied = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!configured || !supplied) return false;
  const left = Buffer.from(configured);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

function normalizedStatus(value: unknown) {
  if (
    ["active", "authenticated", "captured", "paid", "succeeded"].includes(
      String(value),
    )
  )
    return "active";
  if (["past_due", "halted", "paused", "unpaid"].includes(String(value)))
    return "past_due";
  if (["cancelled", "canceled"].includes(String(value))) return "cancelled";
  if (["completed", "expired"].includes(String(value))) return "expired";
  return "pending";
}

export async function GET(request: Request) {
  if (!authorized(request))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const secret = createSecretClient();
  const { data: candidates, error } = await secret.rpc(
    "entitlement_reconciliation_candidates",
    {
      p_before: new Date().toISOString(),
      p_result_limit: 100,
    },
  );
  if (error)
    return NextResponse.json(
      { error: "Reconciliation queue is unavailable." },
      { status: 503 },
    );

  let reconciled = 0;
  let failed = 0;
  const requestId = `cron-${new Date().toISOString()}`;
  for (const candidate of candidates ?? []) {
    try {
      let status: string;
      let effectiveUntil: string | null;
      if (candidate.gateway === "stripe") {
        const stripe = stripeClient();
        if (candidate.plan === "lifetime") {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            candidate.external_purchase_id,
          );
          const chargeId =
            typeof paymentIntent.latest_charge === "string"
              ? paymentIntent.latest_charge
              : paymentIntent.latest_charge?.id;
          const charge = chargeId
            ? await stripe.charges.retrieve(chargeId)
            : null;
          status = charge?.disputed
            ? "disputed"
            : charge?.refunded
              ? "refunded"
              : normalizedStatus(paymentIntent.status);
          effectiveUntil = null;
        } else {
          const subscription = await stripe.subscriptions.retrieve(
            candidate.external_purchase_id,
          );
          status = normalizedStatus(subscription.status);
          const periodEnd = subscription.items.data[0]?.current_period_end;
          effectiveUntil = periodEnd
            ? new Date(periodEnd * 1_000).toISOString()
            : candidate.effective_until;
        }
      } else {
        const razorpay = razorpayClient();
        if (candidate.plan === "lifetime") {
          const order = record(
            await razorpay.orders.fetch(candidate.external_purchase_id),
          );
          const payments = await razorpay.orders.fetchPayments(
            candidate.external_purchase_id,
          );
          const payment = record(payments.items[0]);
          status =
            Number(payment.amount_refunded ?? 0) >= Number(payment.amount ?? 1)
              ? "refunded"
              : normalizedStatus(payment.status ?? order.status);
          effectiveUntil = null;
        } else {
          const subscription = record(
            await razorpay.subscriptions.fetch(candidate.external_purchase_id),
          );
          status = normalizedStatus(subscription.status);
          effectiveUntil =
            typeof subscription.current_end === "number"
              ? new Date(subscription.current_end * 1_000).toISOString()
              : candidate.effective_until;
        }
      }
      const { data: applied, error: applyError } = await secret.rpc(
        "apply_entitlement_reconciliation",
        {
          p_entitlement_id: candidate.entitlement_id,
          p_status: status,
          p_effective_until: effectiveUntil,
          p_request_id: requestId,
        },
      );
      if (applyError || !applied)
        throw new Error("reconciliation_apply_failed");
      reconciled += 1;
    } catch (error) {
      failed += 1;
      console.error("entitlement_reconciliation_failed", {
        entitlementId: candidate.entitlement_id,
        gateway: candidate.gateway,
        message: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  return NextResponse.json({
    examined: candidates?.length ?? 0,
    reconciled,
    failed,
  });
}
