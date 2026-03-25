import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PLACEHOLDER = "—";

const metrics = [
  {
    title: "Active deals",
    value: PLACEHOLDER,
    description: "Open pipeline items.",
  },
  {
    title: "Due this week",
    value: PLACEHOLDER,
    description: "Tasks and follow-ups ending soon.",
  },
  {
    title: "Overdue payments",
    value: PLACEHOLDER,
    description: "Expected payments past due.",
  },
  {
    title: "Missing next action",
    value: PLACEHOLDER,
    description: "Deals without a scheduled step.",
  },
] as const;

export default function AppDashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Snapshot of your desk — real counts will come from your data.
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
