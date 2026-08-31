import type { Metadata } from "next";
import { CalendarDays, Globe2, LockKeyhole, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

import { completeOnboarding } from "./actions";

export const metadata: Metadata = {
  title: "Account eligibility",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage({
  searchParams,
}: PageProps<"/onboarding">) {
  const params = await searchParams;
  const next =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/vault";
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <section className="paper-grid grid min-h-[calc(100dvh-4.25rem)] place-items-center px-5 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-[var(--ink)] bg-[var(--paper-raised)] p-6 shadow-[8px_8px_0_var(--jade)] sm:p-9">
        <span className="grid size-12 place-items-center rounded-full bg-[var(--jade)] text-white">
          <ShieldCheck size={22} />
        </span>
        <p className="eyebrow mt-7 text-[var(--jade)]">
          Private eligibility check
        </p>
        <h1 className="display mt-2 text-4xl">Before your profile opens.</h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--ink-muted)]">
          We use a self-declared country and birth date to apply the correct
          account and social minimum. Neither field appears publicly. No ID,
          biometric, or document is collected.
        </p>
        {error ? (
          <p className="mt-5 rounded-xl border border-[var(--vermilion)] bg-[var(--vermilion-soft)] p-3 text-sm font-bold">
            We could not complete that check. Verify both fields and try again.
          </p>
        ) : null}
        <form action={completeOnboarding} className="mt-7 grid gap-5">
          <input name="next" type="hidden" value={next} />
          <label>
            <span className="mb-2 flex items-center gap-2 text-sm font-black">
              <Globe2 size={17} /> Country
            </span>
            <select
              className="min-h-12 w-full rounded-xl border bg-[var(--paper)] px-4"
              name="country"
              required
            >
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="JP">Japan</option>
              <option value="AU">Australia</option>
            </select>
          </label>
          <label>
            <span className="mb-2 flex items-center gap-2 text-sm font-black">
              <CalendarDays size={17} /> Date of birth
            </span>
            <input
              className="min-h-12 w-full rounded-xl border bg-[var(--paper)] px-4"
              max={new Date().toISOString().slice(0, 10)}
              name="birthDate"
              required
              type="date"
            />
          </label>
          <Button size="lg" type="submit" variant="jade">
            <LockKeyhole size={18} /> Check privately and continue
          </Button>
        </form>
        <p className="mt-5 text-xs leading-relaxed text-[var(--ink-faint)]">
          Account creation requires at least age 13 globally, the applicable
          13–16 threshold in Europe, and age 18 in India because
          parental-consent support is not offered. Social access additionally
          requires age 14+.
        </p>
      </div>
    </section>
  );
}
