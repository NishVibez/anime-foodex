import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Soup } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { featuredRecipes } from "@/content/experience";

export const metadata: Metadata = {
  title: "Dishes",
  description:
    "Explore ramen, onigiri, curry, desserts, and other dishes across anime, games, films, and animated worlds.",
  alternates: { canonical: "/dishes" },
};

export default function DishesPage() {
  return (
    <>
      <PageIntro
        description="Ramen, onigiri, curry, parfaits, and everything between. Explore the real dish, the fandom moments that made it memorable, and the versions you can cook."
        eyebrow="Browse by craving"
        title="Know the dish. Find its worlds."
      />
      <section className="mx-auto max-w-[95rem] px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredRecipes.map((recipe) => (
            <Link
              className="group rounded-2xl border bg-[var(--paper-raised)] p-5 transition-transform motion-safe:hover:-translate-y-1"
              href={`/recipes/${recipe.slug}`}
              key={recipe.dish}
            >
              <Soup className="text-[var(--vermilion)]" size={27} />
              <h2 className="display mt-8 text-2xl">{recipe.dish}</h2>
              <p className="mt-2 text-xs text-[var(--ink-faint)]">
                1 current editorial interpretation
              </p>
              <p className="mt-5 flex items-center gap-2 text-xs font-black">
                Open dish trail{" "}
                <ArrowRight
                  className="transition-transform group-hover:translate-x-1"
                  size={14}
                />
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
