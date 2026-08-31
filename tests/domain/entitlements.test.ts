import { describe, expect, it } from "vitest";

import type { Entitlement } from "../../src/domain";
import {
  canReadRecipe,
  createBoundOfflineLease,
  createOfflineEntitlementLease,
  entitlementIsActive,
  evaluateOfferClaim,
  gatewayForBillingCountry,
  offlineLeaseIsValid,
  resolveAccessTier,
} from "../../src/domain";

const entitlement: Entitlement = {
  id: "ent-1",
  userId: "user-1",
  gateway: "stripe",
  externalCustomerId: "customer-external",
  externalPurchaseId: "purchase-external",
  plan: "yearly",
  status: "active",
  effectiveFrom: "2026-01-01T00:00:00.000Z",
  effectiveUntil: "2027-01-01T00:00:00.000Z",
  lifetime: false,
  sourceWebhookId: "webhook-1",
};

describe("entitlements", () => {
  it("resolves current tier and recipe authorization server-side", () => {
    expect(entitlementIsActive(entitlement, "2026-08-30T00:00:00.000Z")).toBe(
      true,
    );
    expect(
      resolveAccessTier(true, [entitlement], "2026-08-30T00:00:00.000Z"),
    ).toBe("supporter");
    expect(
      resolveAccessTier(false, [entitlement], "2026-08-30T00:00:00.000Z"),
    ).toBe("guest");
    expect(canReadRecipe("member", "supporter")).toBe(false);
    expect(canReadRecipe("supporter", "supporter")).toBe(true);
  });

  it("caps an offline lease at entitlement expiry", () => {
    const lease = createOfflineEntitlementLease(
      entitlement,
      "2026-12-30T00:00:00.000Z",
      7 * 24 * 60 * 60 * 1_000,
    );
    expect(lease.expiresAt).toBe("2027-01-01T00:00:00.000Z");
    expect(offlineLeaseIsValid(lease, "2026-12-31T00:00:00.000Z")).toBe(true);
    expect(offlineLeaseIsValid(lease, "2027-01-01T00:00:00.000Z")).toBe(false);
  });

  it("caps a server-issued lease without exposing the full entitlement", () => {
    const lease = createBoundOfflineLease({
      entitlementId: "entitlement-verified-by-server",
      effectiveUntil: "2026-09-01T00:00:00.000Z",
      issuedAt: "2026-08-31T12:00:00.000Z",
      durationMs: 30 * 24 * 60 * 60 * 1_000,
    });
    expect(lease.expiresAt).toBe("2026-09-01T00:00:00.000Z");
  });

  it("routes by declared billing country, never IP", () => {
    expect(gatewayForBillingCountry("in")).toBe("razorpay");
    expect(gatewayForBillingCountry("US")).toBe("stripe");
  });
});

describe("founding offer claim", () => {
  const claim = {
    id: "claim-1",
    userId: "user-1",
    claimedAt: "2026-08-30T10:00:00.000Z",
    checkoutCreatedAt: null,
  } as const;

  it("provides a non-resetting 15-minute checkout-creation window", () => {
    expect(evaluateOfferClaim(claim, "2026-08-30T10:14:59.000Z").state).toBe(
      "available",
    );
    expect(evaluateOfferClaim(claim, "2026-08-30T10:15:00.000Z").state).toBe(
      "expired",
    );
  });

  it("becomes single-use as soon as checkout is created", () => {
    expect(
      evaluateOfferClaim(
        { ...claim, checkoutCreatedAt: "2026-08-30T10:01:00.000Z" },
        "2026-08-30T10:02:00.000Z",
      ).state,
    ).toBe("consumed");
  });
});
