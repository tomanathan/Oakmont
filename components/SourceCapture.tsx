"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  SIGNUP_SOURCE_COOKIE,
  SIGNUP_SOURCE_MAX_AGE,
  cleanSourceValue,
  inviteCodeFrom,
  landingPath,
  type SourceCookie,
} from "@/lib/signupSource.shared";

// Remembers how a visitor first found the site (a link's utm tags, the site
// that sent them, the page they landed on) so the account they make later
// can say where it came from -- see lib/signupSource.ts. The first visit that
// says anything is kept: a "direct" first visit (no utm tag, no referrer) is
// replaced by a later one that does, and a friend's invite code opened later
// always counts. Never the query string, and never the token in a private
// link's path. Renders nothing.

// Hops in our own sign-in and payment flows, not places that sent anyone.
const NOT_REFERRERS = new Set(["accounts.google.com", "checkout.stripe.com", "billing.stripe.com"]);
const bare = (host: string) => host.toLowerCase().replace(/^www\./, "");

export function SourceCapture() {
  // Client navigation changes the path without a reload: check again then,
  // in case it brought an invite code.
  const pathname = usePathname();
  useEffect(() => {
    try {
      record();
    } catch {
      // Attribution is a nice-to-have; it must never break a page.
    }
  }, [pathname]);
  return null;
}

function readCookie(): SourceCookie | null {
  const prefix = `${SIGNUP_SOURCE_COOKIE}=`;
  const raw = document.cookie.split("; ").find((c) => c.startsWith(prefix));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw.slice(prefix.length)));
    return parsed && typeof parsed === "object" ? (parsed as SourceCookie) : null;
  } catch {
    return null;
  }
}

function writeCookie(value: SourceCookie) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SIGNUP_SOURCE_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=${SIGNUP_SOURCE_MAX_AGE}; SameSite=Lax${secure}`;
}

function referrerHost(): string | undefined {
  try {
    if (!document.referrer) return undefined;
    const host = bare(new URL(document.referrer).hostname);
    if (!host || host === bare(window.location.hostname) || NOT_REFERRERS.has(host)) return undefined;
    return cleanSourceValue(host);
  } catch {
    return undefined;
  }
}

function record() {
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);
  const invite = inviteCodeFrom(pathname, params);
  const existing = readCookie();
  const us = cleanSourceValue(params.get("utm_source"));
  const h = referrerHost();

  if (existing) {
    // A stored visit with no source and no referrer told us nothing, so the
    // first visit that does tell us something takes its place (keeping any
    // stored invite code unless this page carries one).
    if (!existing.us && !existing.h && (us || h)) {
      writeCookie({
        us,
        um: cleanSourceValue(params.get("utm_medium")),
        uc: cleanSourceValue(params.get("utm_campaign")),
        h,
        p: landingPath(pathname),
        r: invite || existing.r,
        t: Date.now(),
      });
      return;
    }
    if (invite && existing.r !== invite) writeCookie({ ...existing, r: invite });
    return;
  }

  const first: SourceCookie = {
    us,
    um: cleanSourceValue(params.get("utm_medium")),
    uc: cleanSourceValue(params.get("utm_campaign")),
    h,
    p: landingPath(pathname),
    r: invite,
    t: Date.now(),
  };
  // JSON.stringify drops the undefined fields.
  writeCookie(first);
}
