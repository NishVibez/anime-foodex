import type { Metadata } from "next";
import { Bell, Eye, Palette } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { AccountControls } from "@/components/settings/account-controls";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <>
      <PageIntro
        description="Shape Anime FooDex around your kitchen: privacy, display, consent, notifications, account exports, and deletion are all under your control."
        eyebrow="Make the FooDex yours"
        title="Settings"
      />
      <div className="mx-auto max-w-4xl space-y-6 px-5 py-12 sm:px-8">
        {(
          [
            [
              Eye,
              "Profile privacy",
              "Public",
              "Choose public, followers-only, or private.",
            ],
            [
              Bell,
              "In-app notifications",
              "On",
              "Social and cooking notices only; no first-party email or push at GA.",
            ],
            [
              Palette,
              "Appearance",
              "System",
              "Light, dark, reduced motion, and unlocked cosmetic themes.",
            ],
          ] satisfies Array<[LucideIcon, string, string, string]>
        ).map(([Icon, title, value, body]) => (
          <section
            className="flex items-start gap-4 rounded-2xl border bg-[var(--paper-raised)] p-5"
            key={String(title)}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--wash)]">
              <Icon size={18} />
            </span>
            <div>
              <h2 className="font-black">{String(title)}</h2>
              <p className="mt-1 text-xs text-[var(--ink-faint)]">
                {String(body)}
              </p>
            </div>
            <button className="ml-auto rounded-full border px-3 py-1.5 text-xs font-black">
              {String(value)}
            </button>
          </section>
        ))}
        <AccountControls />
      </div>
    </>
  );
}
