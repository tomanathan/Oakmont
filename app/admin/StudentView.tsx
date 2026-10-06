import Link from "next/link";
import { PixelDog } from "@/components/PixelDog";
import { MOOD_BY_STAGE } from "@/components/PetAvatar";
import type { StudentDetail } from "./data";
import { DAY, PET_LABEL, PILL, ago, dur, fmtDate, fmtDateTime, fmtDateYear, pct, statusOf } from "./format";

// One student, in full: who they are, what they pay, how they study, every
// skill they've touched, their practice tests, their parents, and what
// they did most recently. Display only (app/admin/student/[id]/page.tsx
// loads it), so it can be previewed with sample data.

export function StudentView({ d, now }: { d: StudentDetail; now: Date }) {
  const u = d.row;
  const x = d.extra;
  const st = statusOf(u, now);
  const totalMs = u.questionMs + u.lessonMs;
  const peak = Math.max(1, ...d.days.map((day) => day.questions + day.lessons));
  const activeDays = d.days.filter((day) => day.questions + day.lessons > 0).length;
  const daysToTest = u.targetTestDate ? Math.ceil((u.targetTestDate.getTime() - now.getTime()) / DAY) : null;
  const label = (key: string) => fmtDate(new Date(`${key}T17:00:00Z`));
  const sure = d.confidence.find((c) => c.label === "sure");

  return (
    <div className="min-h-screen bg-[#f3f6fc] font-sans text-ink">
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
        <Link href="/admin#students" className="text-[13px] font-semibold text-forest underline-offset-2 hover:underline">
          ← All students
        </Link>

        <header className="mb-6 mt-3 flex flex-wrap items-center gap-4">
          <div className="grid h-[64px] w-[88px] place-items-center rounded-xl border border-[#c9d6ee] bg-white">
            <PixelDog size={64} mood={MOOD_BY_STAGE[u.petStage]} cold={u.petStage === "cold"} costume={x.equippedCostume} />
          </div>
          <div className="mr-auto min-w-0">
            <h1 className="font-display text-[26px] font-semibold leading-tight">{u.firstName || "(no name)"}</h1>
            <p className="text-[14px] text-stone-600">
              <a href={`mailto:${u.email}`} className="underline-offset-2 hover:underline">
                {u.email}
              </a>
            </p>
          </div>
          <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-medium ring-1 ${PILL[st.tone]}`}>{st.label}</span>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
          <Stat label="Last studied" value={ago(u.lastActiveDate, now)} />
          <Stat label="Streak" value={`${u.currentStreak}d`} sub={`best ${u.longestStreak}`} />
          <Stat label="Days studied" value={u.daysStudied} />
          <Stat label="Questions" value={u.questions.toLocaleString()} sub={`${pct(u.correct, u.questions)} right`} />
          <Stat label="Lessons read" value={u.lessons} />
          <Stat label="Time studying" value={dur(totalMs)} />
          <Stat label="Skills passed" value={u.skillsPassed} sub={`${u.skillsMastered} mastered`} />
          <Stat label="Latest test" value={u.latestTest ?? "—"} sub={u.tests ? `${u.tests} taken, best ${u.bestTest}` : "none taken"} />
        </section>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <Card title="Profile">
            <Row k="Signed up" v={fmtDateTime(u.createdAt)} />
            <Row k="Sign-in" v={u.hasGoogle && u.hasPassword ? "Google and password" : u.hasGoogle ? "Google" : "Email and password"} />
            <Row k="Came in via" v={u.viaStart ? `Starter questions${u.starter ? ` (${u.starter.correct}/${u.starter.total} right)` : ""}` : "Direct signup"} />
            <Row k="First skill in plan" v={x.firstSkill ?? "—"} />
            <Row k="Onboarding" v={u.welcomeSeenAt ? `Finished ${fmtDate(u.welcomeSeenAt)}` : "Not finished"} />
            <Row k="Getting-started list" v={x.onboardingChecklistDismissedAt ? `Dismissed ${fmtDate(x.onboardingChecklistDismissedAt)}` : "Still showing"} />
            <Row k="Last login" v={u.lastLoginAt ? fmtDateTime(u.lastLoginAt) : "—"} />
            <Row k="Login before that" v={x.previousLoginAt ? fmtDateTime(x.previousLoginAt) : "—"} />
            <Row k="First studied" v={u.firstStudiedAt ? fmtDateTime(u.firstStudiedAt) : "Never"} />
          </Card>

          <Card title="Goals">
            <Row k="Goal score" v={u.goalScore ?? "Not set"} />
            <Row k="Starting score" v={u.baselineScore ?? "Not set"} />
            <Row k="Test date" v={u.targetTestDate ? `${fmtDateYear(u.targetTestDate)}${daysToTest !== null ? ` (${daysToTest >= 0 ? `in ${daysToTest} days` : `${-daysToTest} days ago`})` : ""}` : "Not set"} />
            <Row k="Latest practice test" v={u.latestTest ?? "—"} />
            <Row k="Gap to goal" v={u.goalScore && u.latestTest ? `${u.goalScore - u.latestTest > 0 ? `${u.goalScore - u.latestTest} points to go` : "At or above goal"}` : "—"} />
            <div className="mt-3 border-t border-[#e8eef9] pt-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-stone-500">Ozho</div>
            <Row k="Right now" v={`${PET_LABEL[u.petStage]}${x.daysInactive > 0 ? `, ${x.daysInactive} days since study` : ""}`} />
            <Row k="Streak freezes saved" v={x.streakFreezes} />
            <Row k="Costume" v={x.equippedCostume && x.equippedCostume !== "none" ? x.equippedCostume : "None"} />
          </Card>

          <Card title="Billing">
            <Row k="Status" v={st.label} />
            <Row k="Subscription" v={u.subscriptionStatus ?? "None"} />
            <Row k="Free trial ends" v={u.trialEndsAt ? fmtDateTime(u.trialEndsAt) : "—"} />
            <Row k="Trial reminder sent" v={x.trialReminderSentAt ? fmtDate(x.trialReminderSentAt) : "No"} />
            <Row k="First paid" v={u.firstPaidAt ? fmtDateTime(u.firstPaidAt) : "Never"} />
            <Row k="Monthly renews" v={u.currentPeriodEnd ? fmtDateYear(u.currentPeriodEnd) : "—"} />
            <Row k="Pass valid to" v={u.accessExpiresAt ? fmtDateYear(u.accessExpiresAt) : "—"} />
            <Row k="Pass retake claimed" v={x.passRetakeClaimedAt ? fmtDate(x.passRetakeClaimedAt) : "No"} />
            <Row
              k="Stripe customer"
              v={
                x.stripeCustomerId ? (
                  <a href={`https://dashboard.stripe.com/customers/${x.stripeCustomerId}`} target="_blank" rel="noreferrer" className="font-medium text-forest underline underline-offset-2">
                    Open in Stripe
                  </a>
                ) : (
                  "None"
                )
              }
            />
          </Card>
        </div>

        <Card title="Parents" className="mb-6">
          {d.parents.length === 0 ? (
            <p className="text-[13px] text-stone-600">
              No parent connected.{" "}
              {u.parentInviteEmails > 0
                ? `${u.parentInviteEmails} invite email${u.parentInviteEmails === 1 ? "" : "s"} sent${x.parentInviteEmailedAt ? `, last ${ago(x.parentInviteEmailedAt, now).toLowerCase()}` : ""}.`
                : "No invite email sent."}
              {x.parentOptOutAt && ` Student chose not to connect a parent (${fmtDate(x.parentOptOutAt)}).`}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[13px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.06em] text-stone-500">
                    <th className="py-1.5 pr-3 font-semibold">Parent</th>
                    <th className="px-3 py-1.5 font-semibold">Account</th>
                    <th className="px-3 py-1.5 font-semibold">Connected</th>
                    <th className="px-3 py-1.5 font-semibold">Calls student</th>
                    <th className="px-3 py-1.5 font-semibold">Weekly report</th>
                    <th className="px-3 py-1.5 font-semibold">Last report</th>
                  </tr>
                </thead>
                <tbody>
                  {d.parents.map((p) => (
                    <tr key={p.id} className="border-t border-[#e8eef9]">
                      <td className="py-2 pr-3 font-medium">
                        <a href={`mailto:${p.email}`} className="underline-offset-2 hover:underline">
                          {p.email}
                        </a>
                      </td>
                      <td className="px-3 py-2 text-stone-600">{p.setUp ? "Set up" : <span className="text-[#8a5d0f]">Not set up</span>}</td>
                      <td className="px-3 py-2 text-stone-600">{fmtDateYear(p.linkedAt)}</td>
                      <td className="px-3 py-2 text-stone-600">{p.nickname ?? "—"}</td>
                      <td className="px-3 py-2 text-stone-600">{p.weeklyReport ? "On" : "Off"}</td>
                      <td className="px-3 py-2 text-stone-600">{ago(p.lastReportSentAt, now)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Study activity, last 60 days" className="mb-6" aside={`${activeDays} days with study`}>
          <div className="flex h-[120px] items-end gap-[2px] border-b border-[#c9d6ee]" role="img" aria-label={`Study per day: ${d.days.filter((day) => day.questions + day.lessons > 0).map((day) => `${label(day.key)} ${day.questions} questions`).join(", ") || "none"}`}>
            {d.days.map((day) => {
              const n = day.questions + day.lessons;
              return (
                <div key={day.key} className="group relative flex h-full flex-1 items-end">
                  <div className="w-full rounded-t-[3px] bg-forest transition-opacity group-hover:opacity-80" style={{ height: n ? `${Math.max(5, (n / peak) * 100)}%` : "0%" }} />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-white group-hover:block">
                    {label(day.key)}: {day.questions} questions ({pct(day.correct, day.questions)} right) · {day.lessons} lessons · {dur(day.ms)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-stone-500">
            <span>{label(d.days[0].key)}</span>
            <span>{label(d.days[d.days.length - 1].key)}</span>
          </div>
        </Card>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <Card title="Accuracy by area">
            {d.domains.length === 0 && <p className="text-[13px] text-stone-500">No questions answered yet.</p>}
            <ol className="space-y-3">
              {d.domains.map((dm) => (
                <li key={dm.domain}>
                  <div className="mb-1 flex justify-between gap-3 text-[13px]">
                    <span>{dm.domain}</span>
                    <span className="whitespace-nowrap tabular-nums text-stone-600">
                      {pct(dm.correct, dm.questions)} <span className="text-stone-400">· {dm.questions} q</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#e9effb]">
                    <div className="h-2 rounded-full bg-forest" style={{ width: dm.questions ? `${(dm.correct / dm.questions) * 100}%` : "0%" }} />
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card title="How they answer">
            <Row k="Average time per question" v={u.questions ? dur(u.questionMs / u.questions) : "—"} />
            {d.sources.map((s) => (
              <Row key={s.label} k={s.label === "review" ? "Review questions" : "Quiz questions"} v={`${s.n} · ${pct(s.correct, s.n)} right`} />
            ))}
            <div className="mt-3 border-t border-[#e8eef9] pt-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-stone-500">By confidence</div>
            {d.confidence.length === 0 && <p className="mt-2 text-[13px] text-stone-500">Nothing yet.</p>}
            {d.confidence.map((c) => (
              <Row key={c.label} k={c.label[0].toUpperCase() + c.label.slice(1)} v={`${c.n} · ${pct(c.correct, c.n)} right`} />
            ))}
            {sure && sure.n >= 10 && <p className="mt-2 text-[12px] text-stone-500">Wrong while sure: {sure.n - sure.correct} of {sure.n}.</p>}
          </Card>

          <Card title="Practice tests">
            {d.tests.length === 0 ? (
              <p className="text-[13px] text-stone-500">None taken.</p>
            ) : (
              <table className="w-full text-left text-[13px] tabular-nums">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.06em] text-stone-500">
                    <th className="py-1.5 font-semibold">Taken</th>
                    <th className="px-2 py-1.5 text-right font-semibold">Total</th>
                    <th className="px-2 py-1.5 text-right font-semibold">R&amp;W</th>
                    <th className="py-1.5 pl-2 text-right font-semibold">Math</th>
                  </tr>
                </thead>
                <tbody>
                  {[...d.tests].reverse().map((t, i) => (
                    <tr key={i} className="border-t border-[#e8eef9]">
                      <td className="py-1.5 text-stone-600">{fmtDateYear(t.takenAt)}</td>
                      <td className="px-2 py-1.5 text-right font-semibold">{t.composite}</td>
                      <td className="px-2 py-1.5 text-right">{t.rw}</td>
                      <td className="py-1.5 pl-2 text-right">{t.math}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        <section className="mb-6 rounded-xl border border-[#c9d6ee] bg-white">
          <div className="px-5 pb-3 pt-5">
            <h2 className="text-[15px] font-semibold">
              Skills <span className="font-normal text-stone-500">· {d.skills.length} touched</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] text-left text-[13px]">
              <thead>
                <tr className="border-y border-[#e1e9f7] bg-[#f3f6fc] text-[11px] uppercase tracking-[0.06em] text-stone-500">
                  <th className="px-5 py-2 font-semibold">Skill</th>
                  <th className="px-3 py-2 font-semibold">Area</th>
                  <th className="px-3 py-2 text-right font-semibold">Lessons</th>
                  <th className="px-3 py-2 text-right font-semibold">Questions</th>
                  <th className="px-3 py-2 text-right font-semibold">Accuracy</th>
                  <th className="px-3 py-2 text-right font-semibold">Time</th>
                  <th className="px-3 py-2 text-right font-semibold">Best quiz</th>
                  <th className="px-3 py-2 font-semibold">Passed</th>
                  <th className="px-3 py-2 font-semibold">Mastered</th>
                  <th className="px-5 py-2 font-semibold">Review due</th>
                </tr>
              </thead>
              <tbody>
                {d.skills.map((s) => (
                  <tr key={s.id} className="border-b border-[#e8eef9] last:border-0">
                    <td className="px-5 py-2 font-medium">{s.name}</td>
                    <td className="px-3 py-2 text-[12px] text-stone-500">{s.domain}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.lessons || "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.questions || "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{pct(s.correct, s.questions)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{dur(s.ms + s.lessonMs)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {s.bestScore !== null ? `${s.bestScore}/${s.total}` : "—"}
                      {s.quizAttempts > 1 && <span className="text-stone-400"> · {s.quizAttempts} tries</span>}
                    </td>
                    <td className="px-3 py-2 text-stone-600">{s.passedAt ? fmtDate(s.passedAt) : "—"}</td>
                    <td className="px-3 py-2 text-stone-600">{s.masteredAt ? fmtDate(s.masteredAt) : "—"}</td>
                    <td className="px-5 py-2 text-stone-600">{s.reviewDueAt ? (s.reviewDueAt < now ? <span className="text-[#8a5d0f]">Due {fmtDate(s.reviewDueAt)}</span> : fmtDate(s.reviewDueAt)) : "—"}</td>
                  </tr>
                ))}
                {d.skills.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-8 text-center text-stone-500">
                      Hasn&apos;t opened a skill yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-[#c9d6ee] bg-white">
          <div className="px-5 pb-3 pt-5">
            <h2 className="text-[15px] font-semibold">
              Recent activity <span className="font-normal text-stone-500">· latest {d.recent.length}</span>
            </h2>
          </div>
          <ul className="divide-y divide-[#e8eef9] border-t border-[#e1e9f7]">
            {d.recent.map((r, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-3 px-5 py-2 text-[13px]">
                <span className="w-[130px] flex-none tabular-nums text-stone-500">{fmtDateTime(r.at)}</span>
                <span className={`w-[16px] flex-none text-center font-bold ${r.good === true ? "text-[#2f6f4f]" : r.good === false ? "text-[#b23b2e]" : "text-stone-400"}`} aria-label={r.good === true ? "right" : r.good === false ? "wrong" : r.kind}>
                  {r.good === true ? "✓" : r.good === false ? "✗" : "·"}
                </span>
                <span className="font-medium">{r.skill}</span>
                <span className="text-stone-500">{r.detail}</span>
              </li>
            ))}
            {d.recent.length === 0 && <li className="px-5 py-8 text-center text-[13px] text-stone-500">Nothing yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#c9d6ee] bg-white p-3.5">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-stone-500">{label}</div>
      <div className="mt-1 font-display text-[21px] font-semibold leading-none tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-[11.5px] text-stone-500">{sub}</div>}
    </div>
  );
}

function Card({ title, aside, className = "", children }: { title: string; aside?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-xl border border-[#c9d6ee] bg-white p-5 ${className}`}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {aside && <span className="text-[13px] tabular-nums text-stone-500">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-[13px]">
      <span className="text-stone-500">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}
