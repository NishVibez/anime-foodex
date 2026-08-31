import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
  tone = "paper",
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
  tone?: "paper" | "ink" | "jade" | "saffron";
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-[var(--line)]",
        tone === "ink" && "bg-[var(--ink)] text-[var(--paper)]",
        tone === "jade" && "bg-[var(--jade)] text-white",
        tone === "saffron" && "bg-[var(--saffron)] text-[#181512]",
      )}
    >
      <div className="paper-grid absolute inset-0 opacity-25" />
      <div className="relative mx-auto grid max-w-[95rem] gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-4xl">
          <Badge tone={tone === "paper" ? "vermilion" : "paper"}>
            {eyebrow}
          </Badge>
          <h1 className="display mt-5 text-5xl leading-[0.9] sm:text-7xl lg:text-8xl">
            {title}
          </h1>
          <p
            className={cn(
              "mt-6 max-w-2xl text-base leading-relaxed sm:text-lg",
              tone === "paper"
                ? "text-[var(--ink-muted)]"
                : "text-current opacity-75",
            )}
          >
            {description}
          </p>
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
    </section>
  );
}
