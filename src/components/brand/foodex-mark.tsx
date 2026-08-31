import { cn } from "@/lib/utils";

export function FoodexMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-grid size-10 shrink-0 place-items-center rounded-[42%_58%_58%_42%/48%_38%_62%_52%] border-2 border-[var(--ink)] bg-[var(--vermilion)] shadow-[3px_3px_0_var(--saffron)]",
        className,
      )}
    >
      <span className="absolute size-5 rounded-full border-2 border-[var(--paper)]" />
      <span className="absolute h-0.5 w-4 rotate-45 bg-[var(--paper)]" />
      <span className="absolute h-0.5 w-4 -rotate-45 bg-[var(--paper)]" />
    </span>
  );
}
