import type { Route } from "next";
import Link from "next/link";
import { Clock3, Crown, Signal } from "lucide-react";

import type { EditorialRecipe } from "@/content/experience";
import { Badge } from "@/components/ui/badge";
import { formatMinutes } from "@/lib/utils";

const colorMap = {
  vermilion: {
    panel: "bg-[var(--vermilion-soft)]",
    mark: "bg-[var(--vermilion)]",
  },
  jade: { panel: "bg-[var(--jade-soft)]", mark: "bg-[var(--jade)]" },
  saffron: {
    panel: "bg-[var(--saffron-soft)]",
    mark: "bg-[var(--saffron)]",
  },
  ink: { panel: "bg-[var(--wash)]", mark: "bg-[var(--ink)]" },
};

export function RecipeCard({ recipe }: { recipe: EditorialRecipe }) {
  const colors = colorMap[recipe.color];
  const href = `/recipes/${recipe.slug}` as Route;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] transition-[transform,box-shadow,border-color] hover:border-[var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] motion-safe:hover:-translate-y-1">
      <Link
        aria-label={`View ${recipe.title}`}
        className={`relative block h-38 overflow-hidden border-b border-[var(--line)] ${colors.panel}`}
        href={href}
      >
        <div className="halftone absolute inset-0 opacity-25" />
        <div className="absolute -right-7 -bottom-12 size-44 rounded-full border-2 border-[var(--ink)] bg-[var(--paper-raised)] shadow-[inset_0_0_0_10px_var(--paper-deep)]" />
        <div
          className={`absolute right-8 bottom-7 size-20 rotate-[-8deg] rounded-[38%_62%_54%_46%] border-2 border-[var(--ink)] ${colors.mark} shadow-[4px_4px_0_var(--ink)] transition-transform motion-safe:group-hover:scale-105 motion-safe:group-hover:rotate-0`}
        />
        <span className="absolute bottom-4 left-4 rounded-full border border-[var(--ink)] bg-[var(--paper-raised)] px-3 py-1 text-[0.65rem] font-black tracking-[0.12em] uppercase">
          {recipe.kind.replace("_", " ")}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Badge tone={recipe.access === "supporter" ? "saffron" : "jade"}>
            {recipe.access === "supporter" ? (
              <Crown aria-hidden="true" className="mr-1" size={12} />
            ) : null}
            {recipe.access}
          </Badge>
          <span className="text-right text-[0.65rem] font-black tracking-[0.08em] text-[var(--ink-faint)] uppercase">
            {recipe.connectionLabel}
          </span>
        </div>
        <p className="mb-2 text-sm font-black text-[var(--vermilion)]">
          {recipe.work}
        </p>
        <h3 className="display text-xl leading-tight">
          <Link href={href}>{recipe.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--ink-muted)]">
          {recipe.teaser}
        </p>
        <div className="mt-auto flex items-center gap-4 pt-5 text-xs font-bold text-[var(--ink-faint)]">
          <span className="flex items-center gap-1.5">
            <Clock3 aria-hidden="true" size={15} />
            {formatMinutes(recipe.minutes)}
          </span>
          <span className="flex items-center gap-1.5">
            <Signal aria-hidden="true" size={15} />
            {recipe.difficulty}
          </span>
        </div>
      </div>
    </article>
  );
}
