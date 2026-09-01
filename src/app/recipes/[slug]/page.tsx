import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  ChefHat,
  Clock3,
  Crown,
  Eye,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Signal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { featuredRecipes, findRecipe } from "@/content/experience";
import { getViewer } from "@/lib/auth/viewer";
import { absoluteUrl, cn, formatMinutes } from "@/lib/utils";

type RecipePageProps = PageProps<"/recipes/[slug]">;

export function generateStaticParams() {
  return featuredRecipes.map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = findRecipe(slug);
  if (!recipe) return {};

  return {
    title: recipe.title,
    description: recipe.teaser,
    alternates: { canonical: `/recipes/${recipe.slug}` },
    openGraph: {
      type: "article",
      title: recipe.title,
      description: recipe.teaser,
      images: ["/anime-foodex-hero.webp"],
    },
  };
}

export default async function RecipePreviewPage({ params }: RecipePageProps) {
  const { slug } = await params;
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const recipe = findRecipe(slug);
  if (!recipe) notFound();
  const viewer = await getViewer();
  const canCook =
    viewer &&
    (recipe.access === "standard" || viewer.accessTier === "supporter");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: recipe.title,
    description: recipe.teaser,
    url: absoluteUrl(`/recipes/${recipe.slug}`),
    isPartOf: { "@type": "WebSite", name: "Anime FooDex", url: absoluteUrl() },
    about: [recipe.dish, recipe.work],
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        nonce={nonce}
        type="application/ld+json"
      />
      <article>
        <header className="relative overflow-hidden border-b border-[var(--ink)] bg-[#181512] text-white">
          <div className="absolute inset-0 opacity-34">
            <Image
              alt=""
              className="object-cover blur-[1px]"
              fill
              priority
              sizes="100vw"
              src="/anime-foodex-hero.webp"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/35" />
          </div>
          <div className="relative mx-auto grid min-h-[33rem] max-w-[95rem] items-end gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_22rem]">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2">
                <Badge
                  tone={recipe.access === "supporter" ? "saffron" : "jade"}
                >
                  {recipe.access === "supporter" ? (
                    <Crown className="mr-1" size={12} />
                  ) : null}
                  {recipe.access}
                </Badge>
                <Badge
                  className="border-white/25 bg-black/30 text-white"
                  tone="paper"
                >
                  {recipe.kind.replace("_", " ")}
                </Badge>
              </div>
              <p className="eyebrow mt-6 text-[var(--saffron)]">
                {recipe.connectionLabel} {recipe.work}
              </p>
              <h1 className="display mt-2 text-5xl leading-[0.87] sm:text-7xl lg:text-8xl">
                {recipe.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                {recipe.teaser}
              </p>
              <div className="mt-7 flex flex-wrap gap-5 text-sm font-bold text-white/70">
                <span className="flex items-center gap-2">
                  <Clock3 size={17} /> {formatMinutes(recipe.minutes)}
                </span>
                <span className="flex items-center gap-2">
                  <Signal size={17} /> {recipe.difficulty}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={17} /> Four regional guides
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/25 bg-black/45 p-5 backdrop-blur-md">
              <p className="eyebrow text-[var(--saffron)]">
                Why fans know this dish
              </p>
              <p className="mt-2 text-lg font-black text-white">
                {recipe.work}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                {recipe.context}
              </p>
              <div className="mt-5 flex items-center gap-2 border-t border-white/15 pt-4 text-xs font-bold text-white/60">
                <BookOpenCheck size={16} /> Source connection reviewed before
                publication
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[95rem] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-16">
          <div>
            <section aria-labelledby="preview-heading">
              <p className="eyebrow text-[var(--vermilion)]">
                Your next cooking quest
              </p>
              <h2 className="display mt-2 text-4xl" id="preview-heading">
                Bring the scene to your table
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-[var(--ink-muted)]">
                {recipe.teaser} Unlock the kitchen card for scalable quantities,
                step timers, equipment, regional substitutions, allergen notes,
                and a distraction-free mode that stays with you while you cook.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} tone="paper">
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>

            <section
              aria-labelledby="locked-heading"
              className="relative mt-10 overflow-hidden rounded-3xl border border-[var(--ink)] bg-[var(--paper-raised)]"
            >
              <div
                aria-hidden="true"
                className="p-7 opacity-18 blur-[4px] select-none sm:p-10"
              >
                <p className="display text-3xl">Ingredients</p>
                <div className="mt-5 grid gap-3">
                  {Array.from({ length: 7 }, (_, index) => (
                    <div
                      className="flex justify-between border-b py-2"
                      key={index}
                    >
                      <span>Structured ingredient</span>
                      <span>quantity</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 grid place-items-center bg-[color:var(--paper-raised)]/72 p-6 text-center backdrop-blur-[2px]">
                <div className="max-w-md">
                  <span className="mx-auto grid size-13 place-items-center rounded-full border border-[var(--ink)] bg-[var(--saffron)] text-[#181512] shadow-[4px_4px_0_var(--ink)]">
                    <LockKeyhole size={22} />
                  </span>
                  <h2 className="display mt-6 text-3xl" id="locked-heading">
                    Ready to cook the full version?
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                    {recipe.access === "supporter"
                      ? `Supporter unlocks this ${recipe.work} recipe, every quantity and step, regional substitutions, and unlimited offline cooking.`
                      : `Create a free account to cook the complete ${recipe.work} recipe, save it to your Vault, and keep your progress.`}
                  </p>
                  <Link
                    className={cn(
                      buttonVariants({ variant: "vermilion" }),
                      "mt-6",
                    )}
                    href={
                      canCook
                        ? `/cook/${recipe.slug}`
                        : recipe.access === "supporter"
                          ? "/pricing"
                          : `/login?next=${encodeURIComponent(`/recipes/${recipe.slug}`)}`
                    }
                  >
                    {canCook
                      ? "Open cooking mode"
                      : recipe.access === "supporter"
                        ? "Unlock with Supporter"
                        : "Create free account"}
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-raised)] p-5">
              <p className="eyebrow text-[var(--jade)]">Publication checks</p>
              <div className="mt-4 grid gap-4">
                {(
                  [
                    [
                      ShieldCheck,
                      "Allergen summary",
                      "Required before publication",
                    ],
                    [ChefHat, "Kitchen test", "Human sign-off recorded"],
                    [Eye, "Media rights", "Original or licensed only"],
                  ] satisfies Array<[LucideIcon, string, string]>
                ).map(([Icon, title, body]) => (
                  <div
                    className="grid grid-cols-[1.8rem_1fr] gap-2"
                    key={String(title)}
                  >
                    <Icon className="mt-0.5 text-[var(--jade)]" size={18} />
                    <div>
                      <p className="text-sm font-black">{String(title)}</p>
                      <p className="mt-0.5 text-xs text-[var(--ink-faint)]">
                        {String(body)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--saffron-soft)] p-5">
              <p className="text-sm font-black">See something wrong?</p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ink-muted)]">
                Food context, allergens, rights, and preparation safety can all
                be corrected with a versioned audit trail.
              </p>
              <Link
                className="mt-4 inline-flex items-center gap-1 text-xs font-black underline"
                href="/policies/takedown"
              >
                Request a correction <ArrowRight size={13} />
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
