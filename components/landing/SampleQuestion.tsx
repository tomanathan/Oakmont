"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import type { LandingQuestion } from "@/lib/landingQuestions";
import { PassageText } from "@/components/PassageText";
import { TrackedLink } from "./TrackedLink";

const LETTERS = ["A", "B", "C", "D"];

// The page's centerpiece: a real question from the bank, answerable with no
// login, shown with exactly where it sits in the test -- section, domain,
// skill and the specific question type -- so the granularity is visible,
// not just claimed. Questions arrive as props from the server.
export function SampleQuestion({
  questionCount,
  questions,
  subskillCount,
  domainCount,
}: {
  questionCount: number;
  questions: LandingQuestion[];
  subskillCount: number;
  domainCount: number;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const question = questions[index];
  if (!question) return null;
  const answered = selected !== null;
  const correct = answered && selected === question.answer;
  const typeIndex = question.types.indexOf(question.type);
  const trap = answered && !correct && selected !== null ? question.traps[selected] : null;

  function selectChoice(i: number) {
    if (answered) return;
    setSelected(i);
    const isCorrect = i === question.answer;
    track("sample_answered", { correct: isCorrect });
    if (isCorrect) {
      // GlobalConfetti (app/layout.tsx) listens for the first; the hero dogs
      // celebrate on the second.
      window.dispatchEvent(new CustomEvent("ozho:celebrate", { detail: { tier: "big" } }));
      window.dispatchEvent(new CustomEvent("landing:correct"));
    }
  }

  function tryAnother() {
    track("sample_try_another");
    setSelected(null);
    setIndex((i) => (i + 1) % questions.length);
  }

  return (
    <section id="try-a-question" className="scroll-mt-16 bg-[#faf8f4] px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1120px] items-start gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
        <div className="lg:sticky lg:top-24">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#4a5bb0]">Try it now</div>
          <h2 className="mb-4 text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[40px]">
            Not just a question. One exact question type.
          </h2>
          <p className="mb-6 max-w-[460px] text-[15px] leading-relaxed text-gray-600">
            The SAT has 2 sections, {domainCount} domains and {subskillCount} skills. Oakmont goes a level further: every skill is split
            into the specific question types it&apos;s built from, and each type gets its own method, its own traps and its own practice.
          </p>
          {/* Beside the question on wide screens; below it on phones (see
              the second copy), so the question itself isn't pushed down. */}
          <div className="hidden lg:block">
            <TaxonomyMap q={question} typeIndex={typeIndex} />
          </div>
        </div>

        <div>
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(26,26,46,0.04),0_12px_40px_-20px_rgba(26,26,46,0.25)] ring-1 ring-[#ece9f7] sm:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="rounded-full bg-[#f3f2fc] px-2.5 py-1 font-semibold text-[#4a5bb0]">
                {question.skill} &middot; Type {typeIndex + 1} of {question.types.length}
              </span>
              <span className="text-gray-400">No account needed</span>
            </div>
            <div className="mb-6 text-[16px]">
              <PassageText text={question.q} highlight={question.underline ?? undefined} />
            </div>
            <div className="flex flex-col gap-2.5">
              {question.choices.map((choice, i) => {
                const isCorrectChoice = i === question.answer;
                const isSelected = i === selected;
                let tone = "border-[#e6e4f5] bg-white hover:border-[#8c97d8] hover:bg-[#fbfbff]";
                let badge = "bg-[#f3f2fc] text-[#4a5bb0]";
                if (answered && isCorrectChoice) {
                  tone = "border-[#2f6f4f] bg-[#eef7f1] text-[#1f5a3c]";
                  badge = "bg-[#2f6f4f] text-white";
                } else if (answered && isSelected) {
                  tone = "border-red-300 bg-red-50 text-red-800";
                  badge = "bg-red-500 text-white";
                } else if (answered) {
                  tone = "border-[#eeedf6] bg-white opacity-55";
                }
                return (
                  <button
                    key={i}
                    onClick={() => selectChoice(i)}
                    disabled={answered}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] font-medium transition-colors ${tone}`}
                  >
                    <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-xs font-semibold ${badge}`}>
                      {LETTERS[i]}
                    </span>
                    {choice}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-6 animate-fade-up rounded-xl bg-[#faf8f4] p-5">
                <div className={`mb-2 text-sm font-semibold ${correct ? "text-[#2f6f4f]" : "text-ink"}`}>
                  {correct ? "Correct." : "Not quite."} This is question type {typeIndex + 1} of {question.types.length} in {question.skill}:{" "}
                  {question.type}.
                </div>
                {trap && (
                  <div className="mb-2 rounded-lg bg-white px-3 py-2 text-sm leading-relaxed text-gray-700 ring-1 ring-[#f0d0d0]">
                    <span className="font-semibold text-[#b23b3b]">The trap you fell for: </span>
                    {trap}
                  </div>
                )}
                <p className="text-sm leading-relaxed text-gray-600">{question.explain}</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row">
            {answered && (
              <TrackedLink
                href="/login?mode=signup"
                event="signup_started"
                className="w-full rounded-xl bg-ink px-6 py-3.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                That&apos;s 1 of {questionCount}. Get the full plan →
              </TrackedLink>
            )}
            <button
              onClick={tryAnother}
              className="w-full rounded-xl border border-[#e0defa] bg-white px-6 py-3.5 text-sm font-semibold transition-colors hover:border-[#c9c6ee] sm:w-auto"
            >
              {answered ? "Try a different type" : "Skip to a different type"}
            </button>
          </div>
          <div className="mt-8 lg:hidden">
            <TaxonomyMap q={question} typeIndex={typeIndex} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Where this question lives: section -> domain -> skill -> question type,
// each level showing its siblings with the current one picked out.
function TaxonomyMap({ q, typeIndex }: { q: LandingQuestion; typeIndex: number }) {
  const domainIndex = q.domains.indexOf(q.domain);
  const skillIndex = q.skills.indexOf(q.skill);
  const chip = (on: boolean) =>
    `rounded-md px-2 py-1 text-[12px] leading-tight transition-colors ${
      on ? "bg-ink font-semibold text-white" : "bg-white text-gray-500 ring-1 ring-[#ece9f7]"
    }`;
  return (
    <div key={q.q} className="animate-fade-up rounded-2xl bg-white p-5 ring-1 ring-[#ece9f7]">
      <div className="mb-4 text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-400">Where this question lives</div>
      <ol className="relative flex flex-col gap-4 border-l border-dashed border-[#d9d6ee] pl-5">
        <Level label="Section" count={null}>
          <span className="text-[14px] font-semibold text-ink">{q.section}</span>
        </Level>
        <Level label="Domain" count={`${domainIndex + 1} of ${q.domains.length}`}>
          <div className="flex flex-wrap gap-1.5">
            {q.domains.map((d) => (
              <span key={d} className={chip(d === q.domain)}>
                {d}
              </span>
            ))}
          </div>
        </Level>
        <Level label="Skill" count={`${skillIndex + 1} of ${q.skills.length}`}>
          <div className="flex flex-wrap gap-1.5">
            {q.skills.map((s) => (
              <span key={s} className={chip(s === q.skill)}>
                {s}
              </span>
            ))}
          </div>
        </Level>
        <Level label="Question type" count={`${typeIndex + 1} of ${q.types.length}`} last>
          <ul className="flex flex-col gap-1">
            {q.types.map((t, i) => (
              <li
                key={t}
                className={`flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px] leading-snug ${
                  i === typeIndex ? "bg-[#eef7f1] font-semibold text-[#1f5a3c] ring-1 ring-[#cfe6d8]" : "text-gray-500"
                }`}
              >
                <span className="w-4 flex-shrink-0 tabular-nums text-gray-400">{i + 1}</span>
                {t}
              </li>
            ))}
          </ul>
        </Level>
      </ol>
      <p className="mt-4 text-[12px] text-gray-400">
        {q.skillQuestionCount} practice questions for {q.skill} alone, each tagged with its type.
      </p>
    </div>
  );
}

function Level({ label, count, last = false, children }: { label: string; count: string | null; last?: boolean; children: React.ReactNode }) {
  return (
    <li className="relative">
      <span
        className={`absolute -left-[25px] top-[3px] h-2.5 w-2.5 rounded-full ring-4 ring-white ${last ? "bg-accent" : "bg-[#b9b5e6]"}`}
        aria-hidden
      />
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-gray-400">{label}</span>
        {count && <span className="text-[11px] font-semibold tabular-nums text-[#4a5bb0]">{count}</span>}
      </div>
      {children}
    </li>
  );
}
