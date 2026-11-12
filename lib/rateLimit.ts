import crypto from "crypto";
import type { NextRequest } from "next/server";
import { prisma } from "./prisma";

// Attempt limits for the endpoints anyone can hammer: logins, signups,
// password-reset and parent emails, invite codes. Counted in Postgres (the
// RateLimit table) since serverless functions share no memory.
//
// One statement does the whole check-and-count, so two requests arriving
// together can't both read "0 so far". A window is fixed: it starts at the
// first attempt and the count restarts once it has passed.

/** Counts one attempt against `key`; false means the limit is already used up. */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  try {
    // timezone('utc', now()): the column is a plain timestamp that Prisma
    // reads as UTC, whatever the database session's own zone is.
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "windowStart") VALUES (${key}, 1, timezone('utc', now()))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."windowStart" <= timezone('utc', now()) - make_interval(secs => ${windowSec}) THEN 1 ELSE "RateLimit"."count" + 1 END,
        "windowStart" = CASE WHEN "RateLimit"."windowStart" <= timezone('utc', now()) - make_interval(secs => ${windowSec}) THEN timezone('utc', now()) ELSE "RateLimit"."windowStart" END
      RETURNING "count"`;
    return Number(rows[0]?.count ?? 1) <= limit;
  } catch (err) {
    // A limiter that can't count must not be the reason nobody can log in.
    console.error("rateLimit failed open", key.split(":")[0], err);
    return true;
  }
}

/** True only if every one of the limits still has room (all are counted). */
export async function rateLimitAll(limits: [key: string, limit: number, windowSec: number][]): Promise<boolean> {
  const results = await Promise.all(limits.map(([key, limit, windowSec]) => rateLimit(key, limit, windowSec)));
  return results.every(Boolean);
}

/** The caller's address. Vercel sets these headers itself, so a client can't forge them. */
export function clientIp(req: NextRequest): string {
  return req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

/** An email (or any identifier) as a short key part, so addresses aren't stored in the table. */
export function keyPart(value: string): string {
  return crypto.createHash("sha256").update(value.toLowerCase()).digest("hex").slice(0, 24);
}

/** Old counters, cleared by the nightly cron. */
export async function clearOldRateLimits(): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 2 * 86400000) } } });
}

/**
 * Whether a JSON API request came from our own pages. A form on another
 * site can POST to us, but only as text/plain or a form type -- it can't
 * send application/json without a preflight we never grant. The auth routes
 * check this so nobody can be signed in to someone else's account from
 * another site.
 */
export function isJsonRequest(req: NextRequest): boolean {
  return (req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json");
}
