import { hasPaidAccess, trialDaysLeft, trialEnded } from "@/lib/subscription";

// Display helpers shared by the admin pages (server and client).

export const DAY = 24 * 60 * 60 * 1000;
export const TZ = "America/Chicago";
const ACTIVE_SUBSCRIPTION = new Set(["trialing", "active", "past_due"]);

export interface Status {
  label: string;
  tone: "paid" | "trial" | "warn" | "off";
  // paying | trial | ended | none, for filters
  group: "paying" | "trial" | "ended" | "none";
}

interface Access {
  subscriptionStatus: string | null;
  accessExpiresAt: Date | null;
  trialEndsAt: Date | null;
}

export function statusOf(u: Access, now: Date): Status {
  if (u.accessExpiresAt && u.accessExpiresAt > now) return { label: `Pass to ${fmtDate(u.accessExpiresAt)}`, tone: "paid", group: "paying" };
  if (u.subscriptionStatus === "past_due") return { label: "Monthly, past due", tone: "warn", group: "paying" };
  if (u.subscriptionStatus && ACTIVE_SUBSCRIPTION.has(u.subscriptionStatus)) {
    return { label: u.subscriptionStatus === "trialing" ? "Monthly, first charge pending" : "Monthly", tone: "paid", group: "paying" };
  }
  const left = trialDaysLeft(u, now);
  if (left !== null) return { label: `Free trial, ${left}d left`, tone: "trial", group: "trial" };
  if (u.subscriptionStatus) return { label: "Canceled", tone: "off", group: "ended" };
  if (trialEnded(u, now)) return { label: "Trial ended", tone: "off", group: "ended" };
  return { label: "No access", tone: "off", group: "none" };
}

export const isMonthly = (u: Access) => !!u.subscriptionStatus && ACTIVE_SUBSCRIPTION.has(u.subscriptionStatus);
export const isPaying = (u: Access, now: Date) => hasPaidAccess(u, now);

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TZ });
}
export function fmtDateYear(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: TZ });
}
export function fmtDateTime(d: Date): string {
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: TZ });
}

export function ago(d: Date | null, now: Date): string {
  if (!d) return "—";
  const days = Math.floor((now.getTime() - d.getTime()) / DAY);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
}

export function pct(n: number, of: number): string {
  return of > 0 ? `${Math.round((n / of) * 100)}%` : "—";
}

/** A duration for people: "45s", "12m", "3h 20m". */
export function dur(ms: number): string {
  if (ms <= 0) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export const PET_LABEL: Record<string, string> = { thriving: "Fed today", content: "Fine", hungry: "Hungry", cold: "Cold" };

export const PILL: Record<Status["tone"], string> = {
  paid: "bg-[#eaf6ef] text-[#2f6f4f] ring-[#cde8d9]",
  trial: "bg-[#e6eef5] text-[#2b5673] ring-[#cfdde9]",
  warn: "bg-[#fbf1df] text-[#8a5d0f] ring-[#f0ddb8]",
  off: "bg-[#f1ece2] text-stone-600 ring-[#e2dccf]",
};
