import "server-only";

import type { AdProvider } from "@/domain/contracts";
import { decideAdMode } from "@/domain/consent";
import { resolvedAdProvider } from "@/lib/ads/provider-config";
import { getViewer } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";

export type AdRuntimeDecision = {
  provider: AdProvider;
  mode: "contextual" | "personalized";
  reason: string;
};

export async function decideRuntimeAd(): Promise<AdRuntimeDecision | null> {
  const provider = resolvedAdProvider();
  if (!provider) return null;
  const viewer = await getViewer();
  if (viewer?.accessTier === "supporter") return null;

  let advertisingEligible = false;
  let personalizedAdsConsent = false;
  if (viewer) {
    const { data } = await (await createClient()).rpc("get_my_ad_context");
    advertisingEligible = data?.[0]?.advertising_eligible ?? false;
    personalizedAdsConsent = data?.[0]?.personalized_consent ?? false;
  }

  const decision = decideAdMode({
    accessTier: viewer?.accessTier ?? "guest",
    surface: "catalog",
    authenticated: Boolean(viewer),
    age: advertisingEligible ? 18 : null,
    personalizedAdsConsent,
    consentIsValid: personalizedAdsConsent,
    provider,
    providerSupportsConsentSignal:
      process.env.AD_CONSENT_SIGNAL_CONFIRMED === "true",
  });
  if (decision.mode === "none") return null;
  return { provider, mode: decision.mode, reason: decision.reason };
}
