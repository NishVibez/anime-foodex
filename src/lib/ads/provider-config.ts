import type { AdProvider } from "@/domain/contracts";

export function resolvedAdProvider(): AdProvider | null {
  const requested = process.env.NEXT_PUBLIC_AD_PROVIDER;
  if (!requested || requested === "none") return null;
  if (
    (requested === "adsense" || requested === "auto") &&
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  )
    return "adsense";
  if (
    (requested === "media_net" || requested === "auto") &&
    process.env.NEXT_PUBLIC_MEDIA_NET_CID
  )
    return "media_net";
  if (
    (requested === "infolinks" || requested === "auto") &&
    process.env.NEXT_PUBLIC_INFOLINKS_PID
  )
    return "infolinks";
  return null;
}
