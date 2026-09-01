"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function PasswordField({
  autoComplete,
}: {
  autoComplete: "current-password" | "new-password";
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="grid gap-2 text-sm font-black">
      <label htmlFor="password">Password</label>
      <span className="relative block">
        <input
          autoComplete={autoComplete}
          className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 pr-24 font-medium outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--focus)]/35"
          id="password"
          minLength={8}
          name="password"
          placeholder="At least 8 characters"
          required
          type={visible ? "text" : "password"}
        />
        <button
          aria-controls="password"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className={cn(
            "absolute top-1/2 right-2 inline-flex min-h-9 -translate-y-1/2 items-center gap-1.5 rounded-lg px-2.5 text-xs font-black text-[var(--ink-muted)]",
            "transition-colors hover:bg-[var(--wash)] hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:outline-none",
          )}
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? (
            <EyeOff aria-hidden="true" size={16} />
          ) : (
            <Eye aria-hidden="true" size={16} />
          )}
          {visible ? "Hide" : "Show"}
        </button>
      </span>
    </div>
  );
}
