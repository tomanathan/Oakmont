"use client";

import { useState } from "react";
import { ExamChoices } from "@/components/ExamChoices";
import { PassageText } from "@/components/PassageText";
import { MathText } from "@/components/MathText";
import { WhyWrong, FullExplanation } from "@/components/WhyWrong";
import type { PracticeQuestion } from "@/lib/skillPreview";
import { DifficultyPill } from "./DifficultyPill";

const letter = (i: number) => String.fromCharCode(65 + i);

// The three free questions on a public skill page. It gets those three and
// nothing else (see lib/skillPreview.ts), and imports only the leaf render
// components, so the bank and the curriculum stay out of the browser. Each
// question and its choices render on the server, where search engines read
// them; a pick is final, as on /start, and marks it the way the practice
// quiz marks results: right or wrong, why the picked choice is wrong, and
// the full explanation.
export function SkillPractice({ questions }: { questions: PracticeQuestion[] }) {
  const [picks, setPicks] = useState<(number | null)[]>(() => questions.map(() => null));
  return (
    <ol className="flex flex-col gap-4">
      {questions.map((q, i) => (
        <PracticeCard
          key={i}
          q={q}
          n={i + 1}
          picked={picks[i]}
          onPick={(ci) => setPicks((prev) => prev.map((p, j) => (j === i && p === null ? ci : p)))}
        />
      ))}
    </ol>
  );
}

function PracticeCard({
  q,
  n,
  picked,
  onPick,
}: {
  q: PracticeQuestion;
  n: number;
  picked: number | null;
  onPick: (ci: number) => void;
}) {
  const answered = picked !== null;
  const right = picked === q.answer;
  const note = answered && !right ? q.why?.[picked] : null;
  return (
    <li
      className={`list-none rounded-xl border p-4 shadow-[3px_3px_0_rgba(52,97,193,0.13)] sm:p-5 ${
        !answered ? "border-[#c9d6ee] bg-white" : right ? "border-[#cde8d9] bg-[#fbfefc]" : "border-[#f0d0d0] bg-[#fefbfb]"
      }`}
    >
      <div className="mb-3 flex min-h-[28px] flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-stone-500">Question {n}</span>
        {/* After answering only, as in the practice quiz: a "Hard" label
            beforehand primes you for a trick that may not be there. */}
        {answered && (
          <span className="flex items-center gap-2">
            <span
              className={`whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                right ? "border-[#cde8d9] bg-[#eaf6ef] text-accent" : "border-[#f0d0d0] bg-[#fbeaea] text-[#b23b3b]"
              }`}
            >
              {right ? "✓ Correct" : "✗ Incorrect"}
            </span>
            <DifficultyPill difficulty={q.difficulty} />
          </span>
        )}
      </div>
      <div className="mb-4 min-w-0 text-[16px] text-ink">
        <PassageText text={q.q} highlight={q.underline ?? undefined} figure={q.figure} />
      </div>
      <ExamChoices
        choices={q.choices}
        correctIndex={q.answer}
        selected={picked}
        revealed={answered}
        disabled={answered}
        onSelect={onPick}
        crossOut={false}
        arrowSelects={false}
      />
      {/* Read out when a pick is checked; present (and empty) from the start
          so screen readers are already listening when it fills. */}
      <p className="sr-only" aria-live="polite">
        {!answered ? "" : right ? `Correct. ${letter(q.answer)} is the answer.` : `Not quite. You picked ${letter(picked)}. The answer is ${letter(q.answer)}.`}
      </p>
      {answered &&
        (note ? (
          // A miss with a written reason: why their choice is wrong first,
          // with the full explanation one click away.
          <div className="paper-sticky">
            <WhyWrong letter={letter(picked)} note={note}>
              <FullExplanation letter={letter(q.answer)} text={q.explain} />
            </WhyWrong>
          </div>
        ) : (
          <div className="paper-unfold mt-3 text-[16px] leading-relaxed text-stone-700">
            <strong className="text-ink">Explanation: </strong>
            <MathText text={q.explain} />
          </div>
        ))}
    </li>
  );
}
