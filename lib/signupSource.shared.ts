// Shared by the browser (components/SourceCapture.tsx, which writes the
// cookie) and the server (lib/signupSource.ts, which reads it at signup).
// Kept free of data and server imports so it costs the page nothing.

// First-party cookie holding a visitor's first visit: a URL-encoded JSON
// object with short keys -- us/um/uc (utm source, medium, campaign), h (the
// referring site's hostname), p (landing path), r (a friend's invite code),
// t (when, in ms).
export const SIGNUP_SOURCE_COOKIE = "oak_src";
export const SIGNUP_SOURCE_MAX_AGE = 90 * 24 * 60 * 60;

export interface SourceCookie {
  us?: string;
  um?: string;
  uc?: string;
  h?: string;
  p?: string;
  r?: string;
  t?: number;
}

const MAX_LEN = 60;
const MAX_PATH_LEN = 120;

/** Keeps only plain URL-safe characters and caps the length; empty becomes undefined. */
export function cleanSourceValue(value: unknown, path = false): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.replace(/[^A-Za-z0-9._~/-]/g, "").slice(0, path ? MAX_PATH_LEN : MAX_LEN);
  return clean || undefined;
}

// Paths whose second segment is a private token or an invite code: only the
// first segment is ever kept.
const TOKEN_PATHS = /^\/(share|link|i)(\/|$)/;

/** The landing path as stored: no query string, and no token or code in it. */
export function landingPath(pathname: string): string | undefined {
  const m = pathname.match(TOKEN_PATHS);
  return cleanSourceValue(m ? `/${m[1]}` : pathname, true);
}

/** A friend's invite code from a page: the `r` query param, or the path /i/<code>. */
export function inviteCodeFrom(pathname: string, search: URLSearchParams): string | undefined {
  const fromPath = pathname.match(/^\/i\/([^/]+)/)?.[1];
  return cleanSourceValue(search.get("r") || fromPath);
}
