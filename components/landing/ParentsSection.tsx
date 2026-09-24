import Link from "next/link";
import { sampleParentReport } from "@/lib/parentDemo";
import type { ParentReport, TalkingPoint } from "@/lib/parentInsights";
import { ActivityCalendar, ScoreTrend, PctBar } from "@/components/parent/charts";
import { TrackedLink } from "./TrackedLink";

// The parent pitch, told with the real report's own pieces: a composed
// snapshot up top, then one tile per thing a parent learns, each drawn
// from the same sample student ("Maya", invented and labeled as such).
// The whole report lives at /parents/sample for anyone who wants it all.

const GREEN = "#2f6f4f";

function hm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function agoText(iso: string | null): string {
  if (!iso) return "recently";
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m} minutes ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

function Up({ n, unit = "" }: { n: number; unit?: string }) {
  if (n === 0) return <span className="text-[11px] text-gray-400">same as last week</span>;
  return (
    <span className={`text-[11px] font-semibold ${n > 0 ? "text-accent" : "text-[#b23b3b]"}`}>
      {n > 0 ? "▲" : "▼"} {Math.abs(n)}
      {unit} vs last week
    </span>
  );
}

const SAMPLE_PILL = (
  <span className="whitespace-nowrap rounded-full bg-[#fbf1df] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#9a6a12]">
    Sample
  </span>
);

// ---- the snapshot: report card + Sunday email + a mastery moment --------------

function Snapshot({ r }: { r: ParentReport }) {
  const w = r.week;
  const maxDay = Math.max(1, ...w.dayFlags.map((d) => d.minutes));
  const help = r.talkingPoints.find((t) => t.kind === "celebrate") ?? r.talkingPoints[0];
  const mastered = r.strengths.find((s) => s.status === "mastered");
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
      {/* The report card. */}
      <div className="relative z-10 rounded-2xl border border-[#e6e3f3] bg-white p-5 shadow-[0_2px_4px_rgba(26,26,46,0.04),0_24px_60px_-20px_rgba(26,26,46,0.25)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-400">Study report</div>
            <div className="font-display text-[26px] font-semibold leading-tight text-ink">{r.name}</div>
            <div className="text-[12px] text-gray-500">
              Last studied {agoText(r.lastActive)} &middot; {r.scores.daysUntilTest} days to the SAT
            </div>
          </div>
          {SAMPLE_PILL}
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#cfe6d8] bg-[#eef7f1] px-4 py-3">
          <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" aria-hidden />
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-accent">On track</div>
            <div className="font-display text-[17px] font-semibold leading-snug text-ink">{r.verdict.headline}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <Kpi label="Study time, 7 days" value={hm(w.minutes)} delta={<Up n={w.minutes - w.minutesPrev} unit=" min" />} />
          <Kpi label="Answered correctly" value={`${w.accuracy}%`} delta={<Up n={(w.accuracy ?? 0) - (w.accuracyPrev ?? 0)} unit=" pts" />} />
          <Kpi label="Questions" value={String(w.questions)} delta={<Up n={w.questions - w.questionsPrev} />} />
          <Kpi label="Skills mastered" value={`${r.mastery.mastered}/${r.mastery.total}`} delta={<span className="text-[11px] text-gray-400">{r.mastery.passed} more passed</span>} />
        </div>

        <div className="mt-4 border-t border-[#f0eef8] pt-3">
          <div className="mb-2 flex items-baseline justify-between text-[11px] text-gray-400">
            <span>Last 7 days</span>
            <span>
              {w.activeDays} of 7 days studied
            </span>
          </div>
          <div className="flex h-14 items-end gap-1.5">
            {w.dayFlags.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-[4px]"
                  style={{
                    height: d.minutes ? `${Math.max(12, (d.minutes / maxDay) * 40)}px` : "4px",
                    background: d.minutes ? GREEN : "#ece9f7",
                    opacity: d.minutes ? 0.55 + 0.45 * (d.minutes / maxDay) : 1,
                  }}
                  title={`${d.label}: ${d.minutes} min`}
                />
                <span className="text-[10px] text-gray-400">{d.label.slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* A mastery moment, pinned to the corner. */}
      {mastered && (
        <div className="relative z-20 mx-auto -mt-2 w-fit rounded-xl bg-ink px-3.5 py-2.5 text-white shadow-lg sm:absolute sm:-bottom-12 sm:-right-6 sm:mt-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#e6c46a]">★ Mastered</div>
          <div className="text-[13px] font-semibold">{mastered.name}</div>
        </div>
      )}

      {/* The Sunday email, tucked underneath. */}
      <div className="relative z-20 mt-4 rounded-2xl border border-[#e6e3f3] bg-[#fffdf9] p-4 shadow-[0_18px_40px_-18px_rgba(26,26,46,0.3)] sm:absolute sm:-bottom-32 sm:-left-10 sm:mt-0 sm:w-[300px]">
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-white">O</span>
          <span className="font-semibold text-ink">Oakmont</span>
          <span>&middot; Sunday, 8:00 AM</span>
        </div>
        <div className="mt-2 text-[13px] font-semibold leading-snug text-ink">
          {r.name}&apos;s week: {r.verdict.headline}
        </div>
        {help && (
          <div className="mt-1.5 text-[12px] leading-relaxed text-gray-500">
            <span className="font-semibold text-gray-600">How you can help: </span>
            {help.text}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, delta }: { label: string; value: string; delta: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="font-display text-[22px] font-semibold leading-tight text-ink tabular-nums">{value}</div>
      {delta}
    </div>
  );
}

// ---- the tiles ---------------------------------------------------------------------

function Tile({ title, body, className = "", children }: { title: string; body: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col rounded-2xl border border-[#e6e3f3] bg-white p-5 sm:p-6 ${className}`}>
      <h3 className="font-display text-[19px] font-semibold leading-snug text-ink">{title}</h3>
      <p className="mt-1 text-[13.5px] leading-relaxed text-gray-500">{body}</p>
      <div className="mt-5 flex-1">{children}</div>
    </div>
  );
}

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  mastered: { label: "Mastered", cls: "bg-[#eaf6ef] text-accent" },
  due: { label: "Refresher due", cls: "bg-[#fbf1df] text-[#9a6a12]" },
  passed: { label: "Passed quiz", cls: "bg-[#eef0fc] text-[#4a5bb0]" },
  attempted: { label: "In progress", cls: "bg-[#f3f2f7] text-gray-600" },
  new: { label: "Not started", cls: "bg-white text-gray-400 ring-1 ring-[#ece9f7]" },
};

const TALK: Record<TalkingPoint["kind"], { label: string; cls: string }> = {
  celebrate: { label: "Celebrate", cls: "bg-[#eaf6ef] text-accent" },
  ask: { label: "Ask about", cls: "bg-[#eef0fc] text-[#4a5bb0]" },
  nudge: { label: "Nudge", cls: "bg-[#fbf1df] text-[#9a6a12]" },
  plan: { label: "Plan", cls: "bg-[#f3f2f7] text-gray-600" },
};

function trimTalk(text: string): string {
  const first = text.split(/(?<=\.)\s/)[0];
  return first.length > 150 ? `${first.slice(0, 147)}...` : first;
}

const STEPS = [
  { title: "Your student adds you", body: "They enter your email while setting up their account." },
  { title: "You set a password", body: "From the email we send you. Parent accounts are free." },
  { title: "Follow along", body: "Your report updates as they study, with a summary every Sunday." },
];

export function ParentsSection() {
  const r = sampleParentReport(new Date());
  const skills = [...r.strengths.slice(0, 2), ...r.focus.slice(0, 2)];
  const conf = r.confidence;
  const mathPace = r.pace.find((p) => p.section === "Math");
  const talk = r.talkingPoints.filter((t) => t.kind !== "plan").slice(0, 2);

  return (
    <section id="parents" className="scroll-mt-16 overflow-hidden bg-[#f3f2fa] px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-[1120px]">
        {/* Pitch + snapshot. */}
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_520px] lg:gap-16">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#4a5bb0]">For parents</div>
            <h2 className="text-balance font-display text-[34px] font-semibold leading-[1.06] tracking-[-0.01em] text-ink sm:text-[48px]">
              Know how SAT prep is going without having to ask.
            </h2>
            <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-gray-600">
              A free parent account shows every study session, every skill and every practice score, updated each time your student
              practices. Every Sunday, a short email tells you how the week went and what to say about it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <TrackedLink
                href="/parent/login?mode=signup"
                event="parent_signup_started"
                className="rounded-xl bg-ink px-6 py-3.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Create a free parent account
              </TrackedLink>
              <Link
                href="/parents/sample"
                className="rounded-xl px-5 py-3.5 text-center text-sm font-semibold text-ink ring-1 ring-[#d9d6ee] transition-colors hover:bg-white"
              >
                Open the full sample report &rarr;
              </Link>
            </div>
          </div>
          <div className="sm:pb-32 sm:pl-10">
            <Snapshot r={r} />
          </div>
        </div>

        {/* What a parent learns, one tile each. */}
        <div className="mt-24 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Tile
            className="md:col-span-2"
            title="Every study session"
            body="When they studied, for how long, and what they covered: lessons read, quizzes taken and the score on each."
          >
            <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
              <div className="overflow-x-auto">
                <ActivityCalendar days={r.calendar} />
              </div>
              <ul className="flex flex-col gap-2">
                {r.sessions.slice(0, 3).map((ses) => (
                  <li key={ses.start} className="rounded-xl bg-[#faf9fd] px-3.5 py-2.5">
                    <div className="flex items-baseline justify-between gap-2 text-[12px]">
                      <span className="font-semibold text-ink">
                        {new Date(ses.start).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit", timeZone: r.timeZone })}
                      </span>
                      <span className="tabular-nums text-gray-500">{ses.minutes} min</span>
                    </div>
                    <div className="mt-0.5 truncate text-[12px] text-gray-500">
                      {ses.subskills.slice(0, 2).join(", ") || "Mixed review"}
                      {ses.questions > 0 && ` \u00b7 ${ses.correct}/${ses.questions} correct`}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Tile>

          <Tile title="All 29 skills, one by one" body="Not started, in progress, passed or mastered, with accuracy on each.">
            <ul className="flex flex-col gap-3.5">
              {skills.map((s) => (
                <li key={s.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium text-ink">{s.name}</span>
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_PILL[s.status].cls}`}>
                      {STATUS_PILL[s.status].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PctBar value={s.accuracy} color={(s.accuracy ?? 0) < 60 ? "#c9971b" : GREEN} />
                    <span className="w-9 text-right text-[11px] tabular-nums text-gray-500">{s.accuracy}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </Tile>

          <Tile title="Scores against the goal" body="Every practice test they log, plotted from their starting point toward their target.">
            <ScoreTrend tests={r.scores.tests} baseline={r.scores.baseline} goal={r.scores.goal} />
          </Tile>

          <Tile title="Habits you'd never see" body="Whether they're guessing, confidently wrong, or rushing compared with real SAT pace.">
            <ul className="flex flex-col gap-3">
              {conf.map((c) => (
                <li key={c.level}>
                  <div className="mb-1 flex justify-between text-[12px]">
                    <span className="text-gray-600">
                      Marked <span className="font-semibold text-ink">{c.level}</span>
                    </span>
                    <span className="tabular-nums text-gray-500">{c.accuracy}% right</span>
                  </div>
                  <PctBar value={c.accuracy} color={c.level === "sure" ? GREEN : c.level === "unsure" ? "#6d7fd6" : "#c9971b"} />
                </li>
              ))}
            </ul>
            {mathPace && mathPace.rushedAccuracy !== null && (
              <p className="mt-4 rounded-lg bg-[#faf9fd] px-3 py-2 text-[12px] leading-relaxed text-gray-600">
                Rushed Math answers: <span className="font-semibold text-ink">{mathPace.rushedAccuracy}% right</span>, against{" "}
                {mathPace.steadyAccuracy}% when they take their time.
              </p>
            )}
          </Tile>

          <Tile title="What to say this week" body="Specific suggestions from the week's data: what to praise, and what to ask about.">
            <ul className="flex flex-col gap-3">
              {talk.map((t, i) => (
                <li key={i} className="rounded-xl bg-[#faf9fd] p-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${TALK[t.kind].cls}`}>{TALK[t.kind].label}</span>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-gray-600">{trimTalk(t.text)}</p>
                </li>
              ))}
            </ul>
          </Tile>
        </div>
        <p className="mt-4 text-center text-[12px] text-gray-400">
          Sample data. &ldquo;Maya&rdquo; is invented, and her numbers are generated to show what a real report looks like.
        </p>

        {/* How connecting works. */}
        <div className="mt-14 rounded-3xl bg-ink p-6 text-white sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.6fr] lg:items-center">
            <div>
              <h3 className="font-display text-[26px] font-semibold leading-snug">Set up in two minutes</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/65">
                Your dashboard is tied to your student&apos;s account from day one, so it fills in the moment they start. Signing up first?
                Create your account and send them a link.
              </p>
            </div>
            <ol className="grid gap-3 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
                  <div className="text-[11px] font-bold tabular-nums text-[#b7bdea]">Step {i + 1}</div>
                  <div className="mt-1 text-[15px] font-semibold leading-snug">{s.title}</div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-white/60">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
