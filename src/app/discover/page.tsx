import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Flame, Leaf, Timer, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { collections, featuredRecipes } from "@/content/experience";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Discover",
  description:
    "Follow seasonal trails through Anime FooDex recipes, works, ingredients, and quests.",
  alternates: { canonical: "/discover" },
};

export default function DiscoverPage() {
  return (
    <>
      <PageIntro
        aside={
          <div className="rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur">
            <p className="eyebrow text-white/60">Today&apos;s signal</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-black">
              <Flame size={20} /> Cozy bowls are rising
            </p>
          </div>
        }
        description="Wander by craving, season, collection, ingredient, or community trail. Every route leads back to a cited food appearance and an independently authored kitchen interpretation."
        eyebrow="Discovery board"
        title="Find your next food arc."
        tone="jade"
      />
      <div className="mx-auto max-w-[95rem] space-y-16 px-5 py-12 sm:px-8 sm:py-16">
        <section>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-[var(--vermilion)]">Seasonal trail</p>
              <h2 className="display mt-2 text-4xl sm:text-6xl">
                Rain on the window
              </h2>
            </div>
            <p className="max-w-sm text-sm text-[var(--ink-muted)]">
              Savory broths, pantry curries, and low-stress bowls selected for
              wet evenings.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="ink-panel overflow-hidden p-6 sm:p-8">
            <div className="halftone absolute inset-0 opacity-10" />
            <div className="relative">
              <Badge tone="saffron">7-day trail</Badge>
              <h2 className="display mt-5 max-w-xl text-4xl sm:text-6xl">
                The pantry alchemist
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--ink-muted)]">
                Make three dishes that each transform one everyday ingredient in
                a different way. Completing the trail earns an original jade
                badge—not editorial access.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    [Leaf, "Rice", "Shape it"],
                    [Timer, "Mushroom", "Deepen it"],
                    [Compass, "Fruit", "Surprise it"],
                  ] satisfies Array<[LucideIcon, string, string]>
                ).map(([Icon, title, detail]) => (
                  <div
                    className="rounded-xl border bg-[var(--paper)] p-4"
                    key={String(title)}
                  >
                    <Icon className="text-[var(--jade)]" size={20} />
                    <p className="mt-4 font-black">{String(title)}</p>
                    <p className="text-xs text-[var(--ink-faint)]">
                      {String(detail)}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                className={cn(buttonVariants({ variant: "jade" }), "mt-7")}
                href="/quests"
              >
                <Trophy size={17} /> See the quest board
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--ink)] bg-[var(--saffron)] p-6 text-[#181512] sm:p-8">
            <p className="eyebrow">Browse by world</p>
            <div className="mt-5 grid gap-2">
              {collections.map((collection) => {
                const Icon = collection.icon;
                return (
                  <Link
                    className="group flex items-center gap-3 rounded-xl border border-black/25 bg-white/42 p-3 font-black transition-colors hover:bg-white/70"
                    href={`/collections/${collection.key}`}
                    key={collection.key}
                  >
                    <Icon size={18} />
                    {collection.label}
                    <span className="ml-auto font-mono text-xs">84</span>
                    <ArrowRight
                      className="transition-transform group-hover:translate-x-1"
                      size={16}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
