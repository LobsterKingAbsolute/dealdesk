import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { createDeal } from "./actions";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const STATUS_OPTIONS = [
  "lead",
  "proposal",
  "negotiation",
  "signed",
  "completed",
  "lost",
] as const;

export default async function NewDealPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name")
    .order("name", { ascending: true });

  const params = await searchParams;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/app/deals"
          className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
        >
          ← Deals
        </Link>
        <h1 className="mt-3 text-lg font-semibold tracking-tight">New deal</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Required fields are marked. Everything else is optional.
        </p>
      </div>

      {params.error ? (
        <p className="text-destructive text-sm" role="alert">
          {params.error}
        </p>
      ) : null}

      <form action={createDeal} className="flex flex-col gap-4 text-sm">
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground font-medium">
            Title <span className="text-destructive">*</span>
          </span>
          <input
            name="title"
            type="text"
            required
            autoComplete="off"
            className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground font-medium">Brand</span>
          <select
            name="brand_id"
            className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
          >
            <option value="">None</option>
            {(brands ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground font-medium">Status</span>
          <select
            name="status"
            defaultValue="lead"
            className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground font-medium">
              Amount (cents)
            </span>
            <input
              name="amount_cents"
              type="number"
              min={0}
              step={1}
              placeholder="e.g. 50000"
              className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-foreground font-medium">Currency</span>
            <input
              name="currency"
              type="text"
              defaultValue="USD"
              maxLength={8}
              className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground font-medium">
            Deliverable summary
          </span>
          <textarea
            name="deliverable_summary"
            rows={3}
            className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground font-medium">Next action date</span>
          <input
            name="next_action_at"
            type="datetime-local"
            className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-foreground font-medium">Next action note</span>
          <textarea
            name="next_action_note"
            rows={2}
            className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 outline-none focus-visible:ring-2"
          />
        </label>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors"
        >
          Save deal
        </button>
      </form>
    </div>
  );
}
