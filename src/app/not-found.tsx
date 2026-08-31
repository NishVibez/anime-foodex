import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <section className="paper-grid grid min-h-[70dvh] place-items-center px-5 py-20 text-center">
      <div>
        <p className="font-mono text-8xl font-black text-[var(--vermilion)]">
          404
        </p>
        <h1 className="display mt-3 text-5xl">That panel is empty.</h1>
        <p className="mx-auto mt-4 max-w-md text-[var(--ink-muted)]">
          The dish may have moved, retired, or never made it through editorial
          review.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className={cn(buttonVariants())} href="/">
            <ArrowLeft size={17} /> Go home
          </Link>
          <Link
            className={cn(buttonVariants({ variant: "outline" }))}
            href="/search"
          >
            <Search size={17} /> Search the FooDex
          </Link>
        </div>
      </div>
    </section>
  );
}
