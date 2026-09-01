import type { Metadata } from "next";

import { AdSlot } from "@/components/ads/ad-slot";
import { PageIntro } from "@/components/layout/page-intro";
import { CatalogExplorer } from "@/components/recipes/catalog-explorer";
import { featuredRecipes } from "@/content/experience";

export const metadata: Metadata = {
  title: "Anime, game, and fandom recipes",
  description:
    "Browse dishes by anime, show, game, film, cooking time, difficulty, and access tier.",
  alternates: { canonical: "/recipes" },
};

export default function RecipesPage() {
  return (
    <>
      <PageIntro
        description="Pick a series, choose your cooking window, and find something worth pausing the episode for. Every card tells you exactly which anime, show, game, or film sparked it."
        eyebrow="Your fandom cooklist"
        title="What are we cooking next?"
      />
      <section className="mx-auto max-w-[95rem] px-5 py-10 sm:px-8 sm:py-14">
        <CatalogExplorer recipes={featuredRecipes} />
      </section>
      <AdSlot placement="catalog" />
    </>
  );
}
