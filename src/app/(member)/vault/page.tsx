import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookHeart,
  Clock3,
  Download,
  FolderHeart,
  NotebookPen,
  WifiOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CollectionForm } from "@/components/community/collection-form";
import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Vault",
  robots: { index: false, follow: false },
};

export default async function VaultPage() {
  const viewer = await requireViewer("/vault");
  const supabase = await createClient();
  const [collectionsResult, savesResult, cooksResult, progressResult] =
    await Promise.all([
      supabase
        .from("my_collections")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("my_saves")
        .select("*")
        .order("saved_at", { ascending: false }),
      supabase
        .from("my_cook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase.from("my_progress").select("*").maybeSingle(),
    ]);
  const collections = collectionsResult.data ?? [];
  const saves = savesResult.data ?? [];
  const cooks = cooksResult.data ?? [];
  const progress = progressResult.data;
  return (
    <>
      <PageIntro
        aside={
          <div className="font-mono text-xs font-black">
            LEVEL {String(progress?.level ?? 1).padStart(2, "0")} ·{" "}
            {progress?.total_xp ?? 0} XP
          </div>
        }
        description="Everything you want to cook, everything you already made, and every note you want to remember—saved privately in one place."
        eyebrow="Your personal cooklist"
        title="The Vault"
      />
      <div className="mx-auto max-w-[95rem] space-y-12 px-5 py-12 sm:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          {(
            [
              [
                BookHeart,
                `${saves.length} saved`,
                "Recipes waiting for a night in",
              ],
              [
                FolderHeart,
                viewer.accessTier === "supporter"
                  ? `${collections.length} collections`
                  : `${collections.length} of 5 collections`,
                "Private shelves and shareable lists",
              ],
              [
                Clock3,
                `${cooks.length} recent cooks`,
                "Versioned history and private notes",
              ],
            ] satisfies Array<[LucideIcon, string, string]>
          ).map(([Icon, value, label]) => (
            <div
              className="rounded-2xl border bg-[var(--paper-raised)] p-5"
              key={String(value)}
            >
              <Icon className="text-[var(--vermilion)]" size={22} />
              <p className="display mt-6 text-3xl">{String(value)}</p>
              <p className="mt-1 text-sm text-[var(--ink-faint)]">
                {String(label)}
              </p>
            </div>
          ))}
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-[var(--vermilion)]">Ready offline</p>
              <h2 className="display mt-2 text-4xl">Kitchen cards</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CollectionForm />
              <Badge tone="jade">
                <WifiOff className="mr-1" size={12} /> private cache
              </Badge>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {saves.slice(0, 3).map((recipe) => (
              <article
                className="rounded-2xl border bg-[var(--paper-raised)] p-5"
                key={recipe.recipe_id}
              >
                <div className="flex items-center justify-between">
                  <Badge tone={recipe.offline_requested ? "saffron" : "jade"}>
                    {recipe.offline_requested ? "offline requested" : "saved"}
                  </Badge>
                  <Download className="text-[var(--jade)]" size={17} />
                </div>
                <h3 className="display mt-5 text-2xl">{recipe.title}</h3>
                <p className="mt-2 text-xs text-[var(--ink-faint)]">
                  Authorized details remain subject to the current offline
                  lease.
                </p>
                <Link
                  className="mt-5 inline-flex items-center gap-2 text-xs font-black underline"
                  href={`/recipes/${recipe.slug}`}
                >
                  Open preview <ArrowRight size={14} />
                </Link>
              </article>
            ))}
            <Link
              className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-[var(--ink-faint)] p-5 text-center"
              href="/recipes"
            >
              <span>
                <BookHeart className="mx-auto" />
                <span className="mt-3 block text-sm font-black">
                  Save another recipe
                </span>
              </span>
            </Link>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
          <div className="rounded-3xl border bg-[var(--paper-raised)] p-6">
            <p className="eyebrow text-[var(--jade)]">Recent cooks</p>
            <div className="mt-5 divide-y">
              {cooks.slice(0, 5).map((recipe, index) => (
                <div className="flex items-center gap-4 py-4" key={recipe.id}>
                  <span className="grid size-10 place-items-center rounded-full bg-[var(--wash)] font-mono text-xs font-black">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-black">{recipe.title}</p>
                    <p className="text-xs text-[var(--ink-faint)]">
                      Cook log · private by default
                    </p>
                  </div>
                  <Badge className="ml-auto" tone="paper">
                    {recipe.completed_at ? "complete" : "started"}
                  </Badge>
                </div>
              ))}
              {!cooks.length ? (
                <p className="py-8 text-center text-sm text-[var(--ink-faint)]">
                  No cooking history yet.
                </p>
              ) : null}
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--ink)] bg-[var(--saffron-soft)] p-6">
            <NotebookPen className="text-[var(--vermilion)]" />
            <h2 className="display mt-5 text-3xl">Notes stay yours.</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
              Private recipe notes are never copied to community posts or
              search. Account export includes them; deletion removes them.
            </p>
            <Link
              className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
              href="/settings"
            >
              Privacy settings
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
