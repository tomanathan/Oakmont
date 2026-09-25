"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PET_NAME, SECOND_PET_NAME } from "@/lib/pet";
import { PetAvatar } from "@/components/PetAvatar";
import { BrandMark } from "@/components/BrandMark";
import { AddParentForm, ParentRow, type AddedParent } from "@/components/AddParentForm";

export type WelcomeStep = "name" | "date" | "score" | "parent" | "tour" | "ready";
const ALL_STEPS: WelcomeStep[] = ["name", "date", "score", "parent", "tour", "ready"];
const STEP_LABELS: Record<WelcomeStep, string> = {
  name: "You",
  date: "Test date",
  score: "Goal",
  parent: "Parent",
  tour: "How it works",
  ready: "Your plan",
};

const DEFAULT_PLAN_WEEKS = 26;
const TIGHT_WEEKS = 4;
const GOAL_PRESETS = [1200, 1300, 1400, 1500];

type DateChoice = { kind: "sat"; date: string } | { kind: "other"; date: string } | { kind: "unsure" };

interface Props {
  email: string;
  single: WelcomeStep | null;
  hasAccess: boolean;
  initial: { firstName: string; baselineScore: number | null; goalScore: number | null; targetTestDate: string | null };
  parents: AddedParent[];
  optedOut: boolean;
  satDates: { date: string; label: string; weeks: number }[];
  today: string;
  skills: { id: string; name: string; section: string }[];
  practiceTests: number;
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function WelcomeClient(props: Props) {
  const { single, hasAccess, initial, satDates, today, skills, practiceTests } = props;
  const router = useRouter();
  const [step, setStep] = useState<WelcomeStep>(single ?? (initial.firstName ? "date" : "name"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(initial.firstName);
  const [dateChoice, setDateChoice] = useState<DateChoice>(() => {
    const d = initial.targetTestDate;
    if (!d) return { kind: "unsure" };
    return satDates.some((s) => s.date === d) ? { kind: "sat", date: d } : { kind: "other", date: d };
  });
  const [baseline, setBaseline] = useState(initial.baselineScore?.toString() ?? "");
  const [noScore, setNoScore] = useState(false);
  const [goal, setGoal] = useState(initial.goalScore ?? 1300);
  const [goalTouched, setGoalTouched] = useState(initial.goalScore !== null);
  const [parents, setParents] = useState<AddedParent[]>(props.parents);
  const [parentChoice, setParentChoice] = useState<"yes" | "solo" | null>(
    props.parents.length > 0 ? "yes" : props.optedOut ? "solo" : null
  );
  // The name is asked at signup, so this step only shows for older
  // accounts that don't have one.
  const STEPS = initial.firstName ? ALL_STEPS.filter((s) => s !== "name") : ALL_STEPS;

  // A date picked on the homepage's "When's your test?" carries over.
  useEffect(() => {
    if (initial.targetTestDate) return;
    try {
      const saved = localStorage.getItem("oakmont:test-date");
      if (saved && satDates.some((s) => s.date === saved)) setDateChoice({ kind: "sat", date: saved });
    } catch {}
    // Only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suggest a goal 150 points above the starting score until the student
  // picks one themselves.
  const baselineNum = baseline ? Number(baseline) : null;
  const validBaseline = baselineNum !== null && baselineNum >= 400 && baselineNum <= 1600 ? baselineNum : null;
  useEffect(() => {
    if (goalTouched || validBaseline === null) return;
    setGoal(Math.min(1600, Math.round((validBaseline + 150) / 10) * 10));
  }, [validBaseline, goalTouched]);

  const chosenDate = dateChoice.kind === "unsure" ? null : dateChoice.date || null;
  const planWeeks = chosenDate ? Math.max(1, Math.ceil(daysBetween(today, chosenDate) / 7)) : DEFAULT_PLAN_WEEKS;
  const contentWeeks = Math.max(1, planWeeks - 1);
  const skillsPerWeek = Math.ceil(skills.length / contentWeeks);
  const firstWeek = skills.slice(0, skillsPerWeek);
  const displayName = name.trim();

  // The roaming Ozho celebrates when the plan is ready.
  useEffect(() => {
    if (step !== "ready") return;
    window.dispatchEvent(new CustomEvent("ozho:celebrate", { detail: { message: "Let's do this!", tier: "small" } }));
  }, [step]);

  async function patch(body: Record<string, unknown>): Promise<boolean> {
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Couldn't save. Please try again.");
        return false;
      }
      return true;
    } catch {
      setError("Couldn't reach the server. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function next() {
    setError("");
    // Reopened from the dashboard to set goals: date, then score.
    if (single === "date" && step === "date") {
      setStep("score");
      return;
    }
    if (single) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    const i = STEPS.indexOf(step);
    setStep(STEPS[Math.min(STEPS.length - 1, i + 1)]);
    window.scrollTo({ top: 0 });
  }

  function back() {
    setError("");
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (await patch({ firstName: name })) next();
  }

  async function saveDate() {
    if (dateChoice.kind === "other" && !dateChoice.date) {
      setError("Pick a date, or choose “Not sure yet.”");
      return;
    }
    if (await patch({ targetTestDate: chosenDate })) next();
  }

  async function saveScores() {
    if (!noScore && baseline && validBaseline === null) {
      setError("Scores run from 400 to 1600.");
      return;
    }
    const ok = await patch({
      baselineScore: noScore ? null : validBaseline,
      goalScore: goalTouched || validBaseline !== null ? goal : null,
    });
    if (ok) next();
  }

  async function saveParentChoice() {
    if (parentChoice === "solo") {
      if (await patch({ parentOptOut: true })) next();
      return;
    }
    next();
  }

  async function finish(to: string) {
    setSaving(true);
    try {
      await fetch("/api/welcome/seen", { method: "POST" });
    } catch {
      // Not worth blocking on: worst case they see this page once more.
    }
    router.push(to);
    router.refresh();
  }

  const stepIndex = STEPS.indexOf(step);
  const ozhoLine: Record<WelcomeStep, string> = {
    name: `Hi! I'm ${PET_NAME}, and I'll be studying right alongside you. What should I call you?`,
    date: displayName
      ? `Hi ${displayName}! I'm ${PET_NAME}, and I'll be studying right alongside you. First up: when's the big day?`
      : `Hi! I'm ${PET_NAME}, and I'll be studying right alongside you. First up: when's the big day?`,
    score: "Where are we starting, and where are we headed?",
    parent: "Let's get your parent in the loop. They'll love seeing this.",
    tour: "Here's how we'll get there, in two minutes.",
    ready: displayName ? `That's everything, ${displayName}. Your plan is ready!` : "That's everything. Your plan is ready!",
  };

  return (
    <div className="mx-auto max-w-[680px] px-4 pb-16 pt-6 font-sans sm:px-6">
      {/* Header: brand, progress, a way out. */}
      <div className="mb-8 flex items-center justify-between gap-3">
        <BrandMark size={36} />
        {!single && step !== "ready" && (
          <button
            onClick={() => setStep(parentChoice ? "ready" : "parent")}
            className="text-xs text-stone-400 underline underline-offset-2 hover:text-stone-600"
          >
            Skip setup
          </button>
        )}
        {single && (
          <button onClick={() => router.push("/dashboard")} className="text-xs text-stone-400 underline underline-offset-2 hover:text-stone-600">
            Back to dashboard
          </button>
        )}
      </div>

      {!single && (
        <div className="mb-8" aria-label={`Step ${stepIndex + 1} of ${STEPS.length}: ${STEP_LABELS[step]}`}>
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-colors ${i <= stepIndex ? "bg-forest" : "bg-[#e5dccb]"}`} />
                <div className={`mt-1.5 hidden text-[11px] sm:block ${i === stepIndex ? "font-semibold text-ink" : "text-stone-400"}`}>
                  {STEP_LABELS[s]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ozho, talking. */}
      <div className="mb-6 flex items-end gap-3">
        <div className="flex h-[72px] w-[72px] flex-shrink-0 items-end justify-center rounded-2xl bg-[#fef8f2] pb-1.5 ring-1 ring-[#f0d0b3]">
          <PetAvatar stage="thriving" size={58} />
        </div>
        <div key={step} className="animate-fade-up relative mb-2 rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[15px] leading-snug text-ink shadow-[0_1px_2px_rgba(38,34,24,0.05),0_6px_18px_rgba(38,34,24,0.06)] ring-1 ring-[#ebe3d3]">
          {ozhoLine[step]}
        </div>
      </div>

      <div key={`card-${step}`} className="animate-fade-up">
        {step === "name" && (
          <form onSubmit={saveName} className={CARD}>
            <h1 className={H1}>What&apos;s your first name?</h1>
            <p className={SUB}>We&apos;ll use it around the app, and it&apos;s the name a parent sees if you connect one.</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              autoComplete="given-name"
              placeholder="First name"
              className={`${INPUT} mt-5 text-base`}
            />
            <Footer error={error}>
              <button type="submit" disabled={saving} className={PRIMARY}>
                {saving ? "Saving..." : "Continue"}
              </button>
            </Footer>
          </form>
        )}

        {step === "date" && (
          <div className={CARD}>
            <h1 className={H1}>When are you taking the SAT?</h1>
            <p className={SUB}>Your plan is built to finish right before test day. You can change this any time in Settings.</p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {satDates.map((d) => {
                const on = dateChoice.kind === "sat" && dateChoice.date === d.date;
                return (
                  <button key={d.date} onClick={() => setDateChoice({ kind: "sat", date: d.date })} className={chip(on)} aria-pressed={on}>
                    <div className="text-[14px] font-semibold">{d.label}</div>
                    <div className={`text-[12px] ${on ? "text-white/70" : "text-stone-500"}`}>
                      in {d.weeks} {d.weeks === 1 ? "week" : "weeks"}
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => setDateChoice({ kind: "other", date: dateChoice.kind === "other" ? dateChoice.date : "" })}
                className={chip(dateChoice.kind === "other")}
                aria-pressed={dateChoice.kind === "other"}
              >
                <div className="text-[14px] font-semibold">Another date</div>
                <div className={`text-[12px] ${dateChoice.kind === "other" ? "text-white/70" : "text-stone-500"}`}>School day, retake...</div>
              </button>
              <button onClick={() => setDateChoice({ kind: "unsure" })} className={chip(dateChoice.kind === "unsure")} aria-pressed={dateChoice.kind === "unsure"}>
                <div className="text-[14px] font-semibold">Not sure yet</div>
                <div className={`text-[12px] ${dateChoice.kind === "unsure" ? "text-white/70" : "text-stone-500"}`}>Use the recommended 6 months</div>
              </button>
            </div>
            {dateChoice.kind === "other" && (
              <input
                type="date"
                min={today}
                value={dateChoice.date}
                onChange={(e) => setDateChoice({ kind: "other", date: e.target.value })}
                className={`${INPUT} mt-3`}
                aria-label="Test date"
              />
            )}

            <div className="mt-5 rounded-xl bg-[#f6f1e6] p-4" aria-live="polite">
              <div className="font-display text-[26px] font-semibold leading-none text-ink">
                {planWeeks} <span className="text-[15px] font-normal text-stone-500">{planWeeks === 1 ? "week" : "weeks"} of study</span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-stone-600">
                {chosenDate ? `Through ${formatDate(chosenDate)}. ` : "The recommended length. It resizes once you pick a date. "}
                All {skills.length} skills and {practiceTests} full practice tests, about {skillsPerWeek} new{" "}
                {skillsPerWeek === 1 ? "skill" : "skills"} a week.
                {chosenDate && planWeeks <= TIGHT_WEEKS ? " That's a sprint: expect daily sessions." : ""}
              </p>
            </div>
            <Footer error={error} onBack={single ? undefined : back}>
              <button onClick={saveDate} disabled={saving} className={PRIMARY}>
                {saving ? "Saving..." : "Continue"}
              </button>
            </Footer>
          </div>
        )}

        {step === "score" && (
          <div className={CARD}>
            <h1 className={H1}>Your starting point and your goal</h1>
            <p className={SUB}>A PSAT or earlier SAT score works as a starting point. We use these to track your progress, not to grade you.</p>

            <label className="mt-5 block text-sm font-medium text-ink">Most recent score</label>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <input
                type="number"
                inputMode="numeric"
                min={400}
                max={1600}
                step={10}
                value={noScore ? "" : baseline}
                disabled={noScore}
                onChange={(e) => setBaseline(e.target.value)}
                placeholder="e.g. 1120"
                className={`${INPUT} w-40 disabled:bg-stone-50`}
              />
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input type="checkbox" checked={noScore} onChange={(e) => setNoScore(e.target.checked)} className="h-4 w-4 accent-[#1d2621]" />
                I don&apos;t have one yet
              </label>
            </div>

            <div className="mt-6 flex items-baseline justify-between gap-3">
              <label htmlFor="goal" className="text-sm font-medium text-ink">
                Goal score
              </label>
              <div className="font-display text-[28px] font-semibold leading-none text-ink tabular-nums">{goal}</div>
            </div>
            <input
              id="goal"
              type="range"
              min={800}
              max={1600}
              step={10}
              value={goal}
              onChange={(e) => {
                setGoal(Number(e.target.value));
                setGoalTouched(true);
              }}
              className="mt-3 w-full accent-[#1d2621]"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {GOAL_PRESETS.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGoal(g);
                    setGoalTouched(true);
                  }}
                  className={`rounded-full px-3 py-1 text-[13px] font-medium ring-1 transition-colors ${
                    goal === g ? "bg-forest text-white ring-ink" : "bg-white text-stone-600 ring-[#ddd3bf] hover:text-ink"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {!noScore && validBaseline !== null && (
              <p className="mt-4 rounded-xl bg-[#f6f1e6] p-3.5 text-[13px] leading-relaxed text-stone-600">
                {goal > validBaseline ? (
                  <>
                    <span className="font-semibold text-ink">+{goal - validBaseline} points</span> from {validBaseline}. Your practice test scores
                    will show how close you are.
                  </>
                ) : (
                  <>You&apos;re already at that goal. Aim a little higher?</>
                )}
              </p>
            )}
            <Footer error={error} onBack={single ? undefined : back}>
              <button onClick={saveScores} disabled={saving} className={PRIMARY}>
                {saving ? "Saving..." : "Continue"}
              </button>
            </Footer>
          </div>
        )}

        {step === "parent" && (
          <div className={CARD}>
            <h1 className={H1}>Add your parent</h1>
            <p className={SUB}>
              Your parent gets their own dashboard that follows your prep as you go, plus a summary every Sunday, so everyone at home is on
              the same page.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Add your parent">
              <button role="radio" aria-checked={parentChoice === "yes"} onClick={() => setParentChoice("yes")} className={choiceCard(parentChoice === "yes")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[15px] font-semibold">Add my parent</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${parentChoice === "yes" ? "bg-white/15 text-white" : "bg-[#eef6f1] text-[#2f6b4a]"}`}>
                    Recommended
                  </span>
                </div>
                <div className={`mt-1 text-[13px] leading-snug ${parentChoice === "yes" ? "text-white/75" : "text-stone-500"}`}>
                  Their free dashboard connects to your account right away.
                </div>
              </button>
              <button role="radio" aria-checked={parentChoice === "solo"} onClick={() => setParentChoice("solo")} className={choiceCard(parentChoice === "solo")}>
                <span className="text-[15px] font-semibold">Skip for now</span>
                <div className={`mt-1 text-[13px] leading-snug ${parentChoice === "solo" ? "text-white/75" : "text-stone-500"}`}>
                  You can add a parent from Settings later.
                </div>
              </button>
            </div>

            {parentChoice === "yes" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-[1.15fr_1fr]">
                <div>
                  <div className="text-sm font-semibold text-ink">Your parent or guardian&apos;s email</div>
                  <p className="mb-3 mt-1 text-[13px] text-stone-500">We&apos;ll set up their account and email them a link to choose a password.</p>
                  <AddParentForm
                    cta={parents.length ? "Add another" : "Add parent"}
                    onAdded={(p) => setParents((ps) => [...ps.filter((x) => x.id !== p.id), p])}
                  />
                  {parents.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {parents.map((p) => (
                        <ParentRow key={p.id} parent={p} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-xl bg-[#f6f1e6] p-4 text-[13px] leading-relaxed text-stone-600">
                  <div className="mb-1.5 font-semibold text-ink">What your parent gets</div>
                  <ul className="space-y-1">
                    <li>When you study and for how long</li>
                    <li>Lessons, quizzes and reviews, with scores</li>
                    <li>Your progress on each skill</li>
                    <li>Practice test scores against your goal</li>
                  </ul>
                  <div className="mt-2.5 text-[12px] text-stone-500">A summary email every Sunday, with what to celebrate and what to ask about.</div>
                </div>
              </div>
            )}
            <Footer error={error} onBack={single || STEPS.indexOf("parent") === 0 ? undefined : back}>
              <div className="flex items-center gap-3">
                {parentChoice === "yes" && parents.length === 0 && (
                  <span className="hidden text-[12px] text-stone-400 sm:inline">Add their email to continue</span>
                )}
                <button
                  onClick={saveParentChoice}
                  disabled={saving || !parentChoice || (parentChoice === "yes" && parents.length === 0)}
                  className={PRIMARY}
                >
                  {saving ? "Saving..." : "Continue"}
                </button>
              </div>
            </Footer>
          </div>
        )}

        {step === "tour" && (
          <div className={CARD}>
            <h1 className={H1}>How Oakmont works</h1>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {TOUR.map((t) => (
                <div key={t.title} className="rounded-xl border border-[#ebe3d3] bg-[#f8f4eb] p-4">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                    <span className="h-2 w-2 rounded-full" style={{ background: t.color }} aria-hidden />
                    {t.title}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-stone-600">{t.body}</p>
                </div>
              ))}
            </div>
            <MeetOzho />
            <Footer error={error} onBack={single ? undefined : back}>
              <button onClick={next} className={PRIMARY}>
                {single ? "Done" : "Continue"}
              </button>
            </Footer>
          </div>
        )}

        {step === "ready" && (
          <div className={CARD}>
            <h1 className={H1}>{displayName ? `${displayName}'s plan` : "Your plan"}</h1>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <Summary label="Test day" value={chosenDate ? formatDate(chosenDate) : "Not set"} note={`${planWeeks}-week plan`} />
              <Summary
                label="Goal"
                value={initial.goalScore !== null || goalTouched || validBaseline !== null ? String(goal) : "Not set"}
                note={validBaseline !== null && !noScore ? `Starting from ${validBaseline}` : "Set it any time"}
              />
              <Summary
                label="Parent"
                value={
                  parents.length === 0
                    ? parentChoice === "solo"
                      ? "Skipped"
                      : "Not set"
                    : parents.some((p) => !p.pending)
                    ? "Connected"
                    : "Invited"
                }
                note={parents.length ? parents.map((p) => p.email).join(", ") : "Add one any time in Settings"}
              />
            </dl>

            <div className="mt-5 rounded-xl border border-[#ebe3d3] p-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-stone-400">Week 1</div>
              <ul className="mt-2 space-y-1.5">
                {firstWeek.map((s, i) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 text-[14px]">
                    <span className="text-ink">
                      {s.name}
                      {i === 0 && <span className="ml-2 rounded-full bg-[#eef6f1] px-2 py-0.5 text-[11px] font-semibold text-[#2f6b4a]">First up</span>}
                    </span>
                    <span className="whitespace-nowrap text-[12px] text-stone-400">{s.section}</span>
                  </li>
                ))}
              </ul>
            </div>

            {error && <div className="mt-4 text-sm text-red-700">{error}</div>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              {hasAccess ? (
                <button onClick={() => finish("/dashboard")} disabled={saving} className={PRIMARY}>
                  {saving ? "Opening..." : "Start today's plan"}
                </button>
              ) : (
                <>
                  <button onClick={() => finish("/subscribe")} disabled={saving} className={PRIMARY}>
                    {saving ? "Opening..." : "Choose a plan to start"}
                  </button>
                  <span className="text-[13px] text-stone-500">The monthly plan starts with a 7-day free trial.</span>
                </>
              )}
            </div>
            <button onClick={back} className="mt-4 text-[13px] text-stone-400 hover:text-ink">
              &larr; Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const CARD =
  "rounded-2xl border border-[#ebe3d3] bg-white p-5 shadow-[0_1px_2px_rgba(38,34,24,0.04),0_8px_24px_rgba(38,34,24,0.06)] sm:p-7";
const H1 = "font-display text-[24px] font-semibold leading-tight text-ink sm:text-[28px]";
const SUB = "mt-1.5 text-[14px] leading-relaxed text-stone-500";
const INPUT = "w-full rounded-lg border border-[#ddd3bf] px-3 py-2.5 text-sm focus:border-[#587356] focus:outline-none";
const PRIMARY = "rounded-xl bg-forest px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60";

function choiceCard(on: boolean) {
  return `rounded-xl p-4 text-left ring-1 transition-colors ${on ? "bg-forest text-white ring-ink" : "bg-white text-ink ring-[#ddd3bf] hover:ring-[#b7cbb0]"}`;
}

function chip(on: boolean) {
  return `rounded-xl px-3.5 py-3 text-left ring-1 transition-colors ${
    on ? "bg-forest text-white ring-ink" : "bg-white text-ink ring-[#ddd3bf] hover:ring-[#b7cbb0]"
  }`;
}

function Footer({ error, onBack, children }: { error: string; onBack?: () => void; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      {error && <div className="mb-3 text-sm text-red-700">{error}</div>}
      <div className="flex items-center justify-between gap-3">
        {onBack ? (
          <button type="button" onClick={onBack} className="text-[13px] text-stone-400 hover:text-ink">
            &larr; Back
          </button>
        ) : (
          <span />
        )}
        {children}
      </div>
    </div>
  );
}

function Summary({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl bg-[#f6f1e6] p-3.5">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-400">{label}</dt>
      <dd className="mt-1 font-display text-[18px] font-semibold leading-tight text-ink">{value}</dd>
      <dd className="mt-0.5 truncate text-[12px] text-stone-500">{note}</dd>
    </div>
  );
}

const TOUR = [
  {
    title: "A plan for every day",
    color: "#587356",
    body: "Your dashboard shows today's lesson or review. The Plan page lays out every week until test day.",
  },
  {
    title: "Lesson, quiz, then mastery",
    color: "#3f9a6b",
    body: "Read a short lesson, then pass its quiz. Days later the skill comes back in mixed review. Get it right again and it's mastered.",
  },
  {
    title: "Mistakes explained",
    color: "#c9971b",
    body: "Every wrong answer names the trap you fell for, and the ones you keep repeating get flagged so you can fix them.",
  },
  {
    title: "Confidence and pace",
    color: "#d0685a",
    body: "Mark how sure you are on each answer. A clock shows real SAT pace, so you learn to be accurate and quick.",
  },
  {
    title: "Official practice tests",
    color: "#2c4c3b",
    body: "Take the practice tests in Bluebook when your plan schedules them, then log the scores. Your plan shifts toward your weakest areas.",
  },
  {
    title: "Streaks and stars",
    color: "#8a6bc9",
    body: "Study on back-to-back days to build a streak. Each section fills in stars as its skills move from passed to mastered.",
  },
];

// Ozho's introduction: what he needs, what he earns, and the one real
// stake. "Say hi" sends the roaming Ozho over to this card.
function MeetOzho() {
  const ref = useRef<HTMLDivElement>(null);
  const [greeted, setGreeted] = useState(false);
  function sayHi() {
    const r = ref.current?.getBoundingClientRect();
    const near = r ? { x: r.right + window.scrollX - 60, y: r.top + window.scrollY - 10 } : undefined;
    window.dispatchEvent(
      new CustomEvent(greeted ? "ozho:say" : "ozho:celebrate", {
        detail: {
          message: greeted ? "Still here! Still excited!" : "Hi hi hi! We're going to be a great team.",
          tier: "small",
          near,
        },
      })
    );
    setGreeted(true);
  }
  const facts = [
    { title: "Feed him", body: "Every quiz you finish is a meal. One a day keeps him thriving." },
    { title: "Play with him", body: "Click him to pet him, play fetch, see a trick, or have him lead you to what's next." },
    { title: "Dress him up", body: "Streaks and finished sections unlock outfits in his wardrobe." },
    { title: "Make a friend", body: `Keep a 30-day streak and ${SECOND_PET_NAME} comes to stay.` },
  ];
  return (
    <div ref={ref} className="mt-5 rounded-xl border border-[#f0d0b3] bg-[#fef8f2] p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-[76px] w-[76px] flex-shrink-0 items-end justify-center rounded-2xl bg-white/70 pb-1.5">
          <PetAvatar stage="thriving" size={62} />
        </div>
        <div className="min-w-0">
          <div className="font-display text-[18px] font-semibold text-ink">About {PET_NAME}</div>
          <p className="mt-0.5 text-[13px] leading-relaxed text-stone-600">
            He wanders around while you work, cheers when you get things right, and nudges you when it&apos;s been a while.
          </p>
          <button
            onClick={sayHi}
            className="mt-2 rounded-lg border border-[#f0d0b3] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#9a5a1c] transition-colors hover:border-[#e6b98f]"
          >
            {greeted ? "Say hi again" : `Say hi to ${PET_NAME}`}
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {facts.map((f) => (
          <div key={f.title} className="rounded-lg bg-white/70 px-3.5 py-2.5">
            <div className="text-[13px] font-semibold text-ink">{f.title}</div>
            <div className="mt-0.5 text-xs leading-relaxed text-stone-500">{f.body}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-stone-500">
        One honest warning: he depends on you. After a few days without practice he gets hungry, and a full week without any means
        starting over with a new pet.
      </p>
    </div>
  );
}
