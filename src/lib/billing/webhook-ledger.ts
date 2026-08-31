import "server-only";

import { createHash } from "node:crypto";

import type { Json } from "@/types/database";
import { createSecretClient } from "@/lib/supabase/secret";

export type EntitlementWebhook = {
  userId: string;
  externalCustomerId: string | null;
  externalPurchaseId: string;
  plan: "monthly" | "yearly" | "lifetime";
  status:
    | "pending"
    | "active"
    | "past_due"
    | "cancelled"
    | "expired"
    | "refunded"
    | "disputed"
    | "revoked";
  effectiveFrom: string;
  effectiveUntil: string | null;
  lifetime: boolean;
  revokedReason?: string | null;
};

export function webhookAuditPayload(raw: string, eventType: string): Json {
  return {
    sha256: createHash("sha256").update(raw).digest("hex"),
    byteLength: Buffer.byteLength(raw),
    eventType,
    retained: "digest_only",
  };
}

export async function recordVerifiedWebhook(input: {
  gateway: "stripe" | "razorpay";
  eventId: string;
  eventType: string;
  occurredAt: string;
  payload: Json;
  entitlement?: EntitlementWebhook | null;
}) {
  const supabase = createSecretClient();
  const { data, error } = await supabase.rpc("record_verified_webhook", {
    p_gateway: input.gateway,
    p_external_event_id: input.eventId,
    p_event_type: input.eventType,
    p_external_occurred_at: input.occurredAt,
    p_raw_payload: input.payload,
    p_signature_verified: true,
  });
  const recorded = data?.[0];
  if (error || !recorded)
    throw new Error("Verified webhook could not be recorded.");

  if (!input.entitlement) {
    return {
      duplicate: recorded.was_duplicate,
      applied: false,
      state: recorded.processing_state,
    };
  }

  const entitlement = input.entitlement;
  const { data: applied, error: applyError } = await supabase.rpc(
    "apply_entitlement_webhook",
    {
      p_webhook_event_id: recorded.webhook_event_id,
      p_user_id: entitlement.userId,
      p_external_customer_id: entitlement.externalCustomerId,
      p_external_purchase_id: entitlement.externalPurchaseId,
      p_plan: entitlement.plan,
      p_status: entitlement.status,
      p_effective_from: entitlement.effectiveFrom,
      p_effective_until: entitlement.effectiveUntil,
      p_lifetime: entitlement.lifetime,
      p_revoked_reason: entitlement.revokedReason ?? null,
    },
  );
  if (applyError || !applied?.[0])
    throw new Error("Entitlement event could not be applied.");
  return {
    duplicate: recorded.was_duplicate,
    applied: applied[0].applied,
    state: applied[0].processing_state,
  };
}
