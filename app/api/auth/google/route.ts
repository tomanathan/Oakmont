import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { googleConfig, googleRedirectUri, safeNext, GOOGLE_STATE_COOKIE } from "@/lib/googleAuth";

// Step 1 of "Continue with Google": remember a one-time state and nonce in a
// short-lived cookie, then send the browser to Google's account chooser.
export async function GET(req: NextRequest) {
  const cfg = googleConfig();
  if (!cfg) return NextResponse.redirect(new URL("/login?error=google", req.url));

  const state = randomBytes(24).toString("base64url");
  const nonce = randomBytes(24).toString("base64url");
  const next = safeNext(req.nextUrl.searchParams.get("next"));

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
  res.cookies.set(GOOGLE_STATE_COOKIE, JSON.stringify({ state, nonce, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax, not strict: the callback is a top-level redirect back from Google.
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 10 * 60,
  });
  return res;
}
