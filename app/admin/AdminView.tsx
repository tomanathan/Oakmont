import Link from "next/link";
import { inFreeTrial, trialEnded } from "@/lib/subscription";
import { BrandMark } from "@/components/BrandMark";
import type { AdminData, StudentRow } from "./data";
import { AccountsTable } from "./AccountsTable";
import { ParentsTable } from "./ParentsTable";
import { DAY, TZ, dur, fmtDate, isMonthly, isPaying, pct } from "./format";

// The admin dashboard's display, kept apart from app/admin/page.tsx (which
// loads the data and checks access) so it can be previewed with sample rows.

type AdminRow = StudentRow;
const parentsConnectedAt = (u: StudentRow) => u.parents.filter((p) => p.setUp).map((p) => p.linkedAt);
function dayKey(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
}

// Weekly signup cohorts (Monday start, Central time), newest first: the three
// numbers the onboarding is judged on. Counts, not just rates -- at this
// traffic a single account moves a percentage a lot.
function cohorts(users: AdminRow[], now: Date) {
  // The Central-time calendar date, then back to that week's Monday, all in
  // plain date arithmetic so no other time zone can shift the day.
  const weekKey = (d: Date) => {
    const [y, m, day] = dayKey(d).split("-").map(Number);
    const t = new Date(Date.UTC(y, m - 1, day));
    t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
    return t.toISOString().slice(0, 10);
  };
  const map = new Map<string, AdminRow[]>();
  for (const u of users) map.set(weekKey(u.createdAt), [...(map.get(weekKey(u.createdAt)) ?? []), u]);
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 8)
    .map(([week, us]) => {
      const within = (d: Date | null, u: AdminRow, hours: number) => !!d && d.getTime() - u.createdAt.getTime() <= hours * 3600000;
      const paid = us.filter((u) => !!u.firstPaidAt);
      const withParent = us.filter((u) => parentsConnectedAt(u).length > 0);
      return {
        week,
        signups: us.length,
        viaStart: us.filter((u) => u.viaStart).length,
        day0: us.filter((u) => within(u.firstStudiedAt, u, 24)).length,
        parent3: us.filter((u) => parentsConnectedAt(u).some((d) => within(d, u, 72))).length,
        paid: paid.length,
        paidWithParent: paid.filter((u) => parentsConnectedAt(u).length > 0).length,
        withParent: withParent.length,
        open: now.getTime() - Date.parse(`${week}T00:00:00Z`) < 14 * DAY,
      };
    });
}
export function AdminView({ data, now }: { data: AdminData; now: Date }) {
  const users = data.students;
  const total = users.length;
  const weekAgo = new Date(now.getTime() - 7 * DAY);
  const dayAgo = new Date(now.getTime() - DAY);
  const newThisWeek = users.filter((u) => u.createdAt >= weekAgo).length;
  const paying = users.filter((u) => isPaying(u, now));
  const monthly = paying.filter((u) => isMonthly(u)).length;
  const passes = paying.length - monthly;
  const pastDue = users.filter((u) => u.subscriptionStatus === "past_due").length;
  const inTrial = users.filter((u) => inFreeTrial(u, now));
  const trialEndingSoon = inTrial.filter((u) => u.trialEndsAt && u.trialEndsAt.getTime() - now.getTime() < 2 * DAY).length;
  const ended = users.filter((u) => trialEnded(u, now)).length;
  const active7 = users.filter((u) => u.lastActiveDate && u.lastActiveDate >= weekAgo).length;
  const activeToday = users.filter((u) => u.lastActiveDate && u.lastActiveDate >= dayAgo).length;
  const viaGoogle = users.filter((u) => u.hasGoogle).length;
  const cold = users.filter((u) => u.petStage === "cold").length;
  const hungry = users.filter((u) => u.petStage === "hungry").length;
  const withParent = users.filter((u) => u.parents.some((p) => p.setUp)).length;
  const parentsSetUp = data.parents.filter((p) => p.setUp !== "Not set up").length;
  const reportsOn = data.parents.filter((p) => p.setUp !== "Not set up" && p.weeklyReport).length;
  const tested = users.filter((u) => u.tests > 0);
  const avgLatest = tested.length ? Math.round(tested.reduce((s, u) => s + (u.latestTest ?? 0), 0) / tested.length) : null;
  const streaks = users.filter((u) => u.currentStreak > 0);
  const act7 = data.activity.slice(-7);
  const q7 = act7.reduce((s, d) => s + d.questions, 0);
  const l7 = act7.reduce((s, d) => s + d.lessons, 0);
  const actPeak = Math.max(1, ...data.activity.map((d) => d.questions));
  const act30 = data.activity.reduce((s, d) => s + d.questions, 0);

  const funnel = [
    { label: "Signed up", n: total },
    { label: "Finished onboarding", n: users.filter((u) => u.welcomeSeenAt).length },
    { label: "Read a lesson", n: users.filter((u) => u.lessons > 0).length },
    { label: "Answered a question", n: users.filter((u) => u.questions > 0).length },
    { label: "Passed a skill quiz", n: users.filter((u) => u.skillsPassed > 0).length },
    { label: "Took a practice test", n: tested.length },
    { label: "Parent connected", n: withParent },
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
  const label = (key: string) => fmtDate(new Date(`${key}T17:00:00Z`));

  return (
    <div className="min-h-screen bg-[#faf6ec] font-sans text-ink">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        <header className="mb-8 flex flex-wrap items-center gap-3">
          <Link href="/dashboard" aria-label="Back to the app">
            <BrandMark size={36} />
          </Link>
          <div className="mr-auto">
            <h1 className="font-display text-[26px] font-semibold leading-tight">Admin</h1>
            <p className="text-[13px] text-stone-500">
              Students, parents, study activity and subscriptions, live from the database. Updated{" "}
              {now.toLocaleString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit", month: "short", day: "numeric" })} (Central).
            </p>
          </div>
          <nav className="flex gap-4 text-[13px] font-semibold text-forest">
            <a href="#students" className="underline-offset-2 hover:underline">Students</a>
            <a href="#parents" className="underline-offset-2 hover:underline">Parents</a>
            <Link href="/admin/emails" className="underline-offset-2 hover:underline">Emails</Link>
          </nav>
        </header>

        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">Accounts and money</h2>
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Tile label="Students" value={total} sub={`+${newThisWeek} this week`} />
          <Tile label="In free trial" value={inTrial.length} sub={`${trialEndingSoon} end within 2 days`} />
          <Tile label="Paying" value={paying.length} sub={`${monthly} monthly · ${passes} pass`} />
          <Tile label="Trial → paid" value={pct(paying.length, paying.length + ended)} sub={`of ${paying.length + ended} whose trial ended`} />
          <Tile label="Past due" value={pastDue} sub="monthly, card failing" />
          <Tile label="Google sign-in" value={pct(viaGoogle, total)} sub={`${viaGoogle} accounts`} />
        </section>

        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">Studying</h2>
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Tile label="Studied today" value={activeToday} sub={`${active7} in the last 7 days`} />
          <Tile label="Questions, 7 days" value={q7.toLocaleString()} sub={`${data.totals.questions.toLocaleString()} all time`} />
          <Tile label="Accuracy" value={pct(data.totals.correct, data.totals.questions)} sub="all questions, all time" />
          <Tile label="Lessons, 7 days" value={l7.toLocaleString()} sub={`${data.totals.lessons.toLocaleString()} all time`} />
          <Tile label="Time studying" value={dur(data.totals.studyMs)} sub="questions + lessons, all time" />
          <Tile label="Practice tests" value={data.totals.tests} sub={avgLatest ? `latest scores average ${avgLatest}` : "none taken yet"} />
        </section>

        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">Habits and parents</h2>
        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Tile label="On a streak" value={streaks.length} sub={streaks.length ? `longest now ${Math.max(...streaks.map((u) => u.currentStreak))} days` : "nobody right now"} />
          <Tile label="Ozho is cold" value={cold} sub="4+ days without study" />
          <Tile label="Ozho is hungry" value={hungry} sub="2–3 days without study" />
          <Tile label="Students with a parent" value={withParent} sub={`${pct(withParent, total)} of students`} />
          <Tile label="Parent accounts" value={data.parents.length} sub={`${parentsSetUp} set up`} />
          <Tile label="Weekly reports on" value={reportsOn} sub={`of ${parentsSetUp} set-up parents`} />
        </section>

        <section className="mb-4 rounded-xl border border-[#e2d7c1] bg-white p-5">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-semibold">Questions answered per day</h2>
            <span className="text-[13px] tabular-nums text-stone-500">{act30.toLocaleString()} in the last 30 days</span>
          </div>
          <p className="mb-4 text-[12px] text-stone-500">Hover a bar for that day&apos;s questions, accuracy, lessons read and students studying.</p>
          <div className="flex h-[140px] items-end gap-[2px] border-b border-[#e2d7c1]" role="img" aria-label={`Questions answered per day, last 30 days: ${data.activity.map((d) => `${label(d.key)} ${d.questions}`).join(", ")}`}>
            {data.activity.map((d) => (
              <div key={d.key} className="group relative flex h-full flex-1 items-end">
                <div className="w-full rounded-t-[4px] bg-forest transition-opacity group-hover:opacity-80" style={{ height: d.questions ? `${Math.max(4, (d.questions / actPeak) * 100)}%` : "0%" }} />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-white group-hover:block">
                  {label(d.key)}: {d.questions} questions ({pct(d.correct, d.questions)} right) · {d.lessons} lessons · {d.students} students
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-stone-500">
            <span>{label(data.activity[0].key)}</span>
            <span>{label(data.activity[data.activity.length - 1].key)}</span>
          </div>
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
          </section>
        </div>

        <section className="mb-8 rounded-xl border border-[#e2d7c1] bg-white">
          <div className="px-5 pb-3 pt-5">
            <h2 className="text-[15px] font-semibold">Weekly signup groups</h2>
            <p className="mt-0.5 text-[12px] text-stone-500">
              Studied on day 0 = finished the starter questions, a lesson, or a quiz within 24 hours. Parent by day 3 = a parent who set up their account, connected within 72 hours. Recent weeks are still filling in.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13px] tabular-nums">
              <thead>
                <tr className="border-y border-[#efe7d6] bg-[#faf6ec] text-[11px] uppercase tracking-[0.06em] text-stone-500">
                  <th className="px-5 py-2 font-semibold">Week of</th>
                  <th className="px-3 py-2 text-right font-semibold">Signups</th>
                  <th className="px-3 py-2 text-right font-semibold">Via questions</th>
                  <th className="px-3 py-2 text-right font-semibold">Studied day 0</th>
                  <th className="px-3 py-2 text-right font-semibold">Parent by day 3</th>
                  <th className="px-3 py-2 text-right font-semibold">Paid</th>
                  <th className="px-5 py-2 text-right font-semibold">Paid, with / without parent</th>
                </tr>
              </thead>
              <tbody>
                {cohorts(users, now).map((c) => (
                  <tr key={c.week} className="border-b border-[#f3eee2] last:border-0">
                    <td className="px-5 py-2.5">
                      {fmtDate(new Date(`${c.week}T17:00:00Z`))}
                      {c.open && <span className="ml-2 text-[11px] text-stone-400">filling in</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right">{c.signups}</td>
                    <td className="px-3 py-2.5 text-right">{c.viaStart}</td>
                    <td className="px-3 py-2.5 text-right">
                      {c.day0} <span className="text-stone-400">· {pct(c.day0, c.signups)}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {c.parent3} <span className="text-stone-400">· {pct(c.parent3, c.signups)}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {c.paid} <span className="text-stone-400">· {pct(c.paid, c.signups)}</span>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {pct(c.paidWithParent, c.withParent)} / {pct(c.paid - c.paidWithParent, c.signups - c.withParent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div id="students" className="mb-8 scroll-mt-4">
          <AccountsTable students={users} now={now} />
        </div>

        <div id="parents" className="scroll-mt-4">
          <ParentsTable parents={data.parents} now={now} />
        </div>

        <p className="mt-6 text-[12px] text-stone-500">
          Visitors, pages, and where traffic comes from: Vercel dashboard → the oakmont project → Analytics. Payments and refunds: the Stripe dashboard.
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

