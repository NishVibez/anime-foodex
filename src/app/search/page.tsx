import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";
import { SearchWorkbench } from "@/components/search/search-workbench";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search Anime FooDex recipes, dishes, works, ingredients, aliases, and substitutions.",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <>
      <PageIntro
        description="Search a dish, character craving, anime title, game, ingredient, or alternate spelling. If it belongs at a fandom table, this is where you’ll find it."
        eyebrow="Search the whole FooDex"
        title="Remember the scene? Find the food."
      />
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <SearchWorkbench />
      </section>
    </>
  );
}
