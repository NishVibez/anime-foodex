import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";
import { collections } from "@/content/experience";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore five balanced primary collections across anime, animation, games, films, and themed worlds.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return (
    <>
      <PageIntro
        description="Jump from anime comfort food to game inventory classics, cinematic feasts, animated favorites, and destination treats—all without losing your place."
        eyebrow="Five ways into the FooDex"
        title="Every fandom brings something to the table."
      />
      <section className="mx-auto max-w-[95rem] px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {collections.map((collection, index) => {
            const Icon = collection.icon;
            return (
              <Link
                className="group relative min-h-80 overflow-hidden rounded-3xl border border-[var(--ink)] bg-[var(--paper-raised)] p-7 transition-transform motion-safe:hover:-translate-y-1"
                href={`/collections/${collection.key}`}
                key={collection.key}
              >
                <div className="halftone absolute right-0 bottom-0 size-48 opacity-18" />
                <span
                  className="grid size-14 place-items-center rounded-2xl border border-[var(--ink)] text-white shadow-[4px_4px_0_var(--ink)]"
                  style={{ background: collection.accent }}
                >
                  <Icon size={24} />
                </span>
                <p className="eyebrow mt-8 text-[var(--ink-faint)]">
                  Shelf {String(index + 1).padStart(2, "0")} ·{" "}
                  {collection.eyebrow}
                </p>
                <h2 className="display mt-2 text-4xl">{collection.label}</h2>
                <div className="mt-7 flex flex-wrap gap-2">
                  <Badge tone="paper">84+ recipe minimum</Badge>
                  <Badge tone="paper">200+ evidence gate</Badge>
                </div>
                <p className="mt-6 flex items-center gap-2 text-xs font-bold text-[var(--jade)]">
                  <CheckCircle2 size={15} /> Quota validator implemented
                </p>
                <ArrowRight className="absolute right-7 bottom-7 transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
