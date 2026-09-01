import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  Crown,
  Download,
  FolderHeart,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { safeRelativePath } from "@/lib/http/safe-path";
import { requireViewer } from "@/lib/auth/viewer";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Signed in",
  robots: { index: false, follow: false },
};

const memberBenefits = [
  [BookOpenCheck, "Full standard recipes", "Quantities, steps, timers, and cooking mode"],
  [FolderHeart, "Five private collections", "Organize a personal cooklist and share selected collections"],
  [Download, "Time-limited offline saves", "Keep selected recipes ready for the kitchen"],
  [Users, "Community and quests", "Follow cooks, post results, earn XP, and unlock achievements"],
] satisfies Array<[LucideIcon, string, string]>;

const supporterBenefits = [
  [Crown, "Every recipe unlocked", "Standard and Supporter-exclusive recipes and collections"],
  [FolderHeart, "Unlimited collections", "Build as many private shelves and cooklists as you like"],
  [Download, "Unlimited offline saves", "Keep your authorized kitchen library ready offline"],
  [Trophy, "The complete game layer", "Supporter rewards, cosmetics, XP advantages, and no ads"],
] satisfies Array<[LucideIcon, string, string]>;

export default async function WelcomePage({
  searchParams,
}: PageProps<"/welcome">) {
  const viewer = await requireViewer("/welcome");
  const params = await searchParams;
  const next = safeRelativePath(params.next);
  const supporter = viewer.accessTier === "supporter";
  const benefits = supporter ? supporterBenefits : memberBenefits;

  return (
    <section className="paper-grid px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[var(--ink)] bg-[var(--paper-raised)] shadow-[8px_8px_0_var(--ink)]">
        <div
          className={cn(
            "grid gap-7 border-b border-[var(--ink)] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end",
            supporter ? "bg-[var(--saffron-soft)]" : "bg-[var(--jade-soft)]",
          )}
        >
          <div>
            <span
              className={cn(
                "grid size-14 place-items-center rounded-full border border-[var(--ink)] text-white shadow-[3px_3px_0_var(--ink)]",
                supporter ? "bg-[var(--saffron)]" : "bg-[var(--jade)]",
              )}
            >
              {supporter ? <Crown size={25} /> : <Check size={27} />}
            </span>
            <p className="eyebrow mt-7 text-[var(--vermilion)]">
              Signed in successfully
            </p>
            <h1 className="display mt-2 text-4xl sm:text-6xl">
              {supporter
                ? "Your complete FooDex is open."
                : "Welcome back to your table."}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
              {supporter
                ? "Your Supporter access is active. Exclusive recipes, unlimited offline cooking, cosmetics, and an ad-free experience are ready now."
                : "Your Member account is active. Your recipes, Vault, cooking history, community, and quests are ready now."}
            </p>
          </div>
          <Badge
            className="w-fit px-3 py-2 text-xs"
            tone={supporter ? "saffron" : "jade"}
          >
            {supporter ? <Crown className="mr-1.5" size={13} /> : <ShieldCheck className="mr-1.5" size={13} />}
            {supporter
              ? viewer.entitlementLifetime
                ? "Lifetime Supporter"
                : "Supporter"
              : "Free Member"}
          </Badge>
        </div>

        <div className="p-7 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-[var(--jade)]">Available now</p>
              <h2 className="display mt-2 text-3xl">What your account unlocks</h2>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-[var(--ink-faint)]">
              Access is checked securely on the server and updates automatically
              when an entitlement changes.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {benefits.map(([Icon, title, description]) => (
              <article
                className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5"
                key={title}
              >
                <Icon
                  className={supporter ? "text-[var(--vermilion)]" : "text-[var(--jade)]"}
                  size={21}
                />
                <h3 className="mt-5 font-black">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-faint)]">
                  {description}
                </p>
              </article>
            ))}
          </div>

          {!supporter ? (
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--saffron)] bg-[var(--saffron-soft)] p-5 sm:flex-row sm:items-center">
              <Sparkles className="shrink-0 text-[var(--vermilion)]" size={23} />
              <div>
                <p className="font-black">Supporter recipes remain previews.</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">
                  Upgrade whenever you want every recipe, unlimited offline saves,
                  unlimited collections, supporter cosmetics, and no ads.
                </p>
              </div>
              <Link
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "shrink-0 sm:ml-auto",
                )}
                href="/pricing"
              >
                Compare plans
              </Link>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className={cn(
                buttonVariants({
                  variant: supporter ? "vermilion" : "jade",
                  size: "lg",
                }),
                "sm:min-w-52",
              )}
              href={next as Route}
            >
              {next === "/vault" ? "Open my Vault" : "Continue"}
              <ArrowRight size={17} />
            </Link>
            <Link
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              href="/recipes"
            >
              Browse recipes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
