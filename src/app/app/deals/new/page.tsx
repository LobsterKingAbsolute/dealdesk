import Link from "next/link";

export default function NewDealPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">New deal</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          A create form will live here. For now, add deals in Supabase Table
          Editor or wait for the next iteration.
        </p>
      </div>
      <Link
        href="/app/deals"
        className="text-primary text-sm font-medium underline underline-offset-4"
      >
        ← Back to deals
      </Link>
    </div>
  );
}
