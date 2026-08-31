import { describe, expect, it } from "vitest";

import {
  decideAdMode,
  evaluateAgePolicy,
  minimumAccountAge,
} from "../../src/domain";

describe("age policy", () => {
  it("requires age 18 in India because parental consent is unsupported", () => {
    const seventeen = evaluateAgePolicy({
      birthDate: "2008-09-01",
      countryCode: "IN",
      asOf: "2026-08-30",
    });
    const eighteen = evaluateAgePolicy({
      birthDate: "2008-08-30",
      countryCode: "IN",
      asOf: "2026-08-30",
    });
    expect(seventeen.accountAllowed).toBe(false);
    expect(eighteen.accountAllowed).toBe(true);
  });

  it("uses configured 13–16 thresholds in Europe and social age 14+", () => {
    expect(minimumAccountAge("DE")).toBe(16);
    expect(minimumAccountAge("BE")).toBe(13);
    const belgianThirteen = evaluateAgePolicy({
      birthDate: "2013-08-30",
      countryCode: "BE",
      asOf: "2026-08-30",
    });
    expect(belgianThirteen.accountAllowed).toBe(true);
    expect(belgianThirteen.socialAllowed).toBe(false);
  });

  it("rejects invalid and future dates", () => {
    expect(() =>
      evaluateAgePolicy({
        birthDate: "2026-02-30",
        countryCode: "US",
        asOf: "2026-08-30",
      }),
    ).toThrow();
    expect(() =>
      evaluateAgePolicy({
        birthDate: "2027-01-01",
        countryCode: "US",
        asOf: "2026-08-30",
      }),
    ).toThrow(/future/);
  });
});

describe("ad consent", () => {
  it("shows personalized ads only to authenticated consenting adults", () => {
    expect(
      decideAdMode({
        accessTier: "member",
        surface: "catalog",
        authenticated: true,
        age: 24,
        personalizedAdsConsent: true,
        consentIsValid: true,
        provider: "adsense",
        providerSupportsConsentSignal: true,
      }).mode,
    ).toBe("personalized");
  });

  it("uses contextual ads for unknown age and no ads for supporters/cooking", () => {
    const base = {
      authenticated: false,
      age: null,
      personalizedAdsConsent: false,
      consentIsValid: false,
      provider: "media_net" as const,
      providerSupportsConsentSignal: false,
    };
    expect(
      decideAdMode({ ...base, accessTier: "guest", surface: "catalog" }).mode,
    ).toBe("contextual");
    expect(
      decideAdMode({ ...base, accessTier: "supporter", surface: "catalog" })
        .mode,
    ).toBe("none");
    expect(
      decideAdMode({ ...base, accessTier: "member", surface: "cooking" }).mode,
    ).toBe("none");
  });
});
