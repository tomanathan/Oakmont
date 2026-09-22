"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import { LANDING_QUESTIONS } from "@/lib/landingQuestions";
import { TrackedLink } from "./TrackedLink";

const TOTAL_QUESTIONS = 361;

// The landing page's actual centerpiece: a real question from the bank,
// answerable with no login. This is what demonstrates the product (the
// pattern-based explanation) rather than describing it. Ships against the
// small static LANDING_QUESTIONS set -- no API call, no auth.
export function SampleQuestion() {
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
      // Reuses the app's existing celebration event (GlobalConfetti is
      // already mounted globally in app/layout.tsx and listens for this)
      // and a landing-page-only event that switches the hero pets' mood --
      // see components/landing/HeroPets.tsx.
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
    <section id="try-a-question" className="px-6 py-16 sm:py-20 bg-white border-y border-[#ece9f7]">
      <div className="max-w-[640px] mx-auto">
        <div className="text-center mb-8">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#4a5bb0] mb-2">
            {question.domain} · {question.subskillName}
          </div>
          <h2 className="font-display font-semibold text-[26px] sm:text-[30px] text-ink">Try one right now</h2>
        </div>

        <div className="bg-[#faf8f4] border border-[#ece9f7] rounded-2xl p-6 sm:p-7">
          <p className="text-[15px] text-ink leading-relaxed mb-5">{question.q}</p>
          <div className="flex flex-col gap-2.5">
            {question.choices.map((choice, i) => {
              const isCorrectChoice = i === question.answer;
              const isSelected = i === selected;
              let style = "border-[#e0defa] bg-white hover:border-[#6d7fd6]";
              if (answered && isCorrectChoice) style = "border-[#2f6f4f] bg-[#eaf6ef] text-[#2f6f4f]";
              else if (answered && isSelected) style = "border-red-300 bg-red-50 text-red-700";
              else if (answered) style = "border-[#e0defa] bg-white opacity-60";

              return (
                <button
                  key={i}
                  onClick={() => selectChoice(i)}
                  disabled={answered}
                  className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${style}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="mt-5 pt-5 border-t border-[#ece9f7]">
              <div className={`text-sm font-semibold mb-1.5 ${correct ? "text-[#2f6f4f]" : "text-ink"}`}>
                {correct ? "Correct!" : "Not quite."} This is a {question.subskillName} question.
              </div>
              <div className="text-sm text-gray-600 mb-1.5">
                <span className="font-semibold text-ink">The pattern:</span> {question.pattern}
              </div>
              <p className="text-sm text-gray-600">{question.explain}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          {answered && (
            <TrackedLink
              href="/login?mode=signup"
              event="signup_started"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-lg bg-ink text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              That&apos;s 1 of {TOTAL_QUESTIONS}. Get the full plan →
            </TrackedLink>
          )}
          <button
            onClick={tryAnother}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[#e0defa] text-ink font-semibold text-sm hover:bg-[#f0eff9] transition-colors"
          >
            Try another
          </button>
        </div>
      </div>
    </section>
  );
}
