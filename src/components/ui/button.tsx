import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-bold tracking-[-0.01em] transition-[transform,background-color,color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)] disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        primary:
          "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] shadow-[4px_4px_0_var(--vermilion)] hover:bg-[var(--vermilion)]",
        vermilion:
          "border-[var(--ink)] bg-[var(--vermilion)] text-white shadow-[4px_4px_0_var(--ink)] hover:bg-[#bd3d22]",
        outline:
          "border-[color:var(--line)] bg-[color:var(--paper-raised)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--paper)]",
        ghost:
          "border-transparent bg-transparent text-[var(--ink-muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)]",
        jade: "border-[var(--ink)] bg-[var(--jade)] text-white shadow-[4px_4px_0_var(--ink)] hover:bg-[#286a57]",
      },
      size: {
        default: "h-11",
        sm: "h-9 min-h-9 px-4 text-xs",
        lg: "h-13 min-h-13 px-7 text-base",
        icon: "size-11 min-h-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
