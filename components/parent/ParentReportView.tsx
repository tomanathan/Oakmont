"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { ParentReport, SkillRow, Tone, FeedEvent, Session } from "@/lib/parentInsights";
import type { SubskillStatus } from "@/lib/progressState";
import { PacingBar, PACE_STATUS_STYLES, paceStatusCopy } from "@/components/PacingBar";
import { ActivityCalendar, WeeklyTrend, ScoreTrend, PctBar } from "./charts";

// The parent's view of one student: a verdict up top, the week in
// numbers, then Overview / Activity / Skills / Habits / Scores. Shared by
// the parent dashboard and the student's own share link.

const RW = "#6d7fd6";
const MATH = "#d97a4d";
const GREEN = "#2f6f4f";

const TONE: Record<Tone, { bg: string; border: string; dot: string; label: string; text: string }> = {
  good: { bg: "bg-[#eef7f1]", border: "border-[#cfe6d8]", dot: "bg-accent", label: "On track", text: "text-accent" },
  watch: { bg: "bg-[#fffaf0]", border: "border-[#f0e0b0]", dot: "bg-[#c9971b]", label: "Worth watching", text: "text-[#9a6a12]" },
  act: { bg: "bg-[#fdf1f1]", border: "border-[#f0d0d0]", dot: "bg-[#c24a4a]", label: "Needs a push", text: "text-[#b23b3b]" },
};

const STATUS: Record<SubskillStatus, { label: string; cls: string }> = {
  mastered: { label: "Mastered", cls: "bg-[#eaf6ef] text-accent" },
  due: { label: "Refresher due", cls: "bg-[#fbf1df] text-[#9a6a12]" },
  passed: { label: "Passed quiz", cls: "bg-[#eef0fc] text-[#4a5bb0]" },
  attempted: { label: "In progress", cls: "bg-[#f3f2f7] text-gray-600" },
  new: { label: "Not started", cls: "bg-white text-gray-400 ring-1 ring-[#ece9f7]" },
};

const card = "rounded-2xl border border-[#ece9f7] bg-white p-5 shadow-[0_1px_2px_rgba(26,26,46,0.03)] sm:p-6";
const eyebrow = "text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-400";
const h2 = "font-display text-[22px] font-semibold text-ink";

function ago(iso: string | null, now: number): string {
  if (!iso) return "never";
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (s < 90) return "just now";
  const m = s / 60;
  if (m < 60) return `${Math.round(m)} minutes ago`;
  const h = m / 60;
  if (h < 24) return `${Math.round(h)} hour${Math.round(h) === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "yesterday";
  if (d < 30) return `${d} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtMinutes(m: number): string {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} hr ${r} min` : `${h} hr`;
}

function Delta({ now, prev, unit = "", invert = false }: { now: number | null; prev: number | null; unit?: string; invert?: boolean }) {
  if (now === null || prev === null) return null;
  const d = now - prev;
  if (d === 0) return <span className="text-[11px] text-gray-400">same as last week</span>;
  const up = d > 0;
  const good = invert ? !up : up;
  return (
    <span className={`text-[11px] font-semibold ${good ? "text-accent" : "text-[#b23b3b]"}`}>
      {up ? "▲" : "▼"} {Math.abs(d)}
      {unit} vs last week
    </span>
  );
}

function Section({ id, title, kicker, children }: { id: string; title: string; kicker: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 pt-10">
      <div className="mb-4">
        <div className={eyebrow}>{kicker}</div>
        <h2 className={h2}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

const NAV = [
  ["overview", "Overview"],
  ["activity", "Activity"],
  ["skills", "Skills"],
  ["habits", "Habits"],
  ["scores", "Scores"],
] as const;

export function ParentReportView({
  report,
  headerExtra,
  footer,
  frozen = false,
}: {
  report: ParentReport;
  headerExtra?: ReactNode;
  footer?: ReactNode;
  // Sample reports keep "now" at the moment they were built, so relative
  // times ("2 hours ago") stay as written however old the page is.
  frozen?: boolean;
}) {
  const [now, setNow] = useState(() => new Date(report.generatedAt).getTime());
  useEffect(() => {
    if (!frozen) setNow(Date.now());
  }, [frozen]);
  const r = report;
  const tone = TONE[r.verdict.tone];
  const name = r.name;

  return (
    <div>
      {/* ---- header ---- */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className={eyebrow}>Study report</div>
          <h1 className="font-display text-[30px] font-semibold leading-tight text-ink sm:text-[34px]">{name}</h1>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-gray-500">
            <span>
              Last studied <span className="font-medium text-ink">{ago(r.lastActive, now)}</span>
            </span>
            {r.scores.daysUntilTest !== null && r.scores.daysUntilTest >= 0 && (
              <span>
                <span className="font-medium text-ink">{r.scores.daysUntilTest}</span> days until the SAT
              </span>
            )}
            {r.typicalTime && <span>Usually studies {r.typicalTime}</span>}
          </div>
        </div>
        {headerExtra}
      </div>

      {/* ---- verdict ---- */}
      <div className={`mb-4 rounded-2xl border ${tone.border} ${tone.bg} p-5 sm:p-6`}>
        <div className="flex items-start gap-3">
          <span className={`mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full ${tone.dot}`} />
          <div>
            <div className={`text-[11px] font-bold uppercase tracking-[0.12em] ${tone.text}`}>{tone.label}</div>
            <div className="font-display text-[22px] font-semibold leading-snug text-ink">{r.verdict.headline}</div>
            <p className="mt-1 max-w-[70ch] text-[14px] leading-relaxed text-gray-600">{r.verdict.detail}</p>
          </div>
        </div>
      </div>

      {/* ---- the week in numbers ---- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Kpi label="Study time, last 7 days" value={r.week.minutes >= 60 ? `${Math.floor(r.week.minutes / 60)}h ${r.week.minutes % 60}m` : `${r.week.minutes} min`} sub={<Delta now={r.week.minutes} prev={r.week.minutesPrev} unit=" min" />} />
        <div className="col-span-2 rounded-2xl border border-[#ece9f7] bg-white p-4 lg:col-span-2">
          <div className="text-[11.5px] text-gray-500">Study days, last 7 days</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-[26px] font-semibold text-ink">{r.week.activeDays}/7</span>
            <Delta now={r.week.activeDays} prev={r.week.activeDaysPrev} />
          </div>
          <div className="mt-2 flex gap-1.5">
            {r.week.dayFlags.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.label}: ${d.minutes ? `${d.minutes} min` : "no study"}`}>
                <div className={`h-6 w-full rounded-md ${d.active ? "bg-accent" : "bg-[#f1eff8]"}`} style={d.active ? { opacity: 0.45 + Math.min(1, d.minutes / 45) * 0.55 } : undefined} />
                <span className="text-[10px] text-gray-400">{d.label.slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>
        <Kpi label="Questions answered" value={String(r.week.questions)} sub={<Delta now={r.week.questions} prev={r.week.questionsPrev} />} />
        <Kpi label="Answered correctly" value={r.week.accuracy === null ? "—" : `${r.week.accuracy}%`} sub={<Delta now={r.week.accuracy} prev={r.week.accuracyPrev} unit=" pts" />} />
        <Kpi
          className="col-span-2 lg:col-span-1"
          label="Skills mastered"
          value={`${r.mastery.mastered}/${r.mastery.total}`}
          sub={<span className="text-[11px] text-gray-400">{r.mastery.passed} more passed, {r.streak.current}-day streak</span>}
        />
      </div>

      {/* ---- section nav ---- */}
      <nav className="sticky top-2 z-20 mt-6 flex gap-1 overflow-x-auto rounded-xl border border-[#ece9f7] bg-white/90 p-1 backdrop-blur" aria-label="Report sections">
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-[#f3f2fc] hover:text-ink">
            {label}
          </a>
        ))}
      </nav>

      {!r.hasActivity && (
        <div className={`${card} mt-6 text-center`}>
          <div className="font-display text-[20px] font-semibold text-ink">Nothing to report yet</div>
          <p className="mx-auto mt-1 max-w-[52ch] text-sm text-gray-500">
            As soon as {name} starts a lesson or answers a question, it shows up here: time studied, accuracy, what&apos;s clicking and
            what isn&apos;t.
          </p>
        </div>
      )}

      {/* ---- overview ---- */}
      <Section id="overview" kicker="Overview" title="Where things stand">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className={card}>
            <div className={eyebrow}>How you can help this week</div>
            {r.talkingPoints.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">Nothing needs your attention right now. A quick &ldquo;nice work&rdquo; never hurts.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {r.talkingPoints.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[12px] ${
                        t.kind === "celebrate" ? "bg-[#eaf6ef] text-accent" : t.kind === "nudge" ? "bg-[#fdf1f1] text-[#b23b3b]" : t.kind === "plan" ? "bg-[#fbf1df] text-[#9a6a12]" : "bg-[#eef0fc] text-[#4a5bb0]"
                      }`}
                      aria-hidden
                    >
                      {t.kind === "celebrate" ? "★" : t.kind === "nudge" ? "!" : t.kind === "plan" ? "◷" : "?"}
                    </span>
                    <span className="text-[14px] leading-relaxed text-gray-700">{t.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={card}>
            <div className="flex items-baseline justify-between gap-2">
              <div className={eyebrow}>The study plan</div>
              <span className={`text-xs font-semibold ${PACE_STATUS_STYLES[r.plan.pacing.status]}`}>{paceStatusCopy(r.plan.pacing)}</span>
            </div>
            <div className="mb-2 mt-2 text-[13px] text-gray-500">
              Week {Math.min(r.plan.pacing.totalWeeks, Math.ceil(r.plan.pacing.dayOfCourse / 7))} of {r.plan.pacing.totalWeeks}
            </div>
            <PacingBar pacing={r.plan.pacing} />
            <div className="mt-2 flex justify-between text-[11.5px] text-gray-500">
              <span>{r.plan.thisWeek.total > 0 ? `This week's skills: ${r.plan.thisWeek.done}/${r.plan.thisWeek.total}` : "Review week"}</span>
              <span>
                {r.plan.pacing.completedUnits}/{r.plan.pacing.totalUnits} skills done
              </span>
            </div>
            <div className="mt-4 border-t border-[#f1eff8] pt-4">
              <div className={eyebrow}>Score goal</div>
              <ScoreGoal scores={r.scores} />
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <SkillList title="Strengths" empty="Strengths show up once a few skills have enough answered questions." rows={r.strengths} />
          <SkillList title="Focus areas" empty="No weak spots stand out yet." rows={r.focus} focus />
        </div>
      </Section>

      {/* ---- activity ---- */}
      <Section id="activity" kicker="Activity" title="When and how much">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className={card}>
            <div className={eyebrow}>Last 12 weeks</div>
            <div className="mt-3">
              <ActivityCalendar days={r.calendar} />
            </div>
          </div>
          <div className={card}>
            <div className={eyebrow}>Week by week</div>
            <div className="mt-2">
              <WeeklyTrend weeks={r.weeks} />
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className={card}>
            <div className={eyebrow}>Recent study sessions</div>
            <SessionTable sessions={r.sessions} />
          </div>
          <div className={card}>
            <div className={eyebrow}>What happened</div>
            <Feed events={r.feed} now={now} />
          </div>
        </div>
      </Section>

      {/* ---- skills ---- */}
      <Section id="skills" kicker="Skills" title={`All ${r.mastery.total} tested skills`}>
        <MasteryBar mastery={r.mastery} />
        <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <SkillTable skills={r.skills} now={now} />
          <div className={card}>
            <div className={eyebrow}>What&apos;s sticking</div>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-600">
              Quizzes say which skill they test. Mixed reviews don&apos;t: questions from many skills come in random order, which is how the SAT
              works. Accuracy there is the honest measure of what {name} remembers.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Metric label="Skill quizzes, last 30 days" value={r.retention.quizAccuracy} color={RW} />
              <Metric label={`Mixed reviews, last 30 days${r.retention.reviewQuestions ? ` (${r.retention.reviewQuestions} questions)` : ""}`} value={r.retention.reviewAccuracy} color={GREEN} />
            </div>
            {r.mastery.due > 0 && (
              <p className="mt-4 rounded-xl bg-[#fffaf0] p-3 text-[12.5px] leading-relaxed text-[#7a5410]">
                {r.mastery.due} mastered skill{r.mastery.due === 1 ? " is" : "s are"} due for a refresher. They come back in mixed review on a widening schedule so they aren&apos;t
                forgotten by test day.
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* ---- habits ---- */}
      <Section id="habits" kicker="Habits" title="How they work, not just what they get right">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className={card}>
            <div className={eyebrow}>Confidence vs. results</div>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-600">After each answer, {name} marks it Sure, Not sure, or Guessed. Last 30 days:</p>
            <div className="mt-4 flex flex-col gap-3">
              {r.confidence.map((c) => (
                <div key={c.level}>
                  <div className="mb-1 flex justify-between text-[12.5px]">
                    <span className="font-medium text-ink">{c.level === "sure" ? "Sure" : c.level === "unsure" ? "Not sure" : "Guessed"}</span>
                    <span className="text-gray-500">
                      {c.count} answers{c.accuracy !== null ? `, ${c.accuracy}% right` : ""}
                    </span>
                  </div>
                  <PctBar value={c.accuracy} color={c.level === "sure" ? GREEN : c.level === "unsure" ? RW : MATH} />
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-[#fdf1f1] p-2.5">
                <div className="font-display text-[20px] font-semibold text-[#b23b3b]">{r.confidentlyWrong}</div>
                <div className="text-[11px] leading-tight text-gray-600">sure, but wrong: a misunderstanding to fix</div>
              </div>
              <div className="rounded-xl bg-[#fbf1df] p-2.5">
                <div className="font-display text-[20px] font-semibold text-[#9a6a12]">{r.luckyGuesses}</div>
                <div className="text-[11px] leading-tight text-gray-600">lucky guesses, rechecked in review</div>
              </div>
            </div>
          </div>
          <div className={card}>
            <div className={eyebrow}>Pace vs. the real SAT</div>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-600">Average time per question over the last 30 days, against the real test&apos;s pace.</p>
            <div className="mt-4 flex flex-col gap-5">
              {r.pace.map((p) => (
                <PaceBlock key={p.section} p={p} />
              ))}
            </div>
          </div>
          <div className={card}>
            <div className={eyebrow}>Mistakes that keep coming back</div>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-600">Every wrong answer on Oakmont is linked to the trap it falls for. These repeated this month:</p>
            {r.traps.length === 0 ? (
              <p className="mt-4 text-[13px] text-gray-400">No mistake has repeated yet.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {r.traps.map((t, i) => (
                  <li key={i} className="rounded-xl bg-[#faf8f4] p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#4a5bb0]">{t.skill}</span>
                      <span className="whitespace-nowrap text-[11.5px] font-semibold text-[#b23b3b]">{t.count}×</span>
                    </div>
                    <p className="mt-1 text-[13px] leading-snug text-gray-700">{t.trap}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Section>

      {/* ---- scores ---- */}
      <Section id="scores" kicker="Scores" title="Practice tests and the goal">
        <div className={card}>
          {r.scores.tests.length === 0 ? (
            <div className="text-[14px] leading-relaxed text-gray-600">
              No full-length practice tests logged yet. The plan schedules eight official Bluebook practice tests on the way to test day; each
              score {name} logs appears here, with the section and domain breakdown.
              {r.scores.goal && (
                <span>
                  {" "}
                  Goal: <span className="font-semibold text-ink">{r.scores.goal}</span>
                  {r.scores.baseline ? ` (starting from ${r.scores.baseline})` : ""}.
                </span>
              )}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <ScoreTrend tests={r.scores.tests} baseline={r.scores.baseline} goal={r.scores.goal} />
              <div className="flex flex-col gap-1.5">
                {[...r.scores.tests].reverse().map((t, i, arr) => {
                  const prev = arr[i + 1];
                  return (
                    <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#ece9f7] px-3.5 py-2.5 text-sm">
                      <span className="text-gray-500">{new Date(t.takenAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span className="text-right">
                        <span className="font-semibold text-ink">{t.composite}</span>
                        {prev && (
                          <span className={`ml-1.5 text-[11.5px] font-semibold ${t.composite >= prev.composite ? "text-accent" : "text-[#b23b3b]"}`}>
                            {t.composite >= prev.composite ? "+" : ""}
                            {t.composite - prev.composite}
                          </span>
                        )}
                        <span className="block text-[11px] text-gray-400">
                          R&amp;W {t.rw} · Math {t.math}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Section>

      {footer && <div className="mt-10">{footer}</div>}
    </div>
  );
}

// ---- pieces ----------------------------------------------------------------------

function Kpi({ label, value, sub, className = "" }: { label: string; value: string; sub?: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#ece9f7] bg-white p-4 ${className}`}>
      <div className="text-[11.5px] text-gray-500">{label}</div>
      <div className="mt-1 font-display text-[26px] font-semibold leading-tight text-ink">{value}</div>
      <div className="mt-0.5 min-h-[16px]">{sub}</div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: number | null; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[12.5px]">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold text-ink">{value === null ? "—" : `${value}%`}</span>
      </div>
      <PctBar value={value} color={color} />
    </div>
  );
}

function ScoreGoal({ scores }: { scores: ParentReport["scores"] }) {
  const latest = scores.tests.length ? scores.tests[scores.tests.length - 1].composite : null;
  if (!scores.goal && !latest) return <p className="mt-2 text-[13px] text-gray-500">No goal or practice test yet.</p>;
  const lo = 400;
  const hi = 1600;
  const pos = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;
  return (
    <div className="mt-3">
      <div className="relative h-2 rounded-full bg-[#f1eff8]">
        {scores.baseline && <div className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-gray-400" style={{ left: pos(scores.baseline) }} title={`Starting point ${scores.baseline}`} />}
        {latest && <div className="absolute inset-y-0 left-0 rounded-full bg-ink" style={{ width: pos(latest) }} />}
        {scores.goal && <div className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded bg-accent" style={{ left: pos(scores.goal) }} title={`Goal ${scores.goal}`} />}
      </div>
      <div className="mt-2 flex flex-wrap justify-between gap-2 text-[12px] text-gray-500">
        <span>
          Latest: <span className="font-semibold text-ink">{latest ?? "no test yet"}</span>
        </span>
        {scores.goal && (
          <span>
            Goal: <span className="font-semibold text-accent">{scores.goal}</span>
            {latest ? ` (${scores.goal - latest > 0 ? `${scores.goal - latest} to go` : "reached"})` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function SkillList({ title, rows, empty, focus = false }: { title: string; rows: SkillRow[]; empty: string; focus?: boolean }) {
  return (
    <div className={card}>
      <div className={eyebrow}>{title}</div>
      {rows.length === 0 ? (
        <p className="mt-2 text-[13px] text-gray-500">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {rows.map((s) => (
            <li key={s.id}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="text-[13.5px] font-medium text-ink">
                  {s.name}
                  <span className="ml-1.5 text-[11px] font-normal text-gray-400">{s.section === "Math" ? "Math" : "R&W"}</span>
                </span>
                <span className="whitespace-nowrap text-[12px] text-gray-500">
                  {s.accuracy === null ? "" : `${s.accuracy}%`}
                  {focus && ` · ${Math.round(s.weight * 1000) / 10}% of test`}
                </span>
              </div>
              <PctBar value={s.accuracy} color={focus ? MATH : GREEN} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MasteryBar({ mastery }: { mastery: ParentReport["mastery"] }) {
  const parts = [
    { n: mastery.mastered - mastery.due, color: GREEN, label: "Mastered" },
    { n: mastery.due, color: "#c9971b", label: "Refresher due" },
    { n: mastery.passed, color: RW, label: "Passed quiz" },
    { n: mastery.started - mastery.mastered - mastery.passed, color: "#c5cbef", label: "In progress" },
    { n: mastery.total - mastery.started, color: "#f1eff8", label: "Not started" },
  ];
  return (
    <div className={card}>
      <div className="flex h-3 overflow-hidden rounded-full">
        {parts.map((p) => (p.n > 0 ? <div key={p.label} style={{ width: `${(p.n / mastery.total) * 100}%`, background: p.color }} title={`${p.label}: ${p.n}`} /> : null))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] text-gray-600">
        {parts.map((p) => (
          <span key={p.label} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
            {p.label} <span className="font-semibold text-ink">{p.n}</span>
          </span>
        ))}
      </div>
      <p className="mt-3 text-[12.5px] leading-relaxed text-gray-500">
        A perfect quiz passes a skill. It counts as mastered only after it&apos;s answered correctly again later, mixed in with other skills, so a
        good day of cramming can&apos;t fake it.
      </p>
    </div>
  );
}

function SkillTable({ skills, now }: { skills: SkillRow[]; now: number }) {
  const [section, setSection] = useState<"Reading and Writing" | "Math">("Reading and Writing");
  const byDomain = useMemo(() => {
    const m = new Map<string, SkillRow[]>();
    for (const s of skills.filter((x) => x.section === section)) {
      if (!m.has(s.domain)) m.set(s.domain, []);
      m.get(s.domain)!.push(s);
    }
    return [...m.entries()];
  }, [skills, section]);
  const color = section === "Math" ? MATH : RW;
  return (
    <div className={card}>
      <div className="mb-3 flex gap-1 rounded-xl bg-[#f3f2fc] p-1">
        {(["Reading and Writing", "Math"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            aria-pressed={section === s}
            className={`flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${section === s ? "bg-white text-ink shadow-sm" : "text-gray-500 hover:text-ink"}`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-5">
        {byDomain.map(([domain, rows]) => (
          <div key={domain}>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-400">{domain}</div>
            <div className="flex flex-col divide-y divide-[#f1eff8]">
              {rows.map((s) => (
                <div key={s.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 py-2.5 sm:grid-cols-[minmax(0,1fr)_104px_150px_118px]">
                  <span className="min-w-0 truncate text-[13.5px] font-medium text-ink" title={s.name}>
                    {s.name}
                  </span>
                  <span className={`justify-self-end whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS[s.status].cls}`}>{STATUS[s.status].label}</span>
                  <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                    <PctBar value={s.accuracy} color={color} />
                    <span className="w-9 text-right text-[12px] text-gray-500">{s.accuracy === null ? "—" : `${s.accuracy}%`}</span>
                  </div>
                  <span className="col-span-2 text-[11.5px] text-gray-400 sm:col-span-1 sm:text-right">
                    {s.questions ? `${s.questions} q · ` : ""}
                    {s.lastPracticed ? ago(s.lastPracticed, now) : "not yet"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaceBlock({ p }: { p: ParentReport["pace"][number] }) {
  const color = p.section === "Math" ? MATH : RW;
  const ratio = p.avgSeconds === null ? null : p.avgSeconds / p.targetSeconds;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium text-ink">{p.section}</span>
        <span className="text-[12px] text-gray-500">
          {p.avgSeconds === null ? "no timed answers yet" : `${p.avgSeconds}s avg vs ${p.targetSeconds}s on the SAT`}
        </span>
      </div>
      <div className="relative mt-2 h-2 rounded-full bg-[#f1eff8]">
        {ratio !== null && <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, (ratio / 2) * 100)}%`, background: color }} />}
        <div className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-ink" style={{ left: "50%" }} title="SAT pace" />
      </div>
      {p.rushedShare !== null && p.rushedShare > 0 && (
        <p className="mt-2 text-[12px] leading-snug text-gray-500">
          {p.rushedShare}% of answers came in under {Math.round(p.targetSeconds * 0.4)}s
          {p.rushedAccuracy !== null && p.steadyAccuracy !== null ? `: ${p.rushedAccuracy}% right when quick, ${p.steadyAccuracy}% otherwise.` : "."}
        </p>
      )}
    </div>
  );
}

function SessionTable({ sessions }: { sessions: Session[] }) {
  const [all, setAll] = useState(false);
  if (sessions.length === 0) return <p className="mt-3 text-[13px] text-gray-500">No sessions yet.</p>;
  const shown = all ? sessions : sessions.slice(0, 6);
  return (
    <div className="mt-3">
      <div className="flex flex-col divide-y divide-[#f1eff8]">
        {shown.map((s, i) => {
          const d = new Date(s.start);
          return (
            <div key={i} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 py-2.5">
              <div className="w-[96px]">
                <div className="text-[13px] font-medium text-ink">{d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                <div className="text-[11px] text-gray-400">{d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] text-gray-700" title={s.subskills.join(", ")}>
                  {s.subskills.slice(0, 3).join(", ")}
                  {s.subskills.length > 3 ? ` +${s.subskills.length - 3}` : ""}
                </div>
                <div className="text-[11px] text-gray-400">
                  {[s.kinds.includes("lesson") ? `lesson ${s.lessonMinutes} min` : null, s.kinds.includes("quiz") ? "quiz" : null, s.kinds.includes("review") ? "mixed review" : null].filter(Boolean).join(" · ")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold text-ink">{fmtMinutes(s.minutes)}</div>
                {s.questions > 0 && (
                  <div className="text-[11px] text-gray-500">
                    {s.correct}/{s.questions} right
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {sessions.length > 6 && (
        <button onClick={() => setAll((v) => !v)} className="mt-2 text-[12.5px] font-semibold text-[#4a5bb0] hover:underline">
          {all ? "Show fewer" : `Show all ${sessions.length}`}
        </button>
      )}
    </div>
  );
}

const FEED_ICON: Record<FeedEvent["kind"], { icon: string; cls: string }> = {
  mastered: { icon: "★", cls: "bg-[#eaf6ef] text-accent" },
  passed: { icon: "✓", cls: "bg-[#eef0fc] text-[#4a5bb0]" },
  quiz: { icon: "Q", cls: "bg-[#f3f2f7] text-gray-600" },
  review: { icon: "↻", cls: "bg-[#f3f2f7] text-gray-600" },
  test: { icon: "◎", cls: "bg-[#fbe9dd] text-[#b5602f]" },
  lesson: { icon: "¶", cls: "bg-[#f3f2f7] text-gray-600" },
};

function Feed({ events, now }: { events: FeedEvent[]; now: number }) {
  const [all, setAll] = useState(false);
  if (events.length === 0) return <p className="mt-3 text-[13px] text-gray-500">Nothing yet.</p>;
  const shown = all ? events : events.slice(0, 8);
  return (
    <div className="mt-3">
      <ol className="flex flex-col gap-3">
        {shown.map((e, i) => (
          <li key={i} className="flex gap-3">
            <span className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${FEED_ICON[e.kind].cls}`} aria-hidden>
              {FEED_ICON[e.kind].icon}
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-medium leading-snug text-ink">{e.title}</div>
              <div className="text-[11.5px] leading-snug text-gray-500">
                {e.detail} · {ago(e.at, now)}
              </div>
            </div>
          </li>
        ))}
      </ol>
      {events.length > 8 && (
        <button onClick={() => setAll((v) => !v)} className="mt-3 text-[12.5px] font-semibold text-[#4a5bb0] hover:underline">
          {all ? "Show less" : `Show all ${events.length}`}
        </button>
      )}
    </div>
  );
}
