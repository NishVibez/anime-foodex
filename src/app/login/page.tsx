import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { FoodexMark } from "@/components/brand/foodex-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { signInWithOAuth } from "./actions";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Anime FooDex with Google or Discord.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/vault";
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <section className="paper-grid grid min-h-[calc(100dvh-4.25rem)] place-items-center px-5 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--ink)] bg-[var(--paper-raised)] shadow-[9px_9px_0_var(--ink)] lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="relative hidden overflow-hidden bg-[var(--ink)] p-8 text-[var(--paper)] lg:block">
          <div className="halftone absolute inset-0 opacity-15" />
          <div className="relative flex h-full flex-col">
            <FoodexMark className="size-12" />
            <p className="eyebrow mt-12 text-white/50">Your table remembers</p>
            <h1 className="display mt-3 text-5xl leading-[0.92]">
              Save the dish. Cook the arc.
            </h1>
            <div className="mt-auto grid gap-5 pt-16">
              {(
                [
                  [Sparkles, "Deterministic recommendations"],
                  [LockKeyhole, "Private notes and collections"],
                  [ShieldCheck, "Age-aware social privacy"],
                ] satisfies Array<[LucideIcon, string]>
              ).map(([Icon, label]) => (
                <p
                  className="flex items-center gap-3 text-sm font-bold text-white/70"
                  key={String(label)}
                >
                  <Icon className="text-[var(--saffron)]" size={18} />{" "}
                  {String(label)}
                </p>
              ))}
            </div>
          </div>
        </aside>
        <div className="p-6 sm:p-10 lg:p-14">
          <Link
            className="inline-flex items-center gap-2 text-xs font-black text-[var(--ink-faint)]"
            href="/"
          >
            <ArrowLeft size={14} /> Back to the encyclopedia
          </Link>
          <p className="eyebrow mt-10 text-[var(--vermilion)]">
            Welcome to the Vault
          </p>
          <h2 className="display mt-2 text-4xl sm:text-5xl">
            Choose your sign-in.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--ink-muted)]">
            Google and Discord are the only GA providers. Anime FooDex never
            exposes your provider email, birth date, billing identity, or
            precise location on your profile.
          </p>

          {error ? (
            <div className="mt-6 rounded-xl border border-[var(--vermilion)] bg-[var(--vermilion-soft)] p-4 text-sm font-bold">
              {error === "configuration"
                ? "OAuth is ready in code but Supabase credentials are not connected in this environment yet."
                : "Sign-in could not be completed. Please try again."}
            </div>
          ) : null}

          <div className="mt-8 grid gap-3">
            <form action={signInWithOAuth}>
              <input name="next" type="hidden" value={next} />
              <input name="provider" type="hidden" value="google" />
              <button
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full justify-start rounded-xl",
                )}
                type="submit"
              >
                <span className="grid size-7 place-items-center rounded-full border font-black">
                  G
                </span>
                Continue with Google
              </button>
            </form>
            <form action={signInWithOAuth}>
              <input name="next" type="hidden" value={next} />
              <input name="provider" type="hidden" value="discord" />
              <button
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full justify-start rounded-xl",
                )}
                type="submit"
              >
                <span className="grid size-7 place-items-center rounded-full bg-[#5865F2] text-xs font-black text-white">
                  D
                </span>
                Continue with Discord
              </button>
            </form>
          </div>

          <p className="mt-7 text-xs leading-relaxed text-[var(--ink-faint)]">
            First sign-in continues to a private country and date-of-birth
            eligibility check. By continuing, you agree to the{" "}
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
