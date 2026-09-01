"use client";

import type { Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clapperboard,
  Search,
  Soup,
  Wheat,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { featuredRecipes } from "@/content/experience";

type SearchEntity = {
  type: "recipe" | "dish" | "work" | "ingredient";
  title: string;
  subtitle: string;
  href: Route;
  aliases: string[];
};

const entities: SearchEntity[] = [
  ...featuredRecipes.map((recipe) => ({
    type: "recipe" as const,
    title: recipe.title,
    subtitle: `${recipe.work} · ${recipe.access}`,
    href: `/recipes/${recipe.slug}` as Route,
    aliases: [recipe.dish, recipe.work, ...recipe.tags],
  })),
  ...Array.from(new Set(featuredRecipes.map((recipe) => recipe.dish))).map(
    (dish) => ({
      type: "dish" as const,
      title: dish,
      subtitle: "Canonical dish · recipe interpretations available",
      href: "/dishes" as Route,
      aliases: [dish],
    }),
  ),
  ...Array.from(new Set(featuredRecipes.map((recipe) => recipe.work))).map(
    (work) => ({
      type: "work" as const,
      title: work,
      subtitle: "Series or world · connected food moments",
      href: "/works" as Route,
      aliases: [work],
    }),
  ),
  ...[
    "short-grain rice",
    "white miso",
    "scallions",
    "seasonal fruit",
    "curry powder",
  ].map((ingredient) => ({
    type: "ingredient" as const,
    title: ingredient,
    subtitle: "Ingredient · substitutions and market notes",
    href: "/ingredients" as Route,
    aliases: [ingredient],
  })),
];

const icons = {
  recipe: BookOpen,
  dish: Soup,
  work: Clapperboard,
  ingredient: Wheat,
};

export function SearchWorkbench() {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      entities.filter((item) =>
        [item.title, item.subtitle, ...item.aliases]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      ),
    [normalized],
  );

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search Anime FooDex</span>
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-5 -translate-y-1/2 text-[var(--ink-faint)]"
          size={22}
        />
        <input
          autoFocus
          className="min-h-16 w-full rounded-2xl border border-[var(--ink)] bg-[var(--paper-raised)] pr-5 pl-14 text-lg shadow-[5px_5px_0_var(--ink)] outline-none placeholder:text-[var(--ink-faint)] focus:ring-3 focus:ring-[var(--focus)]/30"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search recipes, dishes, works, ingredients…"
          type="search"
          value={query}
        />
      </label>

      <div className="mt-7 flex flex-wrap gap-2">
        {["ramen", "rice", "vegetarian", "quick", "game"].map((suggestion) => (
          <button
            className="rounded-full border bg-[var(--paper-raised)] px-3 py-1.5 text-xs font-bold hover:border-[var(--ink)]"
            key={suggestion}
            onClick={() => setQuery(suggestion)}
            type="button"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="mt-9">
        <div className="flex items-center justify-between border-b pb-3">
          <p className="eyebrow text-[var(--ink-faint)]">
            {normalized
              ? `${results.length} matching records`
              : "Start anywhere"}
          </p>
          <span className="text-xs text-[var(--ink-faint)]">
            Aliases + romanized names supported
          </span>
        </div>
        <div className="divide-y">
          {results.map((item, index) => {
            const Icon = icons[item.type];
            return (
              <Link
                className="group flex items-center gap-4 py-5"
                href={item.href}
                key={`${item.type}-${item.title}-${index}`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border bg-[var(--paper-raised)]">
                  <Icon size={19} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-black">{item.title}</h2>
                    <Badge tone="paper">{item.type}</Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-[var(--ink-faint)]">
                    {item.subtitle}
                  </p>
                </div>
                <ArrowRight
                  className="ml-auto transition-transform group-hover:translate-x-1"
                  size={18}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
