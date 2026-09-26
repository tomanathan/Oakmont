import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { googleConfig, googleRedirectUri, safeNext, GOOGLE_STATE_COOKIE } from "@/lib/googleAuth";

// Step 1 of "Continue with Google": remember a one-time state and nonce in a
// short-lived cookie, then send the browser to Google's account chooser.
export async function GET(req: NextRequest) {
  const cfg = googleConfig();
  if (!cfg) {
    const back = req.nextUrl.searchParams.get("as") === "parent" ? "/parent/login?error=google" : "/login?error=google";
    return NextResponse.redirect(new URL(back, req.url));
  }

  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(24).toString("base64url");
  const q = req.nextUrl.searchParams;
  const next = safeNext(q.get("next"));
  // ?as=parent: a parent account instead of a student's, optionally with
  // what the parent signup form collects (student code, student name, time
  // zone), or the setup token from a "finish setting up" email.
  const parent =
    q.get("as") === "parent"
      ? {
          code: (q.get("code") ?? "").trim().toUpperCase().slice(0, 16) || null,
          name: (q.get("name") ?? "").trim().slice(0, 40) || null,
          tz: (q.get("tz") ?? "").slice(0, 64) || null,
          setup: (q.get("setup") ?? "").slice(0, 128) || null,
        }
      : null;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: googleRedirectUri(req.nextUrl.origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
    prompt: "select_account",
  }).toString();

  const res = NextResponse.redirect(url);
  res.cookies.set(GOOGLE_STATE_COOKIE, JSON.stringify({ state, nonce, next, parent }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax, not strict: the callback is a top-level redirect back from Google.
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 10 * 60,
  });
  return res;
}
