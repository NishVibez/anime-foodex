import type { AccessTier, AdProvider } from "./contracts";

export const AD_FREE_SURFACES = [
  "cooking",
  "onboarding",
  "authentication",
  "settings",
  "checkout",
  "studio",
] as const;
export type AdSurface =
  (typeof AD_FREE_SURFACES)[number] | "catalog" | "feed" | "search";

export interface AdConsentInput {
  readonly accessTier: AccessTier;
  readonly surface: AdSurface;
  readonly authenticated: boolean;
  readonly age: number | null;
  readonly personalizedAdsConsent: boolean;
  readonly consentIsValid: boolean;
  readonly provider: AdProvider;
  readonly providerSupportsConsentSignal: boolean;
}

export interface AdConsentDecision {
  readonly mode: "none" | "contextual" | "personalized";
  readonly provider: AdProvider | null;
  readonly reason: string;
}

export function decideAdMode(input: AdConsentInput): AdConsentDecision {
  if (input.accessTier === "supporter") {
    return {
      mode: "none",
      provider: null,
      reason: "Supporter sessions are ad-free.",
    };
  }
  if ((AD_FREE_SURFACES as readonly string[]).includes(input.surface)) {
    return {
      mode: "none",
      provider: null,
      reason: "Ads are disabled on this product surface.",
    };
  }

  const personalized =
    input.authenticated &&
    input.age !== null &&
    input.age >= 18 &&
    input.personalizedAdsConsent &&
    input.consentIsValid &&
    input.providerSupportsConsentSignal;

  return personalized
    ? {
        mode: "personalized",
        provider: input.provider,
        reason: "An authenticated adult supplied a valid consent signal.",
      }
    : {
        mode: "contextual",
        provider: input.provider,
        reason:
          "Anonymous, under-18, unknown-age, withdrawn-consent, and unsupported-consent sessions use contextual ads.",
      };
}
