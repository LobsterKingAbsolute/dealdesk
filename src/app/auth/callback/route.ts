import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function safeAppPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/app";
  if (next === "/app" || next.startsWith("/app/")) return next;
  return "/app";
}

function parseOtpType(raw: string | null): EmailOtpType | null {
  if (!raw) return null;
  return OTP_TYPES.includes(raw as EmailOtpType) ? (raw as EmailOtpType) : null;
}

function loginRedirect(
  origin: string,
  reason: "missing" | "pkce" | "exchange" | "auth"
) {
  const u = new URL("/login", origin);
  u.searchParams.set("error", "callback");
  u.searchParams.set("reason", reason);
  return NextResponse.redirect(u);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = safeAppPath(url.searchParams.get("next"));

  const authErr = url.searchParams.get("error");
  if (authErr) {
    return loginRedirect(url.origin, "auth");
  }

  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const typeRaw = url.searchParams.get("type");
  const otpType = parseOtpType(typeRaw);

  if (!code && !(token_hash && otpType)) {
    return loginRedirect(url.origin, "missing");
  }

  const redirectTarget = new URL(nextPath, url.origin).toString();
  const successResponse = NextResponse.redirect(redirectTarget);

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            successResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const msg = error.message.toLowerCase();
      const pkceHint =
        msg.includes("verifier") || msg.includes("non-empty");
      return loginRedirect(url.origin, pkceHint ? "pkce" : "exchange");
    }
  } else if (token_hash && otpType) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: otpType,
    });
    if (error) {
      return loginRedirect(url.origin, "exchange");
    }
  }

  return successResponse;
}
