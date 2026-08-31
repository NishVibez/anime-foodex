"use client";

import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bell,
  Compass,
  Home,
  Library,
  Search,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = { href: Route; label: string; icon: LucideIcon };

const primary: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/recommend", label: "Pick my meal", icon: Sparkles },
];

const member: NavItem[] = [
  { href: "/vault", label: "Vault", icon: Library },
  { href: "/feed", label: "Following", icon: Users },
  { href: "/quests", label: "Quests", icon: Trophy },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

function NavLink({
  href,
  label,
  icon: Icon,
  compact,
}: NavItem & { compact?: boolean }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:outline-none",
        active
          ? "bg-[var(--ink)] text-[var(--paper)]"
          : "text-[var(--ink-muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)]",
        compact &&
          "flex-col justify-center gap-0.5 rounded-none px-1 text-[0.61rem]",
      )}
      href={href}
    >
      <Icon aria-hidden="true" size={compact ? 20 : 18} strokeWidth={2.3} />
      <span>{label}</span>
      {!compact && active ? (
        <span className="absolute -right-1 size-2.5 rotate-45 border-t border-r border-[var(--ink)] bg-[var(--saffron)]" />
      ) : null}
    </Link>
  );
}

export function DesktopNavigation() {
  return (
    <nav aria-label="Primary navigation" className="flex flex-col gap-1">
      <p className="mb-2 px-3 text-[0.62rem] font-black tracking-[0.18em] text-[var(--ink-faint)] uppercase">
        Explore
      </p>
      {primary.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
      <p className="mt-6 mb-2 px-3 text-[0.62rem] font-black tracking-[0.18em] text-[var(--ink-faint)] uppercase">
        Your table
      </p>
      {member.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}

export function MobileNavigation() {
  const visible = [primary[0], primary[1], primary[3], member[0]].filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  );
  return (
    <nav
      aria-label="Mobile navigation"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[var(--line)] bg-[color:var(--paper-raised)]/96 px-1 backdrop-blur-xl lg:hidden"
    >
      {visible.map((item) => (
        <NavLink compact key={item.href} {...item} />
      ))}
      <NavLink compact href="/search" icon={Search} label="Search" />
    </nav>
  );
}
