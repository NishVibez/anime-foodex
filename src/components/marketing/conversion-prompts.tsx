"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Crown, Sparkles, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { AccessTier } from "@/domain/contracts";
import { cn } from "@/lib/utils";

const HIDDEN_ROUTES = [
  "/login",
  "/onboarding",
  "/pricing",
  "/cook",
  "/settings",
  "/studio",
  "/policies",
];

const DAY_MS = 24 * 60 * 60 * 1000;

function promptConfig(accessTier: AccessTier, pathname: string) {
  if (accessTier === "member") {
    return {
      storageKey: "anime-foodex:conversion:v1:supporter-dismissed-at",
      frequencyMs: 5 * DAY_MS,
      delayMs: 10_000,
      eyebrow: "Unlock the complete FooDex",
      title: "Keep every recipe within reach.",
      body: "Supporter opens every exclusive kitchen card, unlimited offline saves, advanced filters, and an ad-free experience—while funding new test cooks.",
      cta: "See Supporter plans",
      href: "/pricing" as Route,
      badge: "Supporter",
    };
  }

  return {
    storageKey: "anime-foodex:conversion:v1:signup-dismissed-at",
    frequencyMs: 3 * DAY_MS,
    delayMs: 7_000,
    eyebrow: "Your next food arc starts here",
    title: "Save the dishes you want to cook.",
    body: "Create a free account to unlock standard recipes, build your Vault, keep cooking history, and earn progress as you explore new worlds.",
    cta: "Create my free account",
    href: `/login?mode=signup&next=${encodeURIComponent(pathname)}` as Route,
    badge: "Free account",
  };
}

export function ConversionPrompts({ accessTier }: { accessTier: AccessTier }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const hidden =
    accessTier === "supporter" ||
    HIDDEN_ROUTES.some((route) => pathname.startsWith(route));
  const config = promptConfig(accessTier, pathname);

  useEffect(() => {
    if (hidden) return;

    let dismissedAt = 0;
    try {
      dismissedAt = Number(localStorage.getItem(config.storageKey) ?? 0);
    } catch {
      dismissedAt = 0;
    }
    if (Date.now() - dismissedAt < config.frequencyMs) return;

    const timer = window.setTimeout(() => setOpen(true), config.delayMs);
    return () => window.clearTimeout(timer);
  }, [config.delayMs, config.frequencyMs, config.storageKey, hidden]);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(config.storageKey, String(Date.now()));
    } catch {
      // A blocked storage API should never trap the visitor in a prompt loop.
    }
  }

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      dismiss();
      return;
    }

    if (event.key !== "Tab") return;
    const controls = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (!controls.length) return;
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  if (hidden || !open) return null;

  return (
    <div
      aria-describedby={descriptionId}
      aria-label="Anime FooDex invitation"
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-[90] grid items-end bg-black/55 p-3 backdrop-blur-[2px] sm:place-items-center sm:p-6"
      onKeyDown={handleDialogKeyDown}
      role="dialog"
    >
      <section className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-[var(--ink)] bg-[var(--paper-raised)] p-6 text-[var(--ink)] shadow-[8px_8px_0_var(--saffron)] sm:p-8">
        <div className="halftone pointer-events-none absolute inset-0 opacity-[0.07]" />
        <button
          aria-label="Dismiss invitation"
          className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--paper)] transition-colors hover:border-[var(--ink)]"
          onClick={dismiss}
          ref={closeButtonRef}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>

        <div className="relative pr-10">
          <Badge tone={accessTier === "member" ? "saffron" : "jade"}>
            {accessTier === "member" ? (
              <Crown aria-hidden="true" className="mr-1" size={12} />
            ) : (
              <Sparkles aria-hidden="true" className="mr-1" size={12} />
            )}
            {config.badge}
          </Badge>
          <p className="eyebrow mt-6 text-[var(--vermilion)]">
            {config.eyebrow}
          </p>
          <h2
            className="display mt-2 text-4xl leading-[0.95] sm:text-5xl"
            id={titleId}
          >
            {config.title}
          </h2>
          <p
            className="mt-4 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base"
            id={descriptionId}
          >
            {config.body}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              className={cn(
                buttonVariants({ variant: "vermilion", size: "lg" }),
                "flex-1",
              )}
              href={config.href}
              onClick={dismiss}
            >
              {config.cta} <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <button
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "text-[var(--ink-muted)]",
              )}
              onClick={dismiss}
              type="button"
            >
              Maybe later
            </button>
          </div>
          <p className="mt-4 text-[0.68rem] leading-relaxed text-[var(--ink-faint)]">
            Dismiss once and this invitation stays away for several days.
          </p>
        </div>
      </section>
    </div>
  );
}
