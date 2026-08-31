import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Checkout received",
  robots: { index: false, follow: false },
};

export default function BillingSuccessPage() {
  return (
    <section className="paper-grid grid min-h-[70dvh] place-items-center px-5 text-center">
      <div className="max-w-lg">
        <CheckCircle2 className="mx-auto text-[var(--jade)]" size={52} />
        <h1 className="display mt-6 text-5xl">Checkout received.</h1>
        <p className="mt-4 leading-relaxed text-[var(--ink-muted)]">
          Supporter access appears after a signed payment webhook is verified
          and the entitlement ledger applies it. Refreshing this page cannot
          fabricate access.
        </p>
        <Link
          className={cn(buttonVariants({ variant: "jade" }), "mt-7")}
          href="/vault"
        >
          Return to the Vault <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
