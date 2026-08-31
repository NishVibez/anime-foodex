import type { EntitlementWebhook } from "@/lib/billing/webhook-ledger";

export type UnknownRecord = Record<string, unknown>;

export function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

export function string(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function metadata(entity: UnknownRecord) {
  return record(entity.metadata ?? entity.notes);
}

export function validPlan(value: unknown): EntitlementWebhook["plan"] | null {
  return value === "monthly" || value === "yearly" || value === "lifetime"
    ? value
    : null;
}

export function isoFromSeconds(value: unknown, fallback = Date.now()) {
  const seconds = number(value);
  return new Date(seconds === null ? fallback : seconds * 1_000).toISOString();
}

export function uuid(value: unknown): string | null {
  const candidate = string(value);
  return candidate &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      candidate,
    )
    ? candidate
    : null;
}
