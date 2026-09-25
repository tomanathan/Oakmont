import { createRemoteJWKSet, jwtVerify } from "jose";

// "Continue with Google": the standard OpenID Connect authorization-code
// flow, done directly rather than through an auth library, since sessions
// here are already our own JWT cookie (lib/auth.ts). Two routes:
// app/api/auth/google (sends the browser to Google) and
// app/api/auth/google/callback (verifies who came back and signs them in).
//
// Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (a "Web application"
// OAuth client in Google Cloud Console, with
// https://oakmontsat.com/api/auth/google/callback as a redirect URI).
// Until both are set the button stays hidden and the routes refuse.

export const GOOGLE_STATE_COOKIE = "g_oauth";

export function googleConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export function googleEnabled(): boolean {
  return googleConfig() !== null;
}

export function googleRedirectUri(origin: string): string {
  return `${process.env.APP_URL || origin}/api/auth/google/callback`;
}

// Only paths the password login also allows as a destination (a parent's
// invite link) -- never an arbitrary URL, so the flow can't be used as an
// open redirect.
export function safeNext(next: string | null | undefined): string | null {
  return next && /^\/link\/[A-Za-z0-9_-]+$/.test(next) ? next : null;
}

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export interface GoogleIdentity {
  sub: string;
  email: string;
  givenName: string | null;
}

/**
 * Trades the authorization code for Google's ID token, then verifies the
 * token's signature, issuer, audience, and our nonce before trusting any of
 * it. Returns null for anything that doesn't check out, including an email
 * Google hasn't verified (which would let someone claim an address).
 */
export async function identityFromCode(code: string, redirectUri: string, nonce: string): Promise<GoogleIdentity | null> {
  const cfg = googleConfig();
  if (!cfg) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    console.error(`[google] token exchange failed (${res.status}): ${await res.text().catch(() => "")}`);
    return null;
  }
  const { id_token: idToken } = (await res.json()) as { id_token?: string };
  if (!idToken) return null;
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: cfg.clientId,
    });
    if (payload.nonce !== nonce) return null;
    if (payload.email_verified !== true || typeof payload.email !== "string" || typeof payload.sub !== "string") return null;
    const given = typeof payload.given_name === "string" ? payload.given_name.trim().replace(/\s+/g, " ").slice(0, 40) : "";
    return { sub: payload.sub, email: payload.email.trim().toLowerCase(), givenName: given || null };
  } catch (err) {
    console.error("[google] ID token failed verification:", err);
    return null;
  }
}
