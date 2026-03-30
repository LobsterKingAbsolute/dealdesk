import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: deal, error } = await supabase
    .from("deals")
    .select(
      "id, title, status, amount_cents, currency, next_action_at, next_action_note, brands ( name )"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <div className="mx-auto max-w-lg space-y-3">
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

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/app/deals"
          className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
        >
          ← Deals
        </Link>
        <h1 className="mt-3 text-lg font-semibold tracking-tight">
          {deal.title}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm capitalize">
          {deal.status}
          {brandName ? ` · ${brandName}` : ""}
        </p>
      </div>
      <dl className="text-muted-foreground space-y-2 text-sm">
        <div>
          <dt className="text-foreground font-medium">Next action</dt>
          <dd>
            {deal.next_action_at
              ? new Date(deal.next_action_at).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })
              : "—"}
          </dd>
          {deal.next_action_note ? (
            <dd className="mt-1">{deal.next_action_note}</dd>
          ) : null}
        </div>
      </dl>
      <p className="text-muted-foreground text-xs">
        Full deal editor coming later — this page confirms the row link works.
      </p>
    </div>
  );
}
