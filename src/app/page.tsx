import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  Check,
  ChefHat,
  Flame,
  MapPin,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import { RecipeCard } from "@/components/recipes/recipe-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { activity, collections, featuredRecipes } from "@/content/experience";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="paper-grid absolute inset-0 opacity-45" />
        <div className="relative mx-auto grid max-w-[95rem] gap-8 px-5 py-9 sm:px-8 sm:py-14 xl:grid-cols-[0.9fr_1.1fr] xl:items-center xl:py-18">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <Badge tone="vermilion">New encyclopedia</Badge>
              <span className="text-xs font-bold tracking-[0.08em] text-[var(--ink-faint)] uppercase">
                Original recipes · Evidence-led context
              </span>
            </div>
            <h1 className="display max-w-4xl text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.84]">
              Every world has a{" "}
              <span className="text-[var(--vermilion)]">table.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
              Discover the food moments you remember, then cook an independently
              authored version designed for a real kitchen—wherever yours is.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className={cn(
                  buttonVariants({ variant: "vermilion", size: "lg" }),
                )}
                href="/discover"
              >
                Explore the FooDex <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                )}
                href="/recommend"
              >
                <Sparkles aria-hidden="true" size={18} /> What should I eat?
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[var(--ink-faint)]">
              {[
                "Metric + imperial",
                "4 availability regions",
                "Hard allergen exclusions",
              ].map((item) => (
                <span className="flex items-center gap-1.5" key={item}>
                  <Check
                    aria-hidden="true"
                    className="text-[var(--jade)]"
                    size={15}
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative min-h-[26rem] xl:min-h-[39rem]">
            <div className="absolute inset-0 rotate-1 overflow-hidden rounded-[2rem_0.75rem_2rem_0.75rem] border-2 border-[var(--ink)] bg-[var(--ink)] shadow-[10px_10px_0_var(--vermilion)]">
              <Image
                alt="An original editorial spread of ramen, onigiri, castella, fruit parfait, tea, and vegetable curry"
                className="object-cover object-center"
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 55vw"
                src="/anime-foodex-hero.webp"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 text-white">
                <div>
                  <p className="eyebrow text-white/70">Tonight’s spread</p>
                  <p className="mt-1 text-xl font-black">
                    Five dishes. Five paths in.
                  </p>
                </div>
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-white/60 bg-black/30 backdrop-blur">
                  <UtensilsCrossed aria-hidden="true" size={21} />
                </span>
              </div>
            </div>
            <div className="absolute -top-4 -right-2 rotate-3 rounded-xl border-2 border-[var(--ink)] bg-[var(--saffron)] px-4 py-3 text-[var(--ink)] shadow-[4px_4px_0_var(--ink)] sm:right-8">
              <p className="text-[0.6rem] font-black tracking-[0.14em] uppercase">
                Cooking streak
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-lg font-black">
                <Flame aria-hidden="true" size={20} /> 12 days
              </p>
            </div>
            <div className="absolute -bottom-4 left-2 -rotate-2 rounded-xl border-2 border-[var(--ink)] bg-[var(--paper-raised)] p-4 shadow-[4px_4px_0_var(--ink)] sm:left-8">
              <p className="flex items-center gap-2 text-sm font-black">
                <MapPin
                  aria-hidden="true"
                  className="text-[var(--vermilion)]"
                  size={18}
                />
                Pantry set to India
              </p>
              <p className="mt-1 text-xs text-[var(--ink-faint)]">
                8 smart swaps ready
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Catalog targets"
        className="border-b border-[#181512] bg-[#181512] text-[#f7f0e3]"
      >
        <div className="mx-auto grid max-w-[95rem] grid-cols-2 divide-x divide-white/15 px-5 sm:px-8 md:grid-cols-4">
          {[
            ["420+", "GA recipe minimum"],
            ["1,000+", "verified appearances"],
            ["5", "balanced collections"],
            ["4", "availability regions"],
          ].map(([value, label]) => (
            <div className="px-4 py-6 text-center" key={label}>
              <p className="display text-3xl text-[var(--saffron)] sm:text-4xl">
                {value}
              </p>
              <p className="mt-1 text-[0.63rem] font-bold tracking-[0.1em] text-white/65 uppercase">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[95rem] px-5 py-16 sm:px-8 sm:py-22">
        <SectionHeading
          action={{ href: "/collections", label: "All collections" }}
          eyebrow="Five shelves · one encyclopedia"
          title="Choose your doorway"
        />
        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {collections.map((collection, index) => {
            const Icon = collection.icon;
            return (
              <Link
                className="group relative min-h-60 overflow-hidden rounded-2xl border border-[var(--ink)] bg-[var(--paper-raised)] p-5 transition-transform motion-safe:hover:-translate-y-1"
                href={`/collections/${collection.key}`}
                key={collection.key}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ background: collection.accent }}
                />
                <span className="absolute top-4 right-4 font-mono text-xs font-black text-[var(--ink-faint)]">
                  0{index + 1}
                </span>
                <span
                  className="mt-7 grid size-12 place-items-center rounded-full border border-[var(--ink)] text-white shadow-[3px_3px_0_var(--ink)]"
                  style={{ background: collection.accent }}
                >
                  <Icon aria-hidden="true" size={21} />
                </span>
                <p className="eyebrow mt-8 text-[var(--ink-faint)]">
                  {collection.eyebrow}
                </p>
                <h3 className="display mt-1 text-2xl leading-none">
                  {collection.label}
                </h3>
                <div className="mt-6 flex items-center gap-3 text-xs font-bold text-[var(--ink-faint)]">
                  <span>{collection.count} recipes</span>
                  <span aria-hidden="true">·</span>
                  <span>{collection.evidence}+ links</span>
                </div>
                <ArrowRight
                  aria-hidden="true"
                  className="absolute right-5 bottom-5 transition-transform motion-safe:group-hover:translate-x-1"
                  size={18}
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--paper-deep)]">
        <div className="mx-auto max-w-[95rem] px-5 py-16 sm:px-8 sm:py-22">
          <SectionHeading
            action={{ href: "/recipes", label: "Browse every recipe" }}
            eyebrow="From our test bench"
            title="Cook the moment"
          />
          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--vermilion)] text-white">
        <div className="halftone absolute inset-0 opacity-25" />
        <div className="relative mx-auto grid max-w-[95rem] gap-10 px-5 py-16 sm:px-8 sm:py-22 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="eyebrow text-white/75">
              Signature recommendation flow
            </p>
            <h2 className="display mt-3 max-w-3xl text-5xl leading-[0.9] sm:text-7xl">
              Tell us what&apos;s in the fridge.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              We hard-exclude allergens and dislikes, then rank the rest by your
              time, mood, skill, region, and available ingredients. Two close
              matches. One safe wildcard. Reasons included.
            </p>
            <Link
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "mt-8 border-white bg-white text-[#181512] hover:bg-[var(--saffron)]",
              )}
              href="/recommend"
            >
              Find tonight&apos;s dish{" "}
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
          <div className="ink-panel rotate-1 p-5 text-[var(--ink)] sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2 font-black">
                <ChefHat aria-hidden="true" size={20} /> Your match card
              </span>
              <Badge tone="jade">92% fit</Badge>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--jade-soft)] p-5">
              <p className="eyebrow text-[var(--jade)]">Top choice</p>
              <p className="display mt-1 text-3xl">Forest picnic onigiri</p>
              <div className="mt-4 grid gap-2 text-sm text-[var(--ink-muted)]">
                <p className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 shrink-0 text-[var(--jade)]"
                    size={16}
                  />
                  Uses 6 ingredients already in your pantry
                </p>
                <p className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 shrink-0 text-[var(--jade)]"
                    size={16}
                  />
                  Vegetarian filling and a 35-minute window
                </p>
                <p className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 shrink-0 text-[var(--jade)]"
                    size={16}
                  />
                  Includes a tested short-grain rice alternative for India
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-[var(--ink-faint)] p-4">
              <div>
                <p className="text-xs font-black tracking-[0.1em] uppercase">
                  Safe wildcard
                </p>
                <p className="mt-1 font-bold">Starlight berry parfait</p>
              </div>
              <Sparkles aria-hidden="true" className="text-[var(--saffron)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[95rem] gap-10 px-5 py-16 sm:px-8 sm:py-22 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <SectionHeading
            eyebrow="Around the table"
            title="Cook. Post. Cheer."
          />
          <div className="mt-8 grid gap-3">
            {activity.map((item) => (
              <article
                className="flex gap-4 rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] p-4 sm:p-5"
                key={`${item.user}-${item.action}`}
              >
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--ink)] font-black text-white"
                  style={{ background: item.accent }}
                >
                  {item.user[0]}
                </span>
                <div className="min-w-0">
                  <p className="text-sm">
                    <strong>{item.user}</strong> {item.action}
                  </p>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    {item.detail}
                  </p>
                </div>
                <span className="ml-auto shrink-0 text-xs font-bold text-[var(--ink-faint)]">
                  {item.time}
                </span>
              </article>
            ))}
          </div>
          <Link
            className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
            href="/feed"
          >
            Visit the following feed
          </Link>
        </div>

        <aside className="rounded-3xl border border-[var(--ink)] bg-[var(--ink)] p-6 text-[var(--paper)] shadow-[8px_8px_0_var(--saffron)] sm:p-8">
          <ShieldCheck className="text-[var(--saffron)]" size={35} />
          <p className="eyebrow mt-6 text-white/60">The publication promise</p>
          <h2 className="display mt-2 text-4xl leading-none">
            Context is cited. Cooking is tested.
          </h2>
          <div className="mt-7 grid gap-5">
            {[
              [
                "1",
                "Occurrence evidence",
                "A precise locator proves the food moment.",
              ],
              [
                "2",
                "Independent recipe",
                "Facts inform it; copied cookbook prose never does.",
              ],
              [
                "3",
                "Kitchen + safety review",
                "A human test, allergen pass, and clear method.",
              ],
              [
                "4",
                "Rights-cleared media",
                "Original or licensed imagery with an audit trail.",
              ],
            ].map(([number, title, body]) => (
              <div className="grid grid-cols-[2rem_1fr] gap-3" key={number}>
                <span className="font-mono text-lg font-black text-[var(--saffron)]">
                  {number}
                </span>
                <div>
                  <p className="font-black">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/62">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            className="mt-8 inline-flex items-center gap-2 text-sm font-black text-[var(--saffron)] underline decoration-2"
            href="/policies/editorial"
          >
            Read the editorial standard{" "}
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </aside>
      </section>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { href: Route; label: string };
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow text-[var(--vermilion)]">{eyebrow}</p>
        <h2 className="display mt-2 text-4xl leading-none sm:text-6xl">
          {title}
        </h2>
      </div>
      {action ? (
        <Link
          className="inline-flex items-center gap-2 text-sm font-black underline decoration-2"
          href={action.href}
        >
          {action.label} <ArrowRight aria-hidden="true" size={16} />
        </Link>
      ) : null}
    </div>
  );
}
