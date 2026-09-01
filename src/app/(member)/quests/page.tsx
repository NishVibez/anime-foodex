import type { Metadata } from "next";
import {
  Check,
  Crown,
  Flame,
  LockKeyhole,
  Sparkles,
  Trophy,
} from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Quests",
  robots: { index: false, follow: false },
};

const quests = [
  {
    title: "Cook a dish from a new shelf",
    progress: 1,
    goal: 1,
    xp: 80,
    kind: "daily",
  },
  {
    title: "Use a regional substitution",
    progress: 0,
    goal: 1,
    xp: 60,
    kind: "daily",
  },
  {
    title: "Cook across three worlds",
    progress: 2,
    goal: 3,
    xp: 240,
    kind: "weekly",
  },
  {
    title: "Share two helpful reviews",
    progress: 1,
    goal: 2,
    xp: 180,
    kind: "weekly",
  },
];

export default function QuestsPage() {
  return (
    <>
      <PageIntro
        aside={
          <Badge tone="saffron">
            <Flame className="mr-1" size={12} /> 12-day streak
          </Badge>
        }
        description="Cook across new worlds, build streaks, earn XP, and unlock rewards. Every quest gives you a fresh reason to try one more dish."
        eyebrow="Your next cooking challenge"
        title="Make progress taste good."
        tone="ink"
      />
      <section className="mx-auto grid max-w-[95rem] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-4">
          {quests.map((quest) => {
            const complete = quest.progress >= quest.goal;
            return (
              <article
                className="rounded-2xl border bg-[var(--paper-raised)] p-5"
                key={quest.title}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-full border ${complete ? "bg-[var(--jade)] text-white" : "bg-[var(--wash)]"}`}
                  >
                    {complete ? <Check size={19} /> : <Trophy size={18} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={quest.kind === "daily" ? "vermilion" : "saffron"}
                      >
                        {quest.kind}
                      </Badge>
                      <span className="ml-auto font-mono text-xs font-black">
                        +{quest.xp} XP
                      </span>
                    </div>
                    <h2 className="mt-3 font-black">{quest.title}</h2>
                    <div className="mt-4 h-2 overflow-hidden rounded-full border bg-[var(--paper)]">
                      <div
                        className="h-full bg-[var(--jade)]"
                        style={{
                          width: `${Math.min(100, (quest.progress / quest.goal) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-[var(--ink-faint)]">
                      {quest.progress} / {quest.goal} · awards once
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <aside className="rounded-3xl border border-[var(--ink)] bg-[var(--saffron-soft)] p-6 lg:sticky lg:top-24 lg:h-fit">
          <Sparkles className="text-[var(--vermilion)]" />
          <h2 className="display mt-5 text-3xl">Supporter multiplier</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
            Supporters receive a disclosed 10% competitive XP multiplier.
            Friends-only leaderboards show a crown marker so the advantage is
            never hidden.
          </p>
          <div className="mt-5 flex items-center gap-2 rounded-xl border bg-[var(--paper-raised)] p-3 text-sm font-black">
            <Crown size={17} className="text-[var(--saffron)]" /> 100 base → 110
            XP
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-[var(--ink-faint)]">
            <LockKeyhole size={14} /> Calculated on the server
          </p>
        </aside>
      </section>
    </>
  );
}
