import { headers } from "next/headers";
import Script from "next/script";

import { decideRuntimeAd } from "@/lib/ads/server";

export async function AdSlot({ placement }: { placement: "catalog" | "feed" }) {
  const decision = await decideRuntimeAd();
  if (!decision) return null;
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const slot = process.env.NEXT_PUBLIC_AD_SLOT_CATALOG;

  return (
    <aside
      aria-label="Advertisement"
      className="mx-auto my-8 min-h-24 max-w-[95rem] rounded-2xl border border-dashed border-[var(--line)] bg-[var(--paper-deep)] px-5 py-4 text-center"
      data-ad-mode={decision.mode}
      data-ad-placement={placement}
      data-ad-provider={decision.provider}
      title={decision.reason}
    >
      <p className="mb-3 text-[0.6rem] font-black tracking-[0.16em] text-[var(--ink-faint)] uppercase">
        Advertisement · {decision.mode}
      </p>
      {decision.provider === "adsense" ? (
        <>
          <Script
            async
            crossOrigin="anonymous"
            nonce={nonce}
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "")}`}
            strategy="afterInteractive"
          />
          <ins
            className="adsbygoogle block"
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
            data-ad-format="auto"
            data-ad-slot={slot}
            data-full-width-responsive="true"
            data-npa-on={decision.mode === "contextual" ? "true" : undefined}
          />
        </>
      ) : null}
      {decision.provider === "media_net" ? (
        <Script
          async
          nonce={nonce}
          src={`https://contextual.media.net/dmedianet.js?cid=${encodeURIComponent(process.env.NEXT_PUBLIC_MEDIA_NET_CID ?? "")}`}
          strategy="afterInteractive"
        />
      ) : null}
      {decision.provider === "infolinks" ? (
        <Script
          async
          nonce={nonce}
          src={`https://resources.infolinks.com/js/infolinks_main.js?pid=${encodeURIComponent(process.env.NEXT_PUBLIC_INFOLINKS_PID ?? "")}`}
          strategy="afterInteractive"
        />
      ) : null}
    </aside>
  );
}
