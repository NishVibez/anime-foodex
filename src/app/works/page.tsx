import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Clapperboard } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";
import { featuredRecipes } from "@/content/experience";

export const metadata: Metadata = {
  title: "Works",
  description:
    "Browse anime, shows, games, and films to find every connected Anime FooDex dish.",
  alternates: { canonical: "/works" },
};

export default function WorksPage() {
  const works = Array.from(
    new Set(featuredRecipes.map((recipe) => recipe.work)),
  );
  return (
    <>
      <PageIntro
        description="Start with the anime, show, film, or game you love and see every connected dish in one place. No more trying to remember which episode made you hungry."
        eyebrow="Browse by anime, show, game, or film"
        title="Your favorite worlds have menus."
      />
      <section className="mx-auto max-w-[95rem] px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {works.map((work, index) => {
            const recipes = featuredRecipes.filter(
              (recipe) => recipe.work === work,
            );
            const recipe = recipes[0];
            if (!recipe) return null;
            return (
              <article
                className="rounded-2xl border bg-[var(--paper-raised)] p-5"
                key={work}
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-[var(--ink)] text-[var(--paper)]">
                    <Clapperboard size={19} />
                  </span>
                  <span className="font-mono text-xs font-bold text-[var(--ink-faint)]">
                    W-{String(index + 1).padStart(3, "0")}
                  </span>
                </div>
                <Badge className="mt-7" tone="paper">
                  {recipe.kind.replace("_", " ")}
                </Badge>
                <h2 className="display mt-3 text-2xl">{work}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                  {recipe.context}
                </p>
                <p className="mt-5 flex items-center gap-2 text-xs font-bold text-[var(--jade)]">
                  <BookOpenCheck size={15} /> {recipes.length} recipe connection
                  {recipes.length === 1 ? "" : "s"}
                </p>
                <Link
                  className="mt-5 inline-flex items-center gap-2 text-xs font-black underline"
                  href={`/recipes/${recipe.slug}`}
                >
                  View preview <ArrowRight size={14} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
