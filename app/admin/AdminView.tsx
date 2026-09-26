import Link from "next/link";
import { hasPaidAccess, inFreeTrial, trialDaysLeft, trialEnded } from "@/lib/subscription";
import { BrandMark } from "@/components/BrandMark";

// The admin dashboard's display, kept apart from app/admin/page.tsx (which
// loads the data and checks access) so it can be previewed with sample rows.

const DAY = 24 * 60 * 60 * 1000;
const TZ = "America/Chicago";
const ACTIVE_SUBSCRIPTION = new Set(["trialing", "active", "past_due"]);

export interface AdminRow {
  id: string;
  email: string;
  firstName: string | null;
  createdAt: Date;
  passwordHash: string | null;
  googleSub: string | null;
  welcomeSeenAt: Date | null;
  lastActiveDate: Date | null;
  lastLoginAt: Date | null;
  subscriptionStatus: string | null;
  accessExpiresAt: Date | null;
  trialEndsAt: Date | null;
  _count: { itemAttempts: number; progress: number; parentLinks: number };
}
type Row = AdminRow;

function signupMethod(u: Row): "Google" | "Email" | "Both" {
  if (u.googleSub && u.passwordHash) return "Both";
  return u.googleSub ? "Google" : "Email";
}

interface Status {
  label: string;
  tone: "paid" | "trial" | "warn" | "off";
}

function statusOf(u: Row, now: Date): Status {
  if (u.accessExpiresAt && u.accessExpiresAt > now) return { label: `Pass to ${fmtDate(u.accessExpiresAt)}`, tone: "paid" };
  if (u.subscriptionStatus === "past_due") return { label: "Monthly, past due", tone: "warn" };
  if (u.subscriptionStatus && ACTIVE_SUBSCRIPTION.has(u.subscriptionStatus)) {
    return { label: u.subscriptionStatus === "trialing" ? "Monthly, first charge pending" : "Monthly", tone: "paid" };
  }
  const left = trialDaysLeft(u, now);
  if (left !== null) return { label: `Free trial, ${left}d left`, tone: "trial" };
  if (u.subscriptionStatus) return { label: "Canceled", tone: "off" };
  if (trialEnded(u, now)) return { label: "Trial ended", tone: "off" };
  return { label: "No access", tone: "off" };
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TZ });
}

function ago(d: Date | null, now: Date): string {
  if (!d) return "—";
  const days = Math.floor((now.getTime() - d.getTime()) / DAY);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
}

function dayKey(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
}

function pct(n: number, of: number): string {
  return of > 0 ? `${Math.round((n / of) * 100)}%` : "—";
}

export function AdminView({
  users,
  parentsTotal,
  parentsClaimed,
  now,
}: {
  users: AdminRow[];
  parentsTotal: number;
  parentsClaimed: number;
  now: Date;
}) {

  const total = users.length;
  const weekAgo = new Date(now.getTime() - 7 * DAY);
  const newThisWeek = users.filter((u) => u.createdAt >= weekAgo).length;
  const paying = users.filter((u) => hasPaidAccess(u, now));
  const monthly = paying.filter((u) => u.subscriptionStatus && ACTIVE_SUBSCRIPTION.has(u.subscriptionStatus)).length;
  const passes = paying.length - monthly;
  const inTrial = users.filter((u) => inFreeTrial(u, now)).length;
  const ended = users.filter((u) => trialEnded(u, now)).length;
  const active7 = users.filter((u) => u.lastActiveDate && u.lastActiveDate >= weekAgo).length;
  const viaGoogle = users.filter((u) => u.googleSub).length;

  const funnel = [
    { label: "Signed up", n: total },
    { label: "Finished onboarding", n: users.filter((u) => u.welcomeSeenAt).length },
    { label: "Answered a question", n: users.filter((u) => u._count.itemAttempts > 0).length },
    { label: "Passed a skill quiz", n: users.filter((u) => u._count.progress > 0).length },
    { label: "Paying", n: paying.length },
  ];

  // Signups per day for the last 30 days (Central time), oldest first.
  const days: { key: string; label: string; n: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY);
    days.push({ key: dayKey(d), label: fmtDate(d), n: 0 });
  }
  const byKey = new Map(days.map((d) => [d.key, d]));
  for (const u of users) {
    const slot = byKey.get(dayKey(u.createdAt));
    if (slot) slot.n++;
  }
  const peak = Math.max(1, ...days.map((d) => d.n));
  const last30 = days.reduce((a, d) => a + d.n, 0);

  return (
    <div className="min-h-screen bg-[#faf6ec] font-sans text-ink">
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
        <header className="mb-8 flex flex-wrap items-center gap-3">
          <Link href="/dashboard" aria-label="Back to the app">
            <BrandMark size={36} />
          </Link>
          <div>
            <h1 className="font-display text-[26px] font-semibold leading-tight">Admin</h1>
            <p className="text-[13px] text-stone-500">
              Accounts and subscriptions, live from the database. Updated{" "}
              {now.toLocaleString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit", month: "short", day: "numeric" })} (Central).
            </p>
          </div>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Tile label="Accounts" value={total} sub={`+${newThisWeek} this week`} />
          <Tile label="In free trial" value={inTrial} sub="right now" />
          <Tile label="Paying" value={paying.length} sub={`${monthly} monthly · ${passes} pass`} />
          <Tile label="Trial → paid" value={pct(paying.length, paying.length + ended)} sub={`of ${paying.length + ended} whose trial ended`} />
          <Tile label="Studied this week" value={active7} sub="finished a lesson or quiz" />
          <Tile label="Google sign-in" value={pct(viaGoogle, total)} sub={`${viaGoogle} accounts`} />
        </section>

        <div className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-xl border border-[#e2d7c1] bg-white p-5">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold">New accounts per day</h2>
              <span className="text-[13px] tabular-nums text-stone-500">{last30} in the last 30 days</span>
            </div>
            <p className="mb-4 text-[12px] text-stone-500">Hover a bar for the day.</p>
            <div className="flex h-[140px] items-end gap-[2px] border-b border-[#e2d7c1]" role="img" aria-label={`New accounts per day, last 30 days: ${days.map((d) => `${d.label} ${d.n}`).join(", ")}`}>
              {days.map((d) => (
                <div key={d.key} className="group relative flex h-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-[4px] bg-forest transition-opacity group-hover:opacity-80"
                    style={{ height: d.n ? `${Math.max(4, (d.n / peak) * 100)}%` : "0%" }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-white group-hover:block">
                    {d.label}: {d.n}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-stone-500">
              <span>{days[0].label}</span>
              <span>{days[days.length - 1].label}</span>
            </div>
          </section>

          <section className="rounded-xl border border-[#e2d7c1] bg-white p-5">
            <h2 className="mb-4 text-[15px] font-semibold">Where accounts get to</h2>
            <ol className="space-y-3">
              {funnel.map((f) => (
                <li key={f.label}>
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span>{f.label}</span>
                    <span className="tabular-nums text-stone-600">
                      {f.n} <span className="text-stone-400">· {pct(f.n, total)}</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#eef3e9]">
                    <div className="h-2 rounded-full bg-forest" style={{ width: total ? `${(f.n / total) * 100}%` : "0%" }} />
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[12px] text-stone-500">
              Parents: {parentsTotal} accounts, {parentsClaimed} set up.
            </p>
          </section>
        </div>

        <section className="rounded-xl border border-[#e2d7c1] bg-white">
          <div className="flex items-baseline justify-between gap-3 px-5 pb-3 pt-5">
            <h2 className="text-[15px] font-semibold">Accounts</h2>
            <span className="text-[13px] text-stone-500">Newest first</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-[13px]">
              <thead>
                <tr className="border-y border-[#efe7d6] bg-[#faf6ec] text-[11px] uppercase tracking-[0.06em] text-stone-500">
                  <th className="px-5 py-2 font-semibold">Student</th>
                  <th className="px-3 py-2 font-semibold">Signed up</th>
                  <th className="px-3 py-2 font-semibold">Via</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Last studied</th>
                  <th className="px-3 py-2 text-right font-semibold">Questions</th>
                  <th className="px-3 py-2 text-right font-semibold">Skills passed</th>
                  <th className="px-5 py-2 font-semibold">Parent</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const st = statusOf(u, now);
                  return (
                    <tr key={u.id} className="border-b border-[#f3eee2] last:border-0">
                      <td className="px-5 py-2.5">
                        <div className="font-medium">{u.firstName || "—"}</div>
                        <div className="text-[12px] text-stone-500">{u.email}</div>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-stone-600">{fmtDate(u.createdAt)}</td>
                      <td className="px-3 py-2.5 text-stone-600">{signupMethod(u)}</td>
                      <td className="px-3 py-2.5">
                        <Pill tone={st.tone}>{st.label}</Pill>
                        {!u.welcomeSeenAt && <div className="mt-1 text-[11px] text-stone-500">Onboarding not finished</div>}
                      </td>
                      <td className="px-3 py-2.5 text-stone-600">{ago(u.lastActiveDate, now)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{u._count.itemAttempts}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{u._count.progress}</td>
                      <td className="px-5 py-2.5 text-stone-600">{u._count.parentLinks > 0 ? "Linked" : "—"}</td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-stone-500">No accounts yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-6 text-[12px] text-stone-500">
          Visitors, pages, and where traffic comes from: Vercel dashboard → the oakmont project → Analytics.
        </p>
      </div>
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: number | string; sub: string }) {
  return (
    <div className="rounded-xl border border-[#e2d7c1] bg-white p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-stone-500">{label}</div>
      <div className="mt-1 font-display text-[28px] font-semibold leading-none tabular-nums">{value}</div>
      <div className="mt-1.5 text-[12px] text-stone-500">{sub}</div>
    </div>
  );
}

const PILL: Record<Status["tone"], string> = {
  paid: "bg-[#eaf6ef] text-[#2f6f4f] ring-[#cde8d9]",
  trial: "bg-[#e6eef5] text-[#2b5673] ring-[#cfdde9]",
  warn: "bg-[#fbf1df] text-[#8a5d0f] ring-[#f0ddb8]",
  off: "bg-[#f1ece2] text-stone-600 ring-[#e2dccf]",
};

function Pill({ tone, children }: { tone: Status["tone"]; children: React.ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-medium ring-1 ${PILL[tone]}`}>{children}</span>;
}
