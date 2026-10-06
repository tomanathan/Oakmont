"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { BrandMark } from "@/components/BrandMark";
import { PassageText } from "@/components/PassageText";
import { ExamChoices } from "@/components/ExamChoices";
import { MathText } from "@/components/MathText";
import { PetAvatar } from "@/components/PetAvatar";
import { AddParentForm } from "@/components/AddParentForm";
import type { FigureSpec } from "@/lib/figureTypes";

export interface PracticeQuestion {
  id: string;
  q: string;
  choices: string[];
  answer: number;
  explain: string;
  why: (string | null)[] | null;
  figure: FigureSpec | null;
  example: { pattern: string; q: string; choices: string[]; answer: number; explain: string };
}

const CARD = "rounded-2xl border border-[#c9d6ee] bg-white p-5 shadow-[3px_3px_0_rgba(52,97,193,0.13)] sm:p-6";
const PRIMARY = "w-full rounded-xl bg-forest px-5 py-3.5 text-[15px] font-semibold text-white disabled:opacity-60";
const H1 = "font-display text-[26px] font-semibold leading-tight text-ink";

export function PracticeClient({
  skillId,
  skillName,
  firstName,
  questions,
  parentConnected,
}: {
  skillId: string;
  skillName: string;
  firstName: string | null;
  questions: PracticeQuestion[];
  parentConnected: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [ms, setMs] = useState<Record<string, number>>({});
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [showExample, setShowExample] = useState(false);
  const [done, setDone] = useState(false);
  const [connected, setConnected] = useState(parentConnected);

  // Saving the plan was Day 1: Ozho perks up and says so.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("ozho:fed"));
    window.dispatchEvent(
      new CustomEvent("ozho:say", { detail: { message: `Day 1${firstName ? `, ${firstName}` : ""}! Saving your plan fed me. Five more?` } })
    );
    const url = new URL(window.location.href);
    if (url.searchParams.get("via") === "google") {
      track("signup_completed", { method: "google", via: "start" });
      url.searchParams.delete("via");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, [firstName]);

  const current = questions[index];
  const picked = current ? picks[current.id] : undefined;
  const revealed = picked !== undefined;
  const right = revealed && picked === current.answer;

  function pick(choice: number) {
    if (revealed) return;
    setPicks((p) => ({ ...p, [current.id]: choice }));
    setMs((m) => ({ ...m, [current.id]: Date.now() - shownAt }));
  }

  async function next() {
    setShowExample(false);
    window.scrollTo({ top: 0 });
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setShownAt(Date.now());
      return;
    }
    setDone(true);
    const correct = questions.filter((q) => picks[q.id] === q.answer).length;
    track("start_practice_done", { correct });
    await fetch("/api/start/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skillId,
        items: questions.filter((q) => picks[q.id] !== undefined).map((q) => ({ itemId: q.id, choiceText: q.choices[picks[q.id]], ms: ms[q.id] })),
      }),
    }).catch(() => {});
  }

  if (done) {
    return (
      <div className="mx-auto max-w-[560px] px-4 pb-16 pt-5 font-sans">
        <BrandMark size={32} className="mb-5" />
        <div className="animate-fade-up">
          <div className="flex items-center gap-3">
            <PetAvatar stage="thriving" size={56} />
            <div>
              <h1 className={H1}>Day 1: done</h1>
              <p className="text-[15px] text-stone-600">
                You&apos;ve started {skillName}. Ozho&apos;s fed and your streak is on.
              </p>
            </div>
          </div>

          {!connected ? (
            <div className={`${CARD} mt-6`}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#26427e]">Let your parents connect</div>
              <h2 className="mt-1 text-[19px] font-semibold text-ink">Connect with your parents</h2>
              <p className="mt-1 text-[14px] leading-relaxed text-stone-600">
                They get a weekly highlight of your wins, so fewer &ldquo;did you study?&rdquo; texts.
              </p>
              <div className="mt-4">
                <AddParentForm
                  cta="Connect"
                  onAdded={() => {
                    setConnected(true);
                    track("start_parent_connected");
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-[#e9effb] p-4 text-[14px] text-[#26427e]">You&apos;re connected with your parent. They&apos;ll see this week&apos;s wins.</div>
          )}

          <Link
            href="/dashboard"
            className={
              connected
                ? `${PRIMARY} mt-6 block text-center`
                : "mt-5 block w-full rounded-xl px-5 py-3.5 text-center text-[15px] font-semibold text-ink ring-1 ring-[#b4c5e6]"
            }
          >
            {connected ? "Go to my dashboard" : "Skip for now"}
          </Link>
          <Link href={`/subskill/${skillId}`} className="mt-3 block text-center text-[14px] font-semibold text-forest underline underline-offset-4">
            Keep going: the {skillName} lesson
          </Link>
        </div>
      </div>
    );
  }

  if (!current) return null;
  return (
    <div className="mx-auto max-w-[560px] px-4 pb-16 pt-5 font-sans">
      <div className="mb-5 flex items-center justify-between">
        <BrandMark size={32} />
        <div className="flex items-center gap-1.5" aria-label={`Question ${index + 1} of ${questions.length}`}>
          {questions.map((q, i) => (
            <span key={q.id} className={`h-2 w-7 rounded-full ${i < index || (i === index && revealed) ? "bg-forest" : i === index ? "bg-[#9db3e0]" : "bg-[#d3ddf1]"}`} />
          ))}
        </div>
      </div>
      <div key={current.id} className="animate-fade-up">
        {index === 0 && !revealed && <p className="mb-3 text-[14px] text-stone-600">First up: {skillName}. Five quick ones.</p>}
        <div className={CARD}>
          <div className="mb-4 text-[15.5px] leading-relaxed text-ink">
            <PassageText text={current.q} figure={current.figure} />
          </div>
          <ExamChoices choices={current.choices} correctIndex={current.answer} selected={picked ?? null} revealed={revealed} onSelect={pick} />
          {revealed && (
            <div className={`mt-4 rounded-xl p-4 text-[14px] leading-relaxed ${right ? "bg-[#eaf6ef] text-[#23553a]" : "bg-[#eef3fb] text-stone-700"}`}>
              <div className="mb-1 font-semibold">{right ? "Nice." : "Here's the move:"}</div>
              <MathText text={!right && current.why?.[picked!] ? `${current.why[picked!]} ${current.explain}` : current.explain} />
            </div>
          )}
          {revealed && !right && (
            <div className="mt-3">
              {!showExample ? (
                <button onClick={() => setShowExample(true)} className="text-[14px] font-semibold text-forest underline underline-offset-4">
                  See how this type works
                </button>
              ) : (
                <div className="rounded-xl border border-[#c9d6ee] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">Worked example: {current.example.pattern}</div>
                  <div className="mt-2 text-[14px] leading-relaxed text-ink">
                    <PassageText text={current.example.q} />
                  </div>
                  <div className="mt-2 text-[14px] font-semibold text-[#2f6f4f]">
                    Answer: <MathText text={current.example.choices[current.example.answer]} />
                  </div>
                  <div className="mt-1 text-[14px] leading-relaxed text-stone-700">
                    <MathText text={current.example.explain} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {revealed && (
          <button onClick={next} className={`${PRIMARY} mt-4`}>
            {index < questions.length - 1 ? "Next question" : "Finish"}
          </button>
        )}
      </div>
    </div>
  );
}
