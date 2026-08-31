import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "ink" | "vermilion" | "jade" | "saffron" | "paper";
};

const tones = {
  ink: "bg-[var(--ink)] text-[var(--paper)]",
  vermilion: "bg-[var(--vermilion)] text-white",
  jade: "bg-[var(--jade)] text-white",
  saffron: "bg-[var(--saffron)] text-[var(--ink)]",
  paper:
    "border border-[var(--line)] bg-[var(--paper-raised)] text-[var(--ink-muted)]",
};

export function Badge({ className, tone = "paper", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-[0.67rem] font-extrabold tracking-[0.09em] uppercase",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
