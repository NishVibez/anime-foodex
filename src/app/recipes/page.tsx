import type { Metadata } from "next";

import { AdSlot } from "@/components/ads/ad-slot";
import { PageIntro } from "@/components/layout/page-intro";
import { CatalogExplorer } from "@/components/recipes/catalog-explorer";
import { featuredRecipes } from "@/content/experience";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Browse independently authored fandom-food recipes and evidence-led previews.",
  alternates: { canonical: "/recipes" },
};

export default function RecipesPage() {
  return (
    <>
      <PageIntro
        description="Search original interpretations by dish, work, ingredient, dietary need, region, skill, or cooking time. Public pages reveal the context and safety summary—not protected quantities or steps."
        eyebrow="The cooking index"
        title="Recipes worth crossing worlds for."
      />
      <section className="mx-auto max-w-[95rem] px-5 py-10 sm:px-8 sm:py-14">
        <CatalogExplorer recipes={featuredRecipes} />
      </section>
      <AdSlot placement="catalog" />
    </>
  );
}
