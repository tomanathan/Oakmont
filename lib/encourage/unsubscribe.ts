import { SignJWT, jwtVerify } from "jose";
import { getSecretKey } from "@/lib/auth";
import { APP_URL } from "./config";

// The unsubscribe link in every daily email: a signed token naming who it
// is, so one click works without logging in and nobody can switch off
// someone else's emails by guessing an id.

export type Recipient = { who: "student" | "parent"; id: string };

export async function unsubscribeToken(r: Recipient): Promise<string> {
  return new SignJWT({ kind: "unsub", who: r.who, id: r.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().sign(getSecretKey());
}

export async function readUnsubscribeToken(token: string | null | undefined): Promise<Recipient | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.kind !== "unsub" || (payload.who !== "student" && payload.who !== "parent") || typeof payload.id !== "string") return null;
    return { who: payload.who, id: payload.id };
  } catch {
    return null;
  }
}

/** The page link for the email body, and the headers mail apps use for their own "Unsubscribe" button. */
export async function unsubscribeLinks(r: Recipient): Promise<{ url: string; headers: Record<string, string> }> {
  const t = await unsubscribeToken(r);
  return {
    url: `${APP_URL}/email/unsubscribe?t=${t}`,
    headers: { "List-Unsubscribe": `<${APP_URL}/api/email/unsubscribe?t=${t}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
}
