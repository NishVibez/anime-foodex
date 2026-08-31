import type {
  AccessTier,
  Entitlement,
  PaymentGateway,
  RecipeAccessLevel,
} from "./contracts";

export const FOUNDING_OFFER_DURATION_DAYS = 30;
export const OFFER_CLAIM_DURATION_MS = 15 * 60 * 1_000;
export const DEFAULT_OFFLINE_LEASE_DURATION_MS = 7 * 24 * 60 * 60 * 1_000;

export const SUPPORTER_PRICES = {
  IN: {
    gateway: "razorpay" as const,
    currency: "INR",
    founding: { monthly: 29900, yearly: 239900, lifetime: 599900 },
    published: { monthly: 59900, yearly: 479900, lifetime: 1199900 },
  },
  INTERNATIONAL: {
    gateway: "stripe" as const,
    currency: "USD",
    founding: { monthly: 499, yearly: 3999, lifetime: 9999 },
    published: { monthly: 999, yearly: 7999, lifetime: 19999 },
  },
} as const;

export function gatewayForBillingCountry(countryCode: string): PaymentGateway {
  return countryCode.trim().toUpperCase() === "IN" ? "razorpay" : "stripe";
}

function timestamp(value: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed))
    throw new RangeError(`Invalid timestamp: ${value}`);
  return parsed;
}

export function entitlementIsActive(
  entitlement: Entitlement,
  at: string | Date,
): boolean {
  const atTime = at instanceof Date ? at.getTime() : timestamp(at);
  const starts = timestamp(entitlement.effectiveFrom);
  const ends = entitlement.effectiveUntil
    ? timestamp(entitlement.effectiveUntil)
    : Number.POSITIVE_INFINITY;
  return (
    entitlement.status === "active" &&
    starts <= atTime &&
    (entitlement.lifetime || atTime < ends)
  );
}

export function resolveAccessTier(
  authenticated: boolean,
  entitlements: readonly Entitlement[],
  at: string | Date,
): AccessTier {
  if (!authenticated) return "guest";
  return entitlements.some((entitlement) =>
    entitlementIsActive(entitlement, at),
  )
    ? "supporter"
    : "member";
}

export function canReadRecipe(
  userTier: AccessTier,
  recipeAccess: RecipeAccessLevel,
): boolean {
  if (userTier === "guest") return false;
  return recipeAccess === "standard" || userTier === "supporter";
}

export interface OfflineEntitlementLease {
  readonly entitlementId: string;
  readonly issuedAt: string;
  readonly expiresAt: string;
}

export function createBoundOfflineLease(input: {
  entitlementId: string;
  effectiveUntil: string | null;
  issuedAt: string | Date;
  durationMs?: number;
}): OfflineEntitlementLease {
  const durationMs = input.durationMs ?? DEFAULT_OFFLINE_LEASE_DURATION_MS;
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new RangeError("Lease duration must be positive.");
  }
  const issued =
    input.issuedAt instanceof Date
      ? input.issuedAt
      : new Date(timestamp(input.issuedAt));
  const entitlementEnd = input.effectiveUntil
    ? timestamp(input.effectiveUntil)
    : Number.POSITIVE_INFINITY;
  const expires = Math.min(issued.getTime() + durationMs, entitlementEnd);
  if (expires <= issued.getTime())
    throw new RangeError("Cannot lease an expired entitlement.");
  return {
    entitlementId: input.entitlementId,
    issuedAt: issued.toISOString(),
    expiresAt: new Date(expires).toISOString(),
  };
}

export function createOfflineEntitlementLease(
  entitlement: Entitlement,
  issuedAt: string | Date,
  durationMs = DEFAULT_OFFLINE_LEASE_DURATION_MS,
): OfflineEntitlementLease {
  if (!entitlementIsActive(entitlement, issuedAt)) {
    throw new RangeError("Cannot lease an inactive entitlement.");
  }
  return createBoundOfflineLease({
    entitlementId: entitlement.id,
    effectiveUntil: entitlement.effectiveUntil,
    issuedAt,
    durationMs,
  });
}

export function offlineLeaseIsValid(
  lease: OfflineEntitlementLease,
  at: string | Date,
): boolean {
  const atTime = at instanceof Date ? at.getTime() : timestamp(at);
  return (
    atTime >= timestamp(lease.issuedAt) && atTime < timestamp(lease.expiresAt)
  );
}

export interface OfferClaim {
  readonly id: string;
  readonly userId: string;
  readonly claimedAt: string;
  readonly checkoutCreatedAt: string | null;
}

export interface OfferClaimDecision {
  readonly state: "available" | "consumed" | "expired";
  readonly expiresAt: string;
  readonly remainingMilliseconds: number;
}

/**
 * The claim window limits checkout creation only. Processor checkout expiration
 * is deliberately outside this contract and must be shown separately.
 */
export function evaluateOfferClaim(
  claim: OfferClaim,
  at: string | Date,
): OfferClaimDecision {
  const claimedAt = timestamp(claim.claimedAt);
  const currentTime = at instanceof Date ? at.getTime() : timestamp(at);
  const expiresAt = claimedAt + OFFER_CLAIM_DURATION_MS;
  const remainingMilliseconds = Math.max(0, expiresAt - currentTime);
  return {
    state: claim.checkoutCreatedAt
      ? "consumed"
      : currentTime >= expiresAt
        ? "expired"
        : "available",
    expiresAt: new Date(expiresAt).toISOString(),
    remainingMilliseconds,
  };
}
