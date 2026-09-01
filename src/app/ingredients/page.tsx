import type { Metadata } from "next";
import { ArrowLeftRight, MapPin, Wheat } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Ingredients",
  description:
    "Browse ingredients, aliases, allergens, substitutions, and regional availability.",
  alternates: { canonical: "/ingredients" },
};

const ingredients = [
  [
    "Japanese short-grain rice",
    "sushi rice",
    "India: premium short-grain; sona masuri fallback",
    "none",
  ],
  [
    "White miso",
    "shiro miso",
    "India: imported or mild soybean paste blend",
    "soy",
  ],
  [
    "Scallion",
    "spring onion · green onion",
    "Available in all configured markets",
    "none",
  ],
  [
    "Udon",
    "thick wheat noodle",
    "India: thick hakka noodle with texture caveat",
    "gluten",
  ],
  ["Black sesame", "kuro goma", "India: black til", "sesame"],
  [
    "Shiitake",
    "dried forest mushroom",
    "India: dried shiitake or brown mushroom",
    "none",
  ],
];

export default function IngredientsPage() {
  return (
    <>
      <PageIntro
        description="Can’t find the exact noodle, rice, sauce, or vegetable? See what it is, what it does, and which tested local alternative keeps the dish on track."
        eyebrow="A smarter fandom pantry"
        title="Missing an ingredient shouldn’t end the quest."
        tone="saffron"
      />
      <section className="mx-auto max-w-[95rem] px-5 py-12 sm:px-8 sm:py-16">
        <div className="overflow-hidden rounded-2xl border border-[var(--ink)] bg-[var(--paper-raised)]">
          <div className="hidden grid-cols-[1.1fr_1fr_1.6fr_auto] gap-4 border-b bg-[var(--ink)] px-5 py-3 text-[0.65rem] font-black tracking-[0.12em] text-[var(--paper)] uppercase md:grid">
            <span>Ingredient</span>
            <span>Aliases</span>
            <span>Regional note</span>
            <span>Allergen</span>
          </div>
          <div className="divide-y">
            {ingredients.map(([name, aliases, region, allergen]) => (
              <article
                className="grid gap-4 px-5 py-5 md:grid-cols-[1.1fr_1fr_1.6fr_auto] md:items-center"
                key={name}
              >
                <p className="flex items-center gap-3 font-black">
                  <Wheat className="text-[var(--saffron)]" size={18} />
                  {name}
                </p>
                <p className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
                  <ArrowLeftRight size={15} />
                  {aliases}
                </p>
                <p className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
                  <MapPin size={15} />
                  {region}
                </p>
                <Badge tone={allergen === "none" ? "jade" : "vermilion"}>
                  {allergen}
                </Badge>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
