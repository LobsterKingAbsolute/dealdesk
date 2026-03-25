"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; exact?: boolean };

const links: NavItem[] = [
  { href: "/app", label: "Dashboard", exact: true },
  { href: "/app/deals", label: "Deals" },
  { href: "/app/inbox", label: "Inbox" },
  { href: "/app/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 border-r border-border bg-muted/20">
      <nav
        className="flex flex-col gap-0.5 p-3"
        aria-label="Main navigation"
      >
        {links.map(({ href, label, exact }) => {
          const active =
            exact === true ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors",
                active && "bg-muted text-foreground font-medium"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
