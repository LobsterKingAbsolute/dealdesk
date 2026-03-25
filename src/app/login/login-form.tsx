"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Props = {
  error?: string;
  reason?: string;
};

const CALLBACK_HELP: Record<string, string> = {
  pkce:
    "Open the link in the same browser where you requested it. The Gmail app’s built-in browser often cannot complete sign-in—copy the link and paste it into Chrome, Edge, or Safari instead.",
  missing:
    "That sign-in link was missing a token or has expired. Request a new magic link.",
  exchange: "Sign-in could not be completed. Request a new magic link.",
  auth: "Sign-in was cancelled or denied. Try again.",
};

export function LoginForm({ error, reason }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setStatus("loading");

    const supabase = createClient();
    const origin = window.location.origin;
    // Keep this URL exactly matchable in Supabase Dashboard → Redirect URLs (no query string).
    const emailRedirectTo = new URL("/auth/callback", origin).toString();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo,
      },
    });

    if (signInError) {
      setMessage(signInError.message);
      setStatus("idle");
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4">
      <div>
        <h1 className="text-lg font-medium tracking-tight">Sign in</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          We&apos;ll email you a magic link.
        </p>
      </div>

      {(error === "callback" || message) && (
        <p className="text-destructive text-sm" role="alert">
          {error === "callback"
            ? reason && CALLBACK_HELP[reason]
              ? CALLBACK_HELP[reason]
              : "Sign-in failed. Request a new magic link."
            : message}
        </p>
      )}

      {status === "sent" ? (
        <p className="text-muted-foreground text-sm">
          Check your email for the magic link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 text-base outline-none focus-visible:ring-2"
            />
          </label>
          <Button type="submit" disabled={status === "loading"} className="w-full">
            {status === "loading" ? "Sending…" : "Send magic link"}
          </Button>
        </form>
      )}
    </div>
  );
}
