import Link from "next/link";

import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/app/actions";

type AppShellProps = {
  email: string;
  children: React.ReactNode;
};

export function AppShell({ email, children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-4">
        <Link
          href="/app"
          className="text-foreground text-sm font-semibold tracking-tight"
        >
          DealDesk
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="text-muted-foreground truncate text-sm"
            title={email}
          >
            {email}
          </span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)] flex-1">
        <AppNav />
        <main className="bg-background flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
