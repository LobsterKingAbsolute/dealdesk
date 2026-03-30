import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

function formatMoney(cents: number | null, currency: string | null): string {
  if (cents == null) return "—";
  const code = currency && currency.trim() !== "" ? currency : "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${code}`;
  }
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: deal, error } = await supabase
    .from("deals")
    .select(
      "id, title, status, amount_cents, currency, deliverable_summary, next_action_at, next_action_note, created_at, brands ( name )"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <p className="text-destructive text-sm" role="alert">
          Could not load deal ({error.message}).
        </p>
        <Link
          href="/app/deals"
          className="text-primary text-sm underline underline-offset-4"
        >
          ← Back to deals
        </Link>
      </div>
    );
  }

  if (!deal) {
    notFound();
  }

  const b = deal.brands as
    | { name: string }
    | { name: string }[]
    | null
    | undefined;
  const brandRow = b == null ? null : Array.isArray(b) ? b[0] : b;
  const brandName = brandRow?.name ?? null;

  const rows: { label: string; value: string }[] = [
    { label: "Brand", value: brandName ?? "—" },
    { label: "Status", value: deal.status ? deal.status : "—" },
    {
      label: "Amount",
      value: formatMoney(deal.amount_cents, deal.currency),
    },
    {
      label: "Deliverable summary",
      value:
        deal.deliverable_summary && deal.deliverable_summary.trim() !== ""
          ? deal.deliverable_summary
          : "—",
    },
    {
      label: "Next action date",
      value: formatDateTime(deal.next_action_at),
    },
    {
      label: "Next action note",
      value:
        deal.next_action_note && deal.next_action_note.trim() !== ""
          ? deal.next_action_note
          : "—",
    },
    {
      label: "Created",
      value: formatDateTime(deal.created_at),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/app/deals"
          className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
        >
          ← Deals
        </Link>
        <h1 className="text-foreground mt-3 text-xl font-semibold tracking-tight">
          {deal.title}
        </h1>
      </div>

      <dl className="divide-border border-border divide-y border-y text-sm">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-4"
          >
            <dt className="text-muted-foreground font-medium">{label}</dt>
            <dd
              className={cn(
                "text-foreground whitespace-pre-wrap break-words",
                label === "Status" && "capitalize"
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
