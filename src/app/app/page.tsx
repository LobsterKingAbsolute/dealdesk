import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

async function fetchDashboardCounts() {
  const supabase = await createClient();
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nowIso = now.toISOString();
  const weekEndIso = weekEnd.toISOString();

  const [
    { count: activeDeals, error: e1 },
    { count: dueThisWeek, error: e2 },
    { count: overduePayments, error: e3 },
    { count: missingNextAction, error: e4 },
  ] = await Promise.all([
    supabase
      .from("deals")
      .select("*", { count: "exact", head: true })
      .neq("status", "lost")
      .neq("status", "paid"),
    supabase
      .from("deals")
      .select("*", { count: "exact", head: true })
      .gte("next_action_at", nowIso)
      .lte("next_action_at", weekEndIso),
    supabase
      .from("deals")
      .select("*", { count: "exact", head: true })
      .lt("payment_due_at", nowIso)
      .is("paid_at", null),
    supabase
      .from("deals")
      .select("*", { count: "exact", head: true })
      .is("next_action_at", null),
  ]);

  const err = e1 ?? e2 ?? e3 ?? e4;
  if (err) {
    console.error("Dashboard counts:", err);
    return {
      activeDeals: 0,
      dueThisWeek: 0,
      overduePayments: 0,
      missingNextAction: 0,
    };
  }

  return {
    activeDeals: activeDeals ?? 0,
    dueThisWeek: dueThisWeek ?? 0,
    overduePayments: overduePayments ?? 0,
    missingNextAction: missingNextAction ?? 0,
  };
}

export default async function AppDashboardPage() {
  const {
    activeDeals,
    dueThisWeek,
    overduePayments,
    missingNextAction,
  } = await fetchDashboardCounts();

  const metrics = [
    {
      title: "Active deals",
      value: activeDeals,
      description: "Open pipeline items.",
    },
    {
      title: "Due this week",
      value: dueThisWeek,
      description: "Tasks and follow-ups ending soon.",
    },
    {
      title: "Overdue payments",
      value: overduePayments,
      description: "Expected payments past due.",
    },
    {
      title: "Missing next action",
      value: missingNextAction,
      description: "Deals without a scheduled step.",
    },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Snapshot of your desk — counts reflect your deals.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map(({ title, value, description }) => (
          <Card key={title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-3xl font-semibold tabular-nums tracking-tight">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
