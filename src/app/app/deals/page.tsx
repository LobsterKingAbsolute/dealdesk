import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

/** Supabase may return an object or a one-element array for many-to-one embeds. */
type BrandJoin = { name: string } | { name: string }[] | null;

type DealRow = {
  id: string;
  title: string;
  status: string;
  amount_cents: number | null;
  currency: string | null;
  next_action_at: string | null;
  brands: BrandJoin;
};

function brandLabel(brands: BrandJoin): string {
  if (!brands) return "—";
  const row = Array.isArray(brands) ? brands[0] : brands;
  return row?.name ?? "—";
}

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

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default async function DealsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select(
      "id, title, status, amount_cents, currency, next_action_at, brands ( name )"
    )
    .order("updated_at", { ascending: false });

  const deals = (data ?? []) as unknown as DealRow[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Deals</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your pipeline — one row per deal.
          </p>
        </div>
        <Link
          href="/app/deals/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors"
        >
          New deal
        </Link>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Could not load deals ({error.message}).
        </p>
      ) : deals.length === 0 ? (
        <div className="text-muted-foreground bg-muted/30 rounded-lg border border-border px-4 py-8 text-center text-sm">
          <p>No deals yet.</p>
          <p className="mt-2">
            <Link
              href="/app/deals/new"
              className="text-foreground font-medium underline underline-offset-4"
            >
              Create your first deal
            </Link>
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="px-3 py-2.5 font-medium">Title</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Brand</th>
                <th className="px-3 py-2.5 font-medium">Amount</th>
                <th className="px-3 py-2.5 font-medium">Next action</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr
                  key={deal.id}
                  className="border-border hover:bg-muted/20 border-b border-border last:border-b-0"
                >
                  <td className="px-3 py-2.5 align-middle">
                    <Link
                      href={`/app/deals/${deal.id}`}
                      className="text-foreground font-medium hover:underline"
                    >
                      {deal.title}
                    </Link>
                  </td>
                  <td className="text-muted-foreground px-3 py-2.5 align-middle capitalize">
                    {deal.status}
                  </td>
                  <td className="text-muted-foreground px-3 py-2.5 align-middle">
                    {brandLabel(deal.brands)}
                  </td>
                  <td className="text-muted-foreground px-3 py-2.5 align-middle tabular-nums">
                    {formatMoney(deal.amount_cents, deal.currency)}
                  </td>
                  <td className="text-muted-foreground px-3 py-2.5 align-middle whitespace-nowrap">
                    {formatDate(deal.next_action_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
