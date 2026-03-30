"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function fail(message: string): never {
  redirect(`/app/deals/new?error=${encodeURIComponent(message)}`);
}

export async function createDeal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  if (!title) {
    fail("Title is required.");
  }

  const brandRaw = (formData.get("brand_id") as string | null)?.trim() ?? "";
  const brand_id = brandRaw === "" ? null : brandRaw;

  const status =
    (formData.get("status") as string | null)?.trim() || "lead";

  const amountRaw = (formData.get("amount_cents") as string | null)?.trim() ?? "";
  const amount_cents =
    amountRaw === "" ? null : Number.parseInt(amountRaw, 10);
  if (
    amount_cents !== null &&
    (Number.isNaN(amount_cents) || amount_cents < 0)
  ) {
    fail("Amount must be a whole number of cents (or leave blank).");
  }

  const currency =
    (formData.get("currency") as string | null)?.trim() || "USD";

  const deliverable_summary =
    (formData.get("deliverable_summary") as string | null)?.trim() || null;
  const next_action_note =
    (formData.get("next_action_note") as string | null)?.trim() || null;

  const nextRaw = (formData.get("next_action_at") as string | null)?.trim() ?? "";
  let next_action_at: string | null = null;
  if (nextRaw) {
    const d = new Date(nextRaw);
    if (Number.isNaN(d.getTime())) {
      fail("Invalid next action date.");
    }
    next_action_at = d.toISOString();
  }

  const { data, error } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
      title,
      brand_id,
      status,
      amount_cents,
      currency,
      deliverable_summary,
      next_action_at,
      next_action_note,
    })
    .select("id")
    .single();

  if (error) {
    fail(error.message);
  }

  const newId = data?.id;
  if (!newId) {
    fail("Could not create deal.");
  }

  redirect(`/app/deals/${newId}`);
}
