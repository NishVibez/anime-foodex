"use client";

import { ArrowDownAZ, Search, SlidersHorizontal, X } from "lucide-react";
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
  const [work, setWork] = useState("all");
  const [sort, setSort] = useState<
    "featured" | "title" | "fastest" | "easiest"
  >("featured");

  const workOptions = useMemo(
    () => [...new Set(recipes.map((recipe) => recipe.work))].sort(),
    [recipes],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const difficultyRank = { Easy: 0, Intermediate: 1, Advanced: 2 } as const;
    return recipes
      .filter((recipe) => {
        const matchesQuery =
          !normalized ||
          [recipe.title, recipe.dish, recipe.work, ...recipe.tags]
            .join(" ")
            .toLowerCase()
            .includes(normalized);
        return (
          matchesQuery &&
          (kind === "all" || recipe.kind === kind) &&
          (access === "all" || recipe.access === access) &&
          (work === "all" || recipe.work === work)
        );
      })
      .toSorted((left, right) => {
        if (sort === "title") return left.title.localeCompare(right.title);
        if (sort === "fastest") return left.minutes - right.minutes;
        if (sort === "easiest")
          return (
            difficultyRank[left.difficulty] - difficultyRank[right.difficulty]
          );
        return recipes.indexOf(left) - recipes.indexOf(right);
      });
  }, [access, kind, query, recipes, sort, work]);

  const hasFilters =
    query ||
    kind !== "all" ||
    access !== "all" ||
    work !== "all" ||
    sort !== "featured";

  return (
    <div>
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_auto_auto_auto_auto]">
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
          <label className="flex min-h-12 items-center rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3">
            <span className="sr-only">Anime, show, game, or film</span>
            <select
              className="h-full min-w-44 bg-transparent text-sm font-bold outline-none"
              onChange={(event) => setWork(event.target.value)}
              value={work}
            >
              <option value="all">Every series &amp; world</option>
              {workOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
          <label className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3">
            <ArrowDownAZ aria-hidden="true" size={17} />
            <span className="sr-only">Sort recipes</span>
            <select
              className="h-full min-w-35 bg-transparent text-sm font-bold outline-none"
              onChange={(event) => setSort(event.target.value as typeof sort)}
              value={sort}
            >
              <option value="featured">Featured first</option>
              <option value="fastest">Fastest first</option>
              <option value="easiest">Easiest first</option>
              <option value="title">Title A–Z</option>
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
            {filtered.length} recipe preview{filtered.length === 1 ? "" : "s"}
            {work === "all" ? " across every featured world" : ` from ${work}`}
          </span>
          {hasFilters ? (
            <Button
              className="min-h-8 px-3"
              onClick={() => {
                setQuery("");
                setKind("all");
                setAccess("all");
                setWork("all");
                setSort("featured");
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
          <p className="display text-3xl">No recipe matches yet.</p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Try another title, series, world, or cooking-time sort.
          </p>
        </div>
      )}
    </div>
  );
}
