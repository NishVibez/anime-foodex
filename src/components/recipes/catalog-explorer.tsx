"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import { RecipeCard } from "@/components/recipes/recipe-card";
import { Button } from "@/components/ui/button";
import type { CollectionKey, EditorialRecipe } from "@/content/experience";

const kindOptions: Array<{ value: "all" | CollectionKey; label: string }> = [
  { value: "all", label: "All worlds" },
  { value: "anime", label: "Anime" },
  { value: "animation", label: "Animation" },
  { value: "game", label: "Games" },
  { value: "film", label: "Films" },
  { value: "theme_park", label: "Parks" },
];

export function CatalogExplorer({ recipes }: { recipes: EditorialRecipe[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | CollectionKey>("all");
  const [access, setAccess] = useState<"all" | "standard" | "supporter">("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const matchesQuery =
        !normalized ||
        [recipe.title, recipe.dish, recipe.work, ...recipe.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return (
        matchesQuery &&
        (kind === "all" || recipe.kind === kind) &&
        (access === "all" || recipe.access === access)
      );
    });
  }, [access, kind, query, recipes]);

  const hasFilters = query || kind !== "all" || access !== "all";

  return (
    <div>
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Search recipes</span>
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--ink-faint)]"
              size={18}
            />
            <input
              className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] pr-4 pl-11 text-sm outline-none placeholder:text-[var(--ink-faint)] focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--focus)]/35"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ramen, curry, forest picnic…"
              type="search"
              value={query}
            />
          </label>
          <label className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3">
            <SlidersHorizontal aria-hidden="true" size={17} />
            <span className="sr-only">World</span>
            <select
              className="h-full min-w-35 bg-transparent text-sm font-bold outline-none"
              onChange={(event) => setKind(event.target.value as typeof kind)}
              value={kind}
            >
              {kindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-12 items-center rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3">
            <span className="sr-only">Access</span>
            <select
              className="h-full min-w-35 bg-transparent text-sm font-bold outline-none"
              onChange={(event) =>
                setAccess(event.target.value as typeof access)
              }
              value={access}
            >
              <option value="all">Every access tier</option>
              <option value="standard">Standard</option>
              <option value="supporter">Supporter</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 text-xs font-bold text-[var(--ink-faint)]">
          <span>
            {filtered.length} editorial sample{filtered.length === 1 ? "" : "s"}{" "}
            · 420-record GA gate configured
          </span>
          {hasFilters ? (
            <Button
              className="min-h-8 px-3"
              onClick={() => {
                setQuery("");
                setKind("all");
                setAccess("all");
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" size={14} /> Clear
            </Button>
          ) : null}
        </div>
      </div>

      {filtered.length ? (
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl border border-dashed border-[var(--ink-faint)] px-6 py-16 text-center">
          <p className="display text-3xl">Nothing fits that panel.</p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Try another dish, work, or access filter.
          </p>
        </div>
      )}
    </div>
  );
}
