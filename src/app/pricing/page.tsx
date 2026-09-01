import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";
import { PricingDeck } from "@/components/pricing/pricing-deck";

export const metadata: Metadata = {
  title: "Supporter",
  description:
    "Anime FooDex Supporter plans, founding prices, access, and honest offer terms.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PageIntro
        description="Get every exclusive recipe, unlimited offline cooking and collections, advanced filters, no ads, and premium profile rewards—while helping the test kitchen publish more dishes."
        eyebrow="Anime FooDex Supporter"
        title="More recipes. More rewards. No interruptions."
        tone="ink"
      />
      <section className="mx-auto max-w-[95rem] px-5 py-12 sm:px-8 sm:py-16">
        <PricingDeck />
      </section>
    </>
  );
}
