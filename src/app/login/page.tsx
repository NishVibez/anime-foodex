import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BookMarked,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { FoodexMark } from "@/components/brand/foodex-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { signInWithEmail, signInWithOAuth, signUpWithEmail } from "./actions";

export const metadata: Metadata = {
  title: "Sign in or create an account",
  description:
    "Join Anime FooDex with email, Google, or Discord to unlock recipes, saves, quests, and cooking progress.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/vault";
  const error = typeof params.error === "string" ? params.error : null;
  const notice = typeof params.notice === "string" ? params.notice : null;
  const mode = params.mode === "signup" ? "signup" : "signin";

  return (
    <section className="paper-grid grid min-h-[calc(100dvh-4.25rem)] place-items-center px-5 py-12">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-[var(--ink)] bg-[var(--paper-raised)] shadow-[9px_9px_0_var(--ink)] lg:grid-cols-[0.86fr_1.14fr]">
        <aside className="relative hidden overflow-hidden bg-[#181512] p-8 text-[#f7f0e3] lg:block">
          <div className="halftone absolute inset-0 opacity-15" />
          <div className="relative flex h-full flex-col">
            <FoodexMark className="size-12" />
            <p className="eyebrow mt-12 text-white/55">Bring the feast home</p>
            <h1 className="display mt-3 text-5xl leading-[0.92]">
              Find it. Save it. Cook it.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
              Turn the dishes you remember from anime and games into a personal
              cooking quest—with your own Vault, history, and achievements.
            </p>
            <div className="mt-auto grid gap-5 pt-16">
              {(
                [
                  [Sparkles, "Matches built around your pantry"],
                  [BookMarked, "Recipes, saves, and progress in one Vault"],
                  [ShieldCheck, "Private account details stay private"],
                ] satisfies Array<[LucideIcon, string]>
              ).map(([Icon, label]) => (
                <p
                  className="flex items-center gap-3 text-sm font-bold text-white/75"
                  key={String(label)}
                >
                  <Icon className="text-[var(--saffron)]" size={18} />{" "}
                  {String(label)}
                </p>
              ))}
            </div>
          </div>
        </aside>

        <div className="p-6 sm:p-10 lg:p-12">
          <Link
            className="inline-flex items-center gap-2 text-xs font-black text-[var(--ink-faint)]"
            href="/"
          >
            <ArrowLeft size={14} /> Back to Anime FooDex
          </Link>

          <p className="eyebrow mt-8 text-[var(--vermilion)]">
            {mode === "signup" ? "Start your food arc" : "Welcome back"}
          </p>
          <h2 className="display mt-2 text-4xl sm:text-5xl">
            {mode === "signup"
              ? "Build your Vault for free."
              : "Your table is waiting."}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--ink-muted)]">
            {mode === "signup"
              ? "Create an account to unlock standard recipes, save favorites, track what you cook, and join quests."
              : "Sign in to continue cooking, collecting, and discovering dishes from the worlds you love."}
          </p>

          <div className="mt-7 grid grid-cols-2 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-1">
            <Link
              className={cn(
                "grid min-h-11 place-items-center rounded-lg text-sm font-black",
                mode === "signin" && "bg-[var(--ink)] text-[var(--paper)]",
              )}
              href={`/login?mode=signin&next=${encodeURIComponent(next)}`}
            >
              Sign in
            </Link>
            <Link
              className={cn(
                "grid min-h-11 place-items-center rounded-lg text-sm font-black",
                mode === "signup" && "bg-[var(--ink)] text-[var(--paper)]",
              )}
              href={`/login?mode=signup&next=${encodeURIComponent(next)}`}
            >
              Create account
            </Link>
          </div>

          {error ? (
            <div className="mt-5 rounded-xl border border-[var(--vermilion)] bg-[var(--vermilion-soft)] p-4 text-sm font-bold">
              {error === "configuration"
                ? "Account services are not connected in this environment yet."
                : error === "callback"
                  ? "That sign-in link could not be completed. Please start again."
                  : "That email and password combination could not be used. Check the details and try again."}
            </div>
          ) : null}
          {notice === "check_email" ? (
            <div className="mt-5 rounded-xl border border-[var(--jade)] bg-[var(--jade-soft)] p-4 text-sm font-bold">
              Check your inbox to confirm the email address, then return here to
              sign in.
            </div>
          ) : null}

          <form
            action={mode === "signup" ? signUpWithEmail : signInWithEmail}
            className="mt-6 grid gap-4"
          >
            <input name="next" type="hidden" value={next} />
            <label className="grid gap-2 text-sm font-black">
              Email address
              <input
                autoComplete="email"
                className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 font-medium outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--focus)]/35"
                inputMode="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Password
              <input
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                className="min-h-12 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 font-medium outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--focus)]/35"
                minLength={8}
                name="password"
                placeholder="At least 8 characters"
                required
                type="password"
              />
            </label>
            <button
              className={cn(
                buttonVariants({ variant: "vermilion", size: "lg" }),
                "w-full",
              )}
              type="submit"
            >
              <LockKeyhole aria-hidden="true" size={17} />
              {mode === "signup"
                ? "Create my free account"
                : "Sign in with email"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[0.65rem] font-black tracking-[0.12em] text-[var(--ink-faint)] uppercase before:h-px before:flex-1 before:bg-[var(--line)] after:h-px after:flex-1 after:bg-[var(--line)]">
            or continue with
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {(["google", "discord"] as const).map((provider) => (
              <form action={signInWithOAuth} key={provider}>
                <input name="next" type="hidden" value={next} />
                <input name="provider" type="hidden" value={provider} />
                <button
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full justify-start rounded-xl capitalize",
                  )}
                  type="submit"
                >
                  <span
                    className={cn(
                      "grid size-7 place-items-center rounded-full border font-black",
                      provider === "discord" &&
                        "border-[#5865F2] bg-[#5865F2] text-white",
                    )}
                  >
                    {provider === "google" ? "G" : "D"}
                  </span>
                  {provider}
                </button>
              </form>
            ))}
          </div>

          <p className="mt-6 text-xs leading-relaxed text-[var(--ink-faint)]">
            New accounts complete a private country and age eligibility check.
            By continuing, you agree to the{" "}
            <Link className="underline" href="/policies/terms">
              Terms
            </Link>{" "}
            and acknowledge the{" "}
            <Link className="underline" href="/policies/privacy">
              Privacy Notice
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
