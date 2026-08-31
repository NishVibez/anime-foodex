import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Account unavailable",
  robots: { index: false, follow: false },
};

export default function IneligiblePage() {
  return (
    <section className="grid min-h-[70dvh] place-items-center px-5 text-center">
      <div className="max-w-lg">
        <ShieldCheck className="mx-auto text-[var(--jade)]" size={45} />
        <h1 className="display mt-6 text-5xl">
          The encyclopedia is still open.
        </h1>
        <p className="mt-4 text-[var(--ink-muted)]">
          An account is not available under the age rules for the country
          provided. Public recipe previews and discovery remain available
          without signing in.
        </p>
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "mt-7")}
          href="/discover"
        >
          <ArrowLeft size={17} /> Continue anonymously
        </Link>
      </div>
    </section>
  );
}
