"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      aria-label={
        mounted && resolvedTheme === "dark"
          ? "Use light appearance"
          : "Use dark appearance"
      }
      className="border-[var(--line)]"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      size="icon"
      type="button"
      variant="ghost"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun aria-hidden="true" size={18} />
      ) : (
        <Moon aria-hidden="true" size={18} />
      )}
    </Button>
  );
}
