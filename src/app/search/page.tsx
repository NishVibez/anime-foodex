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
        description="One index for recipes, canonical dishes, works, appearances, ingredients, substitutions, and Japanese or romanized aliases."
        eyebrow="Full FooDex search"
        title="Name the craving."
      />
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <SearchWorkbench />
      </section>
    </>
  );
}
