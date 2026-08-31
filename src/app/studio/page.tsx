import type { Metadata } from "next";
import {
  Activity,
  BookOpenCheck,
  ChefHat,
  CircleAlert,
  FileClock,
  Gauge,
  Gavel,
  Image,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";
import { requireStudioAccess } from "@/lib/auth/studio";

export const metadata: Metadata = {
  title: "Editorial Studio",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const queues = [
  [BookOpenCheck, "Source intake", 18, "quarantine + locator extraction"],
  [FileClock, "Editorial review", 42, "draft and evidence checks"],
  [ChefHat, "Culinary testing", 31, "kitchen sessions due"],
  [Gavel, "Rights review", 27, "media and IP approval"],
  [Image, "Media approval", 14, "sanitized originals only"],
  [Megaphone, "Moderation", 6, "owner action required"],
  [Users, "Users", 2, "appeals and restrictions"],
  [Gauge, "Billing & ads", 0, "reconciliation healthy"],
] as const;

export default async function StudioPage() {
  await requireStudioAccess();
  return (
    <>
      <PageIntro
        aside={
          <Badge tone="saffron">
            <ShieldCheck className="mr-1" size={12} /> Staff only
          </Badge>
        }
        description="A role-gated operating console for evidence, culinary review, rights, moderation, publication, billing, advertising, and immutable audit history."
        eyebrow="Operations"
        title="Editorial Studio"
        tone="ink"
      />
      <div className="mx-auto max-w-[95rem] space-y-10 px-5 py-12 sm:px-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {queues.map(([Icon, label, count, detail]) => (
            <article
              className="rounded-2xl border bg-[var(--paper-raised)] p-5"
              key={label}
            >
              <div className="flex items-start justify-between">
                <Icon className="text-[var(--vermilion)]" size={21} />
                <span className="font-mono text-2xl font-black">{count}</span>
              </div>
              <h2 className="mt-8 font-black">{label}</h2>
              <p className="mt-1 text-xs text-[var(--ink-faint)]">{detail}</p>
            </article>
          ))}
        </section>
        <section className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
          <div className="rounded-3xl border bg-[var(--paper-raised)] p-6">
            <p className="eyebrow text-[var(--jade)]">GA content gate</p>
            <h2 className="display mt-2 text-4xl">
              Blocked until every check is real.
            </h2>
            <div className="mt-6 grid gap-4">
              {[
                ["Recipes", "0 / 420 publishable"],
                ["Appearances", "0 / 1,000 verified"],
                ["Collection balance", "fixture passes; review gate fails"],
                ["Protected source leakage", "0 permitted"],
              ].map(([label, value]) => (
                <div
                  className="flex items-center gap-4 border-b pb-3"
                  key={label}
                >
                  <span className="text-sm font-bold">{label}</span>
                  <span className="ml-auto font-mono text-xs text-[var(--ink-faint)]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <aside className="rounded-3xl border border-[var(--vermilion)] bg-[var(--vermilion-soft)] p-6">
            <CircleAlert className="text-[var(--vermilion)]" />
            <h2 className="display mt-5 text-3xl">Fail closed</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
              If automated moderation is unavailable, rate-limited, or no longer
              no-cost, content enters the owner queue. It never auto-publishes.
            </p>
            <p className="mt-5 flex items-center gap-2 text-xs font-black">
              <Activity size={15} /> Audit sampling enabled
            </p>
          </aside>
        </section>
      </div>
    </>
  );
}
