"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { BrandMark } from "@/components/BrandMark";
import { PassageText } from "@/components/PassageText";
import { ExamChoices } from "@/components/ExamChoices";
import { MathText } from "@/components/MathText";
import { PetAvatar } from "@/components/PetAvatar";
import { GoogleButton, OrWithEmail } from "@/components/GoogleButton";
import { clampCourseLengthDays, DEFAULT_COURSE_LENGTH_DAYS } from "@/lib/pacing";
import { leadWith } from "@/lib/planOrder";

export interface StarterQuestion {
  id: string;
  q: string;
  choices: string[];
  answer: number;
  explain: string;
  why: (string | null)[] | null;
  skill: string;
}

type Step = "q" | "result" | "date" | "plan" | "save";
const ALL_RIGHT_FIRST_SKILL = "m-ratios-rates"; // mirrors lib/starter.ts

const CARD = "rounded-2xl border border-[#e2d7c1] bg-white p-5 shadow-[0_1px_2px_rgba(38,34,24,0.04),0_8px_24px_rgba(38,34,24,0.06)] sm:p-6";
const PRIMARY = "w-full rounded-xl bg-forest px-5 py-3.5 text-[15px] font-semibold text-white disabled:opacity-60";
const H1 = "font-display text-[26px] font-semibold leading-tight text-ink";
const INPUT = "w-full rounded-lg border border-[#d5c8ae] px-3 py-3 text-[15px] focus:border-[#587356] focus:outline-none";

function save(body: object) {
  return fetch("/api/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
}

export function StartClient(props: {
  questions: StarterQuestion[];
  savedAnswers: Record<string, number>;
  savedDate?: string | null;
  skillNames: Record<string, string>;
  order: string[];
  satDates: { date: string; label: string; weeks: number }[];
  today: string;
  invite: { token: string; parentEmail: string } | null;
  google: boolean;
  inApp: boolean;
  googleError: boolean;
}) {
  const { questions, skillNames, invite } = props;
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>(props.savedAnswers);
  const firstOpen = questions.findIndex((q) => answers[q.id] === undefined);
  const [index, setIndex] = useState(firstOpen === -1 ? questions.length - 1 : firstOpen);
  const [date, setDate] = useState<string | null | undefined>(props.savedDate);
  const [step, setStep] = useState<Step>(
    props.googleError ? "save" : firstOpen !== -1 ? "q" : props.savedDate !== undefined ? "plan" : "result"
  );

  // Remember the parent's invite with the rest of their progress.
  useEffect(() => {
    if (invite) save({ invite: invite.token });
    track("start_opened", { invite: !!invite });
  }, [invite]);

  const current = questions[index];
  const picked = current ? answers[current.id] : undefined;
  const revealed = picked !== undefined;

  function pick(choice: number) {
    if (revealed) return;
    setAnswers((a) => ({ ...a, [current.id]: choice }));
    save({ answer: { itemId: current.id, choice } });
    if (index === 0) track("start_first_answer");
  }

  function next() {
    if (index < questions.length - 1) setIndex(index + 1);
    else {
      track("start_questions_done");
      setStep("result");
    }
    window.scrollTo({ top: 0 });
  }

  const results = questions.map((q) => ({ q, right: answers[q.id] === q.answer }));
  const rightCount = results.filter((r) => r.right).length;
  const firstSkill = results.find((r) => !r.right)?.q.skill ?? ALL_RIGHT_FIRST_SKILL;

  const plan = useMemo(() => {
    const days = date ? clampCourseLengthDays(Math.round((Date.parse(date) - Date.parse(props.today)) / 86400000)) : DEFAULT_COURSE_LENGTH_DAYS;
    const weeks = Math.max(2, Math.ceil(days / 7));
    const ordered = leadWith(props.order, firstSkill);
    const perWeek = Math.ceil(ordered.length / Math.max(1, weeks - 1));
    return { weeks, week1: ordered.slice(0, Math.max(2, perWeek)) };
  }, [date, firstSkill, props.order, props.today]);

  return (
    <div className="mx-auto max-w-[560px] px-4 pb-16 pt-5 font-sans">
      <div className="mb-5 flex items-center justify-between">
        <BrandMark size={32} />
        {step === "q" ? (
          <div className="flex items-center gap-1.5" aria-label={`Question ${index + 1} of ${questions.length}`}>
            {questions.map((q, i) => (
              <span
                key={q.id}
                className={`h-2 w-7 rounded-full ${i < index || (i === index && revealed) ? "bg-forest" : i === index ? "bg-[#9fb59a]" : "bg-[#e5dccb]"}`}
              />
            ))}
          </div>
        ) : (
          <a href="/login" className="text-[13px] text-stone-500 underline underline-offset-2">
            Log in
          </a>
        )}
      </div>

      {step === "q" && current && (
        <div key={current.id} className="animate-fade-up">
          {index === 0 && !revealed && (
            <p className="mb-3 text-[14px] text-stone-600">
              {invite ? "Five quick SAT questions to start your plan." : "Five quick SAT questions. No account needed."}
            </p>
          )}
          <div className={CARD}>
            <div className="mb-4 text-[15.5px] leading-relaxed text-ink">
              <PassageText text={current.q} />
            </div>
            <ExamChoices choices={current.choices} correctIndex={current.answer} selected={picked ?? null} revealed={revealed} onSelect={pick} />
            {revealed && (
              <div className={`mt-4 rounded-xl p-4 text-[14px] leading-relaxed ${picked === current.answer ? "bg-[#eaf6ef] text-[#23553a]" : "bg-[#f6f1e6] text-stone-700"}`}>
                <div className="mb-1 font-semibold">{picked === current.answer ? "Nice." : "Here's the move:"}</div>
                <MathText text={picked !== current.answer && current.why?.[picked!] ? `${current.why[picked!]} ${current.explain}` : current.explain} />
              </div>
            )}
          </div>
          {revealed && (
            <button onClick={next} className={`${PRIMARY} mt-4`}>
              {index < questions.length - 1 ? "Next question" : "See where I'll start"}
            </button>
          )}
        </div>
      )}

      {step === "result" && (
        <div className="animate-fade-up">
          <h1 className={H1}>Here&apos;s where you&apos;ll start</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
            {rightCount === questions.length
              ? "You got every one. Your plan starts a step ahead."
              : rightCount === 0
                ? "Good news: every one of these is learnable, and the plan starts with the easiest win."
                : "You already have some of this down. Your plan starts where you'll gain the most."}
          </p>
          <ul className={`${CARD} mt-5 flex flex-col gap-3`}>
            {results.map(({ q, right }) => (
              <li key={q.id} className="flex items-center gap-3 text-[15px]">
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${right ? "bg-[#eaf6ef] text-[#2f6f4f]" : "bg-[#fbf1df] text-[#8a5d0f]"}`}
                  aria-label={right ? "Got it" : "To learn"}
                >
                  {right ? "✓" : "→"}
                </span>
                <span className="flex-1 text-ink">{skillNames[q.skill]}</span>
                {q.skill === firstSkill && !right && <span className="rounded-full bg-[#eef6f1] px-2 py-0.5 text-[11px] font-semibold text-[#2f6b4a]">First up</span>}
              </li>
            ))}
          </ul>
          <button onClick={() => setStep("date")} className={`${PRIMARY} mt-5`}>
            Build my plan
          </button>
        </div>
      )}

      {step === "date" && (
        <div className="animate-fade-up">
          <h1 className={H1}>When&apos;s your SAT?</h1>
          <p className="mt-2 text-[15px] text-stone-600">Your plan finishes right before test day.</p>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {props.satDates.slice(0, 5).map((d) => (
              <button
                key={d.date}
                onClick={() => {
                  setDate(d.date);
                  save({ date: d.date });
                  setStep("plan");
                }}
                className="rounded-xl border border-[#d5c8ae] bg-white px-3 py-3.5 text-left hover:border-forest"
              >
                <div className="text-[15px] font-semibold text-ink">{d.label}</div>
                <div className="text-[13px] text-stone-500">{d.weeks <= 0 ? "this week" : `in ${d.weeks} ${d.weeks === 1 ? "week" : "weeks"}`}</div>
              </button>
            ))}
            <button
              onClick={() => {
                setDate(null);
                save({ date: null });
                setStep("plan");
              }}
              className="rounded-xl border border-[#d5c8ae] bg-white px-3 py-3.5 text-left hover:border-forest"
            >
              <div className="text-[15px] font-semibold text-ink">Not sure yet</div>
              <div className="text-[13px] text-stone-500">Plan for 6 months</div>
            </button>
          </div>
        </div>
      )}

      {step === "plan" && (
        <div className="animate-fade-up">
          <h1 className={H1}>Your plan is ready</h1>
          <p className="mt-2 text-[15px] text-stone-600">
            {plan.weeks <= 3 ? "A focused plan to test day" : `${plan.weeks} weeks`}, every SAT skill, a little each day{date ? ", done right before test day" : ""}.
          </p>
          <div className={`${CARD} mt-5`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">Week 1</div>
            <ul className="mt-2 flex flex-col gap-2">
              <li className="flex items-center gap-2.5 text-[15px] text-stone-500 line-through decoration-stone-300">
                <span className="text-[#2f6f4f] no-underline">✓</span> 5 starter questions
              </li>
              {plan.week1.slice(0, 4).map((id, i) => (
                <li key={id} className="flex items-center gap-2.5 text-[15px] text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                  {skillNames[id]}
                  {i === 0 && <span className="rounded-full bg-[#eef6f1] px-2 py-0.5 text-[11px] font-semibold text-[#2f6b4a]">First up</span>}
                </li>
              ))}
              {plan.week1.length > 4 && <li className="pl-4 text-[14px] text-stone-500">and {plan.week1.length - 4} more</li>}
            </ul>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#fef8f2] p-3.5 ring-1 ring-[#f0d0b3]">
            <PetAvatar stage="thriving" size={44} />
            <p className="text-[14px] leading-snug text-stone-700">
              I&apos;m Ozho. Study a little each day and I stay fed. Saving your plan counts as today.
            </p>
          </div>
          <button
            onClick={() => {
              track("start_plan_save_clicked");
              setStep("save");
            }}
            className={`${PRIMARY} mt-5`}
          >
            Save my plan
          </button>
          <p className="mt-2 text-center text-[13px] text-stone-500">7 days free. No card needed.</p>
        </div>
      )}

      {step === "save" && <SaveSheet {...props} onDone={() => router.push("/start/practice")} />}
    </div>
  );
}

function SaveSheet({
  invite,
  google,
  inApp,
  googleError,
  onDone,
}: {
  invite: { token: string; parentEmail: string } | null;
  google: boolean;
  inApp: boolean;
  googleError: boolean;
  onDone: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(googleError ? "Google sign-in didn't work. You can save with your email instead." : "");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      track("signup_completed", { method: "email", via: "start" });
      onDone();
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <h1 className={H1}>Save your plan</h1>
      <p className="mt-2 text-[15px] text-stone-600">Your answers and plan come with you. 7 days free, no card.</p>
      {invite && (
        <div className="mt-4 rounded-xl bg-[#eef3e9] p-3.5 text-[14px] leading-snug text-[#2c4c3b]">
          You&apos;ll be connected with <span className="font-semibold">{invite.parentEmail}</span>, who gets a weekly highlight of your wins.
        </div>
      )}
      <div className={`${CARD} mt-5`}>
        {google && (
          <>
            <GoogleButton href="/api/auth/google?from=start" onClick={() => track("google_signin_clicked", { mode: "start" })} />
            <OrWithEmail className="my-5" />
          </>
        )}
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" autoComplete="given-name" maxLength={40} className={INPUT} required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className={INPUT} required />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (6+ characters)"
            autoComplete="new-password"
            minLength={6}
            className={INPUT}
            required
          />
          {error && <div className="text-[14px] text-red-700">{error}</div>}
          <button type="submit" disabled={busy} className={PRIMARY}>
            {busy ? "Saving..." : "Save my plan"}
          </button>
        </form>
        {inApp && (
          <p className="mt-3 text-center text-[12.5px] text-stone-500">Want to use Google? Open this page in Safari or Chrome.</p>
        )}
      </div>
      <p className="mt-4 text-center text-[13px] text-stone-500">
        Already have an account?{" "}
        <a href="/login" className="font-semibold text-forest underline underline-offset-2">
          Log in
        </a>
      </p>
    </div>
  );
}
