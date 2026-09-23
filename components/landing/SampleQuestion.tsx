"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import { LANDING_QUESTIONS } from "@/lib/landingQuestions";
import { TrackedLink } from "./TrackedLink";

const LETTERS = ["A", "B", "C", "D"];

// The page's centerpiece: a real question from the bank, answerable with no
// login, so the product demonstrates itself (the pattern-based explanation)
// instead of being described. Static data -- no API call, no auth.
export function SampleQuestion({ questionCount }: { questionCount: number }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const question = LANDING_QUESTIONS[index];
  const answered = selected !== null;
  const correct = answered && selected === question.answer;

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
    setIndex((i) => (i + 1) % LANDING_QUESTIONS.length);
  }

  return (
    <section id="try-a-question" className="scroll-mt-16 bg-[#faf8f4] px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1120px] items-start gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#4a5bb0]">Try it now</div>
          <h2 className="mb-4 text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.01em] sm:text-[40px]">
            One question. The pattern behind every one like it.
          </h2>
          <p className="mb-6 max-w-[440px] text-[15px] leading-relaxed text-gray-600">
            Every explanation names the move that solves the whole question type, so each one you practice makes
            the next one easier — not just this one right.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="rounded-full bg-white px-2.5 py-1 font-medium text-ink ring-1 ring-[#ece9f7]">
              {question.domain}
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 font-medium text-ink ring-1 ring-[#ece9f7]">
              {question.subskillName}
            </span>
          </div>
        </div>

        <div>
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(26,26,46,0.04),0_12px_40px_-20px_rgba(26,26,46,0.25)] ring-1 ring-[#ece9f7] sm:p-8">
            <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
              <span>
                Question {index + 1} of {LANDING_QUESTIONS.length}
              </span>
              <span>No account needed</span>
            </div>
            <p className="mb-6 text-[16px] leading-relaxed">{question.q}</p>
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
              <div className="mt-6 animate-pop-in rounded-xl bg-[#faf8f4] p-5">
                <div className={`mb-2 text-sm font-semibold ${correct ? "text-[#2f6f4f]" : "text-ink"}`}>
                  {correct ? "Correct." : "Not quite."} This is a {question.subskillName} question.
                </div>
                <div className="mb-2 text-sm leading-relaxed text-gray-700">
                  <span className="font-semibold text-ink">The pattern: </span>
                  {question.pattern}
                </div>
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
              {answered ? "Try another" : "Skip to another"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
