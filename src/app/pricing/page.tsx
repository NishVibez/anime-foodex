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
        description="Unlock the complete library, unlimited offline cooking, advanced tools, cosmetics, and an openly disclosed competitive XP multiplier—while helping fund independent recipe testing and rights-safe media."
        eyebrow="Supporter tier"
        title="Back the kitchen. Open the Vault."
        tone="ink"
      />
      <section className="mx-auto max-w-[95rem] px-5 py-12 sm:px-8 sm:py-16">
        <PricingDeck />
      </section>
    </>
  );
}
