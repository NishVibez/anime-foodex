import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, WifiOff } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <section className="paper-grid grid min-h-[70dvh] place-items-center px-5 py-16 text-center">
      <div className="max-w-lg">
        <span className="mx-auto grid size-16 place-items-center rounded-full border border-[var(--ink)] bg-[var(--saffron)] text-[#181512] shadow-[5px_5px_0_var(--ink)]">
          <WifiOff size={26} />
        </span>
        <h1 className="display mt-7 text-5xl">The signal wandered off.</h1>
        <p className="mt-4 leading-relaxed text-[var(--ink-muted)]">
          Public previews you have already visited remain available. Authorized
          kitchen cards, active timers, and queued progress reconcile when you
          reconnect.
        </p>
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "mt-7")}
          href="/recipes"
        >
          Browse cached previews <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
