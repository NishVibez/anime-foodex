import Link from "next/link";
import { Crown, Search, Vault } from "lucide-react";

import { FoodexMark } from "@/components/brand/foodex-mark";
import { ConversionPrompts } from "@/components/marketing/conversion-prompts";
import {
  DesktopNavigation,
  MobileNavigation,
} from "@/components/shell/navigation";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AccessTier } from "@/domain/contracts";

export function SiteShell({
  accessTier,
  children,
}: {
  accessTier: AccessTier;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <a
        className="sr-only z-[100] rounded bg-[#181512] px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        href="#main-content"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[var(--line)] bg-[color:var(--paper-raised)] px-4 py-5 lg:flex">
        <Link
          aria-label="Anime FooDex home"
          className="mb-8 flex items-center gap-3 rounded-xl p-2 focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:outline-none"
          href="/"
        >
          <FoodexMark />
          <span>
            <span className="block font-[family-name:var(--font-display)] text-xl leading-none font-black tracking-[-0.05em]">
              Anime FooDex
            </span>
            <span className="mt-1 block text-[0.58rem] font-bold tracking-[0.13em] text-[var(--ink-faint)] uppercase">
              Fandom food encyclopedia
            </span>
          </span>
        </Link>

        <DesktopNavigation />

        <div className="mt-auto rounded-2xl border border-[var(--ink)] bg-[var(--saffron-soft)] p-4 shadow-[4px_4px_0_var(--ink)]">
          <Badge tone="ink">
            {accessTier === "guest" ? "Free Vault" : "Quest board"}
          </Badge>
          <p className="mt-3 text-sm leading-snug font-extrabold">
            {accessTier === "guest"
              ? "Save recipes and turn cooking into a collection."
              : "Choose a fresh challenge for your next dish."}
          </p>
          <Link
            className="mt-3 inline-flex text-xs font-black underline"
            href={accessTier === "guest" ? "/login?mode=signup" : "/quests"}
          >
            {accessTier === "guest" ? "Create free account" : "View my quests"}
          </Link>
        </div>
      </aside>

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[color:var(--paper)]/90 backdrop-blur-xl">
          <div className="mx-auto flex h-17 max-w-[95rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Link
              aria-label="Anime FooDex home"
              className="flex items-center gap-2 lg:hidden"
              href="/"
            >
              <FoodexMark className="size-9" />
              <span className="font-[family-name:var(--font-display)] text-lg font-black tracking-[-0.05em]">
                Anime FooDex
              </span>
            </Link>

            <Link
              className="ml-auto hidden min-h-10 w-full max-w-md items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--paper-raised)] px-4 text-sm text-[var(--ink-faint)] transition-colors hover:border-[var(--ink)] lg:flex"
              href="/search"
            >
              <Search aria-hidden="true" size={17} />
              Search dishes, works, ingredients…
              <kbd className="ml-auto rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[0.65rem]">
                /
              </kbd>
            </Link>

            <ThemeToggle />
            {accessTier === "guest" ? (
              <Link
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden sm:inline-flex",
                )}
                href="/login"
              >
                Sign in
              </Link>
            ) : (
              <Link
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                href="/vault"
              >
                <Vault aria-hidden="true" size={15} /> My Vault
              </Link>
            )}
            {accessTier !== "supporter" ? (
              <Link
                className={cn(
                  buttonVariants({ variant: "vermilion", size: "sm" }),
                  "px-4",
                )}
                href="/pricing"
              >
                <Crown aria-hidden="true" size={15} />
                Go Supporter
              </Link>
            ) : (
              <Badge tone="saffron">
                <Crown aria-hidden="true" className="mr-1" size={12} />
                Supporter
              </Badge>
            )}
          </div>
        </header>

        <main id="main-content">{children}</main>
        <Footer />
      </div>

      <MobileNavigation />
      <ConversionPrompts accessTier={accessTier} />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mb-17 border-t border-[var(--line)] bg-[var(--paper-raised)] lg:mb-0">
      <div className="mx-auto grid max-w-[95rem] gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <FoodexMark className="size-8" />
            <span className="font-[family-name:var(--font-display)] text-lg font-black">
              Anime FooDex
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--ink-muted)]">
            Find the food you remember from anime, games, films, and animated
            worlds—then cook an independently developed version made for a real
            kitchen.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-black">Explore</p>
          <div className="grid gap-2 text-[var(--ink-muted)]">
            <Link href="/collections">Collections</Link>
            <Link href="/works">Works</Link>
            <Link href="/ingredients">Ingredients</Link>
            <Link href="/studio">Editorial Studio</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-black">Trust</p>
          <div className="grid gap-2 text-[var(--ink-muted)]">
            <Link href="/policies/editorial">Editorial standard</Link>
            <Link href="/policies/privacy">Privacy</Link>
            <Link href="/policies/terms">Terms</Link>
            <Link href="/policies/takedown">Takedowns</Link>
            <p className="pt-2 text-xs leading-relaxed">
              Fan-made and independent. Not affiliated with featured studios,
              publishers, or game creators.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
