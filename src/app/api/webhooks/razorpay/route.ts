import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  isoFromSeconds,
  metadata,
  record,
  string,
  uuid,
  validPlan,
} from "@/lib/billing/event-parsing";
import {
  recordVerifiedWebhook,
  type EntitlementWebhook,
  webhookAuditPayload,
} from "@/lib/billing/webhook-ledger";
import { razorpayClient } from "@/lib/billing/server";
import type { Json } from "@/types/database";

export const runtime = "nodejs";

function verify(raw: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(signature, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

async function entitlementFromRazorpay(
  eventType: string,
  payload: Record<string, unknown>,
): Promise<EntitlementWebhook | null> {
  const payloadObject = record(payload.payload);
  let subscription = record(record(payloadObject.subscription).entity);
  let order = record(record(payloadObject.order).entity);
  let payment = record(record(payloadObject.payment).entity);
  const refund = record(record(payloadObject.refund).entity);
  const dispute = record(record(payloadObject.dispute).entity);

  const paymentId =
    string(payment.id) ??
    string(refund.payment_id) ??
    string(dispute.payment_id);
  if (!Object.keys(payment).length && paymentId)
    payment = record(await razorpayClient().payments.fetch(paymentId));

  const subscriptionId =
    string(subscription.id) ?? string(payment.subscription_id);
  if (!Object.keys(subscription).length && subscriptionId)
    subscription = record(
      await razorpayClient().subscriptions.fetch(subscriptionId),
    );

  const orderId = string(order.id) ?? string(payment.order_id);
  if (!Object.keys(order).length && orderId)
    order = record(await razorpayClient().orders.fetch(orderId));

  const entity = Object.keys(subscription).length
    ? subscription
    : Object.keys(order).length
      ? order
      : payment;
  const notes = {
    ...metadata(order),
    ...metadata(payment),
    ...metadata(subscription),
    ...metadata(refund),
    ...metadata(dispute),
  };
  const userId = uuid(notes.user_id);
  const plan = validPlan(notes.plan);
  const externalPurchaseId = plan === "lifetime" ? orderId : subscriptionId;
  if (!userId || !plan || !externalPurchaseId) {
    if (
      eventType.includes("refund") ||
      eventType.includes("dispute") ||
      eventType === "payment.captured" ||
      eventType === "order.paid"
    )
      throw new Error("Razorpay financial event could not be correlated.");
    return null;
  }

  let status: EntitlementWebhook["status"] = "pending";
  if (
    [
      "subscription.activated",
      "subscription.charged",
      "order.paid",
      "payment.captured",
    ].includes(eventType)
  )
    status = "active";
  if (["subscription.halted", "payment.failed"].includes(eventType))
    status = "past_due";
  if (["subscription.cancelled", "subscription.completed"].includes(eventType))
    status = eventType.endsWith("completed") ? "expired" : "cancelled";
  if (["refund.processed", "payment.refunded"].includes(eventType))
    status = "refunded";
  if (eventType.includes("dispute")) status = "disputed";

  const periodEnd = entity.current_end ?? entity.ended_at;
  const effectiveUntil =
    plan === "lifetime" ? null : periodEnd ? isoFromSeconds(periodEnd) : null;
  if (plan !== "lifetime" && !effectiveUntil) return null;
  return {
    userId,
    externalCustomerId: string(entity.customer_id) ?? string(payment.contact),
    externalPurchaseId,
    plan,
    status,
    effectiveFrom: isoFromSeconds(entity.current_start ?? entity.created_at),
    effectiveUntil,
    lifetime: plan === "lifetime",
    revokedReason: status === "active" ? null : eventType,
  };
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature");
  if (!secret || !signature)
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  const raw = await request.text();
  if (!verify(raw, signature, secret))
    return NextResponse.json({ error: "Invalid webhook." }, { status: 400 });

  try {
    const parsed = JSON.parse(raw) as Json;
    const payload = record(parsed);
    const eventType = string(payload.event) ?? "unknown";
    const eventId =
      request.headers.get("x-razorpay-event-id") ??
      createHash("sha256").update(raw).digest("hex");
    const entitlement = await entitlementFromRazorpay(eventType, payload);
    const occurredAt = isoFromSeconds(payload.created_at, Date.now());
    const result = await recordVerifiedWebhook({
      gateway: "razorpay",
      eventId,
      eventType,
      occurredAt,
      payload: webhookAuditPayload(raw, eventType),
      entitlement,
    });
    return NextResponse.json({
      received: true,
      duplicate: result.duplicate,
      applied: result.applied,
    });
  } catch (error) {
    console.error("razorpay_webhook_rejected", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 400 },
    );
  }
}
