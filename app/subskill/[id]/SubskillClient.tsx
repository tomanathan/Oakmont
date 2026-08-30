"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Subskill, Pattern } from "@/data/curriculum";
import type { Question } from "@/data/questions";
import { NavButton } from "@/components/NavButton";
import { ConfettiBurst, useCountUp } from "@/components/CountUp";
import { StepList, ProseText } from "@/components/StepList";
import { MathText } from "@/components/MathText";
import { GeometryDiagram } from "@/components/GeometryDiagram";
import { ExamChoices } from "@/components/ExamChoices";
import { sectionTheme } from "@/lib/sectionTheme";

interface SubmitResult {
  justMastered: boolean;
  currentStreak: number;
}

export function SubskillClient({
  subskill,
  questions,
}: {
  subskill: Subskill;
  questions: Question[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"lesson" | "practice">("lesson");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [tipsOpenMobile, setTipsOpenMobile] = useState(false);
  const [activePattern, setActivePattern] = useState(0);
  const [activeExample, setActiveExample] = useState(0);
  const [viewedExamples, setViewedExamples] = useState<Set<string>>(new Set());
  // Which choice (if any) the student has clicked for each worked example,
  // keyed the same way as viewedExamples -- clicking one reveals correct/
  // incorrect coloring and the explanation, same interaction as the
  // practice quiz below. Persists as they browse back and forth, same as
  // viewedExamples.
  const [exampleSelections, setExampleSelections] = useState<Record<string, number>>({});

  // Marks the currently-open example as viewed, so the pathway UI can show
  // which examples/patterns a student has actually stepped through.
  useEffect(() => {
    const key = `${activePattern}-${activeExample}`;
    setViewedExamples((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, [activePattern, activeExample]);

  // Scrolls to the top only on an actual page change -- switching between
  // Lesson and Practice swaps in an entirely different view, same as
  // navigating somewhere new. Stepping to the next worked example or
  // jumping to a different question pattern is browsing within the lesson
  // you're already on, not a page change, so it leaves scroll position
  // alone -- resetting it there just fights whoever scrolled down to read.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [mode]);

  function selectPattern(i: number) {
    setActivePattern(i);
    setActiveExample(0);
  }

  function isPatternComplete(i: number) {
    const p = subskill.patterns[i];
    return p.examples.every((_, j) => viewedExamples.has(`${i}-${j}`));
  }

  const pattern = subskill.patterns[activePattern];
  const isLastExampleInPattern = !!pattern && activeExample === pattern.examples.length - 1;
  const isLastPattern = activePattern === subskill.patterns.length - 1;

  function goToNext() {
    if (!pattern) return;
    if (!isLastExampleInPattern) {
      setActiveExample((i) => i + 1);
    } else if (!isLastPattern) {
      selectPattern(activePattern + 1);
    } else {
      setMode("practice");
    }
  }

  function selectAnswer(qIdx: number, choiceIdx: number) {
    setAnswers((prev) => ({ ...prev, [qIdx]: choiceIdx }));
    setErrorMsg("");
  }

  function reviewPattern(patternName: string) {
    const i = subskill.patterns.findIndex((p) => p.name === patternName);
    if (i === -1) return;
    setActivePattern(i);
    setActiveExample(0);
    setMode("lesson");
  }

  function retakeQuiz() {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setErrorMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitQuiz() {
    if (Object.keys(answers).length < questions.length) {
      setErrorMsg("Answer every question before submitting.");
      return;
    }
    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
    setSubmitted(true);
    setSaving(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subskillId: subskill.id, score, total: questions.length }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult({
          justMastered: !!data.justMastered,
          currentStreak: data.currentStreak ?? 0,
        });
        if (data.justMastered) {
          // Lets Ozho (mounted separately, at the root layout) react with
          // his little trick + a celebratory line -- see ScoutCompanion's
          // "ozho:celebrate" listener.
          window.dispatchEvent(
            new CustomEvent("ozho:celebrate", { detail: { message: `${subskill.name} mastered!` } })
          );
        }
        // Refreshes server-fetched data (like the streak badge in AppShell)
        // in place, without discarding this page's client-side quiz state.
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const score = submitted
    ? questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0)
    : null;

  const example = pattern?.examples[Math.min(activeExample, pattern.examples.length - 1)];

  return (
    <div>
      <button
        onClick={() => router.push("/dashboard")}
        className="bg-transparent border-none text-gray-500 text-sm mb-4 p-0 cursor-pointer hover:text-gray-700"
      >
        &larr; Back to dashboard
      </button>
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
        <span className={`w-1.5 h-1.5 rounded-full ${sectionTheme(subskill.section).dot}`} />
        {subskill.section} · {subskill.domain}
      </div>
      <div className="text-[22px] font-bold text-ink mb-1">{subskill.name}</div>
      <div className="text-sm text-gray-500 mb-5">{subskill.blurb}</div>

      <div className="flex gap-2 mb-5">
        <NavButton active={mode === "lesson"} onClick={() => setMode("lesson")}>
          Lesson
        </NavButton>
        <NavButton active={mode === "practice"} onClick={() => setMode("practice")}>
          Practice quiz
        </NavButton>
      </div>

      {mode === "lesson" && (
        <div
          className={
            subskill.patterns.length > 1
              ? "lg:grid lg:grid-cols-[180px_1fr_300px] lg:gap-5 lg:items-start"
              : "lg:grid lg:grid-cols-[1fr_300px] lg:gap-5 lg:items-start"
          }
        >
          {/* Document-tabs-style outline, left of the lesson -- lets a
              student jump straight to any pattern or example they've
              already seen, same idea as Google Docs' left-hand outline. */}
          {subskill.patterns.length > 1 && (
            <LessonOutline
              patterns={subskill.patterns}
              activePattern={activePattern}
              activeExample={activeExample}
              viewedExamples={viewedExamples}
              onSelectPattern={selectPattern}
              onSelectExample={(i, j) => {
                setActivePattern(i);
                setActiveExample(j);
              }}
            />
          )}

          {/* Main lesson column */}
          <div className="bg-white border border-[#ece9f7] shadow-[0_1px_2px_rgba(26,26,46,0.03),0_4px_14px_rgba(26,26,46,0.04)] rounded-xl p-6 min-w-0">
            <div className="flex items-center justify-between mb-3 gap-3">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Question patterns within this subskill
              </div>
              {subskill.patterns.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">
                    {subskill.patterns.filter((_, i) => isPatternComplete(i)).length}/
                    {subskill.patterns.length} viewed
                  </span>
                  <StepArrows
                    onPrev={() => selectPattern(activePattern - 1)}
                    onNext={() => selectPattern(activePattern + 1)}
                    prevDisabled={activePattern === 0}
                    nextDisabled={activePattern === subskill.patterns.length - 1}
                    label="pattern"
                  />
                </div>
              )}
            </div>
            {subskill.patterns.length > 1 && (
              <div className="lg:hidden flex items-start mb-6 overflow-x-auto pb-1">
                {subskill.patterns.map((p, i) => {
                  const complete = isPatternComplete(i);
                  const active = activePattern === i;
                  return (
                    <div key={p.name} className="flex items-start flex-shrink-0">
                      <button
                        onClick={() => selectPattern(i)}
                        className="flex flex-col items-center gap-1.5 px-1 w-[84px] group"
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors ${
                            active
                              ? "bg-ink border-ink text-white"
                              : complete
                              ? "bg-accent border-accent text-white"
                              : "bg-white border-gray-300 text-gray-400 group-hover:border-gray-400"
                          }`}
                        >
                          {complete && !active ? "✓" : i + 1}
                        </span>
                        <span
                          className={`text-[10px] font-medium text-center leading-tight ${
                            active ? "text-ink" : "text-gray-400"
                          }`}
                        >
                          {p.name}
                        </span>
                      </button>
                      {i < subskill.patterns.length - 1 && (
                        <div
                          className={`h-0.5 w-5 flex-shrink-0 mt-3.5 rounded ${
                            complete ? "bg-accent" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {pattern && (
              <div>
                <div className="text-[17px] font-bold text-ink mb-2.5">{pattern.name}</div>
                <ProseText text={pattern.explanation} className="text-sm text-gray-700 mb-5" />

                <div className="bg-[#f8f8fb] rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Worked example
                      {pattern.examples.length > 1 && ` ${activeExample + 1} of ${pattern.examples.length}`}
                    </div>
                    <div className="flex items-center gap-2">
                      {example && <DifficultyPill difficulty={example.difficulty} />}
                      {pattern.examples.length > 1 && (
                        <StepArrows
                          onPrev={() => setActiveExample((i) => i - 1)}
                          onNext={() => setActiveExample((i) => i + 1)}
                          prevDisabled={activeExample === 0}
                          nextDisabled={activeExample === pattern.examples.length - 1}
                          label="example"
                        />
                      )}
                    </div>
                  </div>

                  {pattern.examples.length > 1 && (
                    <div className="flex gap-1 mb-4">
                      {pattern.examples.map((_, i) => {
                        const isCurrent = i === activeExample;
                        const isViewed = viewedExamples.has(`${activePattern}-${i}`);
                        return (
                          <button
                            key={i}
                            onClick={() => setActiveExample(i)}
                            aria-label={`Go to example ${i + 1}`}
                            aria-current={isCurrent}
                            className="flex-1 py-2 -my-2 group"
                          >
                            <span
                              className={`block h-1.5 rounded-full transition-colors ${
                                isCurrent
                                  ? "bg-ink"
                                  : isViewed
                                  ? "bg-accent/50 group-hover:bg-accent/70"
                                  : "bg-gray-200 group-hover:bg-gray-300"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {example && (
                    <>
                      <div className="text-sm text-ink font-medium mb-3 leading-relaxed">
                        <MathText text={example.q} />
                      </div>
                      {example.diagram && <GeometryDiagram spec={example.diagram} />}
                      <ExamChoices
                        choices={example.choices}
                        correctIndex={example.answer}
                        selected={exampleSelections[`${activePattern}-${activeExample}`] ?? null}
                        revealed={exampleSelections[`${activePattern}-${activeExample}`] !== undefined}
                        onSelect={(ci) =>
                          setExampleSelections((prev) => ({ ...prev, [`${activePattern}-${activeExample}`]: ci }))
                        }
                      />
                      {exampleSelections[`${activePattern}-${activeExample}`] !== undefined && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Explanation
                          </div>
                          <StepList text={example.explain} className="text-[13px] text-gray-600" />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {pattern.desmosTrick && (
                  <div className="mt-4 bg-[#eef3f8] border border-[#cddbe8] rounded-lg p-3.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-sm leading-none">🖩</span>
                      <span className="text-[11px] font-bold text-[#3a6690] uppercase tracking-wide">
                        Desmos shortcut for this pattern
                      </span>
                    </div>
                    <StepList text={pattern.desmosTrick} className="text-[13px] text-gray-700 mb-2.5" />
                    <a
                      href="https://www.desmos.com/testing/college-board"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] font-semibold text-[#3a6690] hover:underline"
                    >
                      Open Desmos to try it &#8599;
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (activeExample > 0) {
                    setActiveExample((i) => i - 1);
                  } else if (activePattern > 0) {
                    const prevIdx = activePattern - 1;
                    setActivePattern(prevIdx);
                    setActiveExample(subskill.patterns[prevIdx].examples.length - 1);
                  }
                }}
                disabled={activeExample === 0 && activePattern === 0}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium disabled:opacity-30 disabled:cursor-default hover:border-gray-300"
              >
                &larr; Previous
              </button>
              <button
                onClick={goToNext}
                className="px-4.5 py-2.5 rounded-lg bg-ink text-white font-semibold text-sm"
              >
                {isLastExampleInPattern
                  ? isLastPattern
                    ? "Start practice quiz →"
                    : "Next pattern →"
                  : "Next example →"}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => setMode("practice")}
                className="bg-transparent border-none p-0 cursor-pointer text-[13px] font-medium text-gray-500 hover:text-gray-700"
              >
                Skip ahead to the practice quiz &rarr;
              </button>
              {/* Mobile-only tips toggle */}
              <button
                onClick={() => setTipsOpenMobile((v) => !v)}
                className="lg:hidden px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium"
              >
                {tipsOpenMobile ? "Hide" : "Show"} tips &amp; tricks
              </button>
            </div>

            {/* Mobile collapsible tips panel, inline below the lesson */}
            {tipsOpenMobile && (
              <div className="lg:hidden mt-4">
                <TipsPanel tips={subskill.tipsAndTricks} traps={pattern?.traps} />
              </div>
            )}
          </div>

          {/* Desktop persistent sidebar */}
          <div className="hidden lg:block lg:sticky lg:top-6">
            <TipsPanel tips={subskill.tipsAndTricks} traps={pattern?.traps} />
          </div>
        </div>
      )}

      {mode === "practice" && (
        <div>
          {questions.length === 0 && (
            <div className="text-sm text-gray-500 mb-4">
              No practice questions are available for this subskill yet.
            </div>
          )}
          {questions.map((q, i) => (
            <div
              key={i}
              className="bg-white border border-[#ece9f7] shadow-[0_1px_2px_rgba(26,26,46,0.03),0_4px_14px_rgba(26,26,46,0.04)] rounded-xl p-5 mb-3.5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="text-sm font-medium text-ink">
                  {i + 1}. <VocabAwareText text={q.q} word={q.vocabWord} />
                </div>
                {q.difficulty && <DifficultyPill difficulty={q.difficulty} />}
              </div>
              <ExamChoices
                choices={q.choices}
                correctIndex={q.answer}
                selected={answers[i] ?? null}
                revealed={submitted}
                disabled={submitted}
                onSelect={(ci) => selectAnswer(i, ci)}
              />
              {submitted && (
                <div className="text-[13px] text-gray-500 mt-2.5 leading-relaxed">
                  <strong className="text-ink">Explanation: </strong>
                  <MathText text={q.explain} />
                </div>
              )}
              {submitted && answers[i] !== q.answer && q.pattern && (
                <MethodCallout
                  patternName={q.pattern}
                  pattern={subskill.patterns.find((p) => p.name === q.pattern)}
                  onReview={() => reviewPattern(q.pattern!)}
                />
              )}
            </div>
          ))}
          {errorMsg && <div className="text-red-700 text-sm mb-3">{errorMsg}</div>}
          {!submitted ? (
            questions.length > 0 && (
              <button
                onClick={submitQuiz}
                className="px-5 py-2.5 rounded-lg bg-ink text-white font-semibold text-sm"
              >
                Submit answers
              </button>
            )
          ) : (
            <>
              <ResultBanner
                score={score ?? 0}
                total={questions.length}
                saving={saving}
                result={result}
              />
              {!saving && (
                <button
                  onClick={retakeQuiz}
                  className="mt-3 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:border-gray-300"
                >
                  Retake quiz
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultBanner({
  score,
  total,
  saving,
  result,
}: {
  score: number;
  total: number;
  saving: boolean;
  result: SubmitResult | null;
}) {
  const displayScore = useCountUp(score, 600);
  const perfect = result?.justMastered || (total > 0 && score === total);

  return (
    <div
      className={`relative overflow-hidden rounded-[10px] px-5 py-4 ${
        perfect ? "bg-[#fffaf0] border border-[#f0e0b0]" : "bg-[#f8f8fb]"
      }`}
    >
      {result?.justMastered && <ConfettiBurst />}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-[15px] font-semibold text-ink">
          {perfect && <span className="text-[#c9971b] mr-1.5">★</span>}
          Score: {displayScore} / {total}
          {perfect && (
            <span className="ml-2 text-[13px] font-semibold text-[#c9971b]">
              {result?.justMastered ? "Mastered!" : "Perfect!"}
            </span>
          )}
          {saving && <span className="text-xs text-gray-400 font-normal ml-2">Saving...</span>}
        </div>

        {result && !saving && result.currentStreak > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-gray-600">
              <span className="animate-flame-pulse inline-block">🔥</span>
              {result.currentStreak}-day streak
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const DIFFICULTY_STYLES: Record<"easy" | "medium" | "hard", string> = {
  easy: "bg-[#eaf6ef] text-accent border-[#cde8d9]",
  medium: "bg-[#fbf1df] text-[#9a6a12] border-[#f0ddb8]",
  hard: "bg-[#fbeaea] text-[#b23b3b] border-[#f0d0d0]",
};

const DIFFICULTY_LABELS: Record<"easy" | "medium" | "hard", string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

function StepArrows({
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  label,
}: {
  onPrev: () => void;
  onNext: () => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onPrev}
        disabled={prevDisabled}
        aria-label={`Previous ${label}`}
        className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 leading-none disabled:opacity-25 disabled:cursor-default hover:border-gray-300 hover:text-gray-700"
      >
        &lsaquo;
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        aria-label={`Next ${label}`}
        className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 leading-none disabled:opacity-25 disabled:cursor-default hover:border-gray-300 hover:text-gray-700"
      >
        &rsaquo;
      </button>
    </div>
  );
}

function DifficultyPill({ difficulty }: { difficulty: "easy" | "medium" | "hard" }) {
  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full border ${DIFFICULTY_STYLES[difficulty]}`}
    >
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}

function MethodCallout({
  patternName,
  pattern,
  onReview,
}: {
  patternName: string;
  pattern?: Pattern;
  onReview: () => void;
}) {
  return (
    <div className="mt-3 bg-[#f5f9f7] border border-[#d9ece3] rounded-lg p-3.5">
      <div className="text-[11px] font-semibold text-accent uppercase tracking-wide mb-1.5">
        This question tests: {patternName}
      </div>
      {pattern && (
        <ProseText text={pattern.explanation} className="text-[13px] text-gray-700 mb-2.5" />
      )}
      <button
        onClick={onReview}
        className="text-[13px] font-semibold text-accent hover:underline bg-transparent border-none p-0 cursor-pointer"
      >
        Review this pattern&apos;s worked examples &rarr;
      </button>
    </div>
  );
}

function TipsPanel({ tips, traps }: { tips: string[]; traps?: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#fffaf0] border border-[#f0e4c8] rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-base leading-none">💡</span>
          <span className="text-[13px] font-bold text-ink">Tips &amp; tricks</span>
        </div>
        <ul className="space-y-3">
          {tips.map((t, i) => (
            <li key={i} className="text-[13px] text-gray-700 leading-relaxed pb-3 border-b border-[#f0e4c8] last:border-b-0 last:pb-0">
              <MathText text={t} />
            </li>
          ))}
        </ul>
      </div>

      {/* Common traps, right below tips & tricks -- reading how to get it
          right, then what trips people up, in that order. */}
      {traps && traps.length > 0 && (
        <div className="bg-[#fdf2f2] border border-[#f6dede] rounded-xl p-4">
          <div className="text-[11px] font-semibold text-[#b5504f] uppercase tracking-wide mb-2.5">
            Common traps on this pattern
          </div>
          <ul className="space-y-1.5">
            {traps.map((t, i) => (
              <li key={i} className="text-[13px] text-gray-600 leading-relaxed flex gap-2">
                <span className="text-[#d97f7e] flex-shrink-0">&#9679;</span>
                <span>
                  <MathText text={t} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Document-tabs-style left outline for the lesson, the same idea as Google
 * Docs' left-hand heading navigator: every pattern is a clickable row, and
 * the active pattern expands to show its individual examples as smaller
 * clickable rows underneath, so a student can jump straight to any part of
 * the lesson they've already been through instead of paging linearly.
 */
function LessonOutline({
  patterns,
  activePattern,
  activeExample,
  viewedExamples,
  onSelectPattern,
  onSelectExample,
}: {
  patterns: Pattern[];
  activePattern: number;
  activeExample: number;
  viewedExamples: Set<string>;
  onSelectPattern: (i: number) => void;
  onSelectExample: (patternIdx: number, exampleIdx: number) => void;
}) {
  return (
    <nav className="hidden lg:block lg:sticky lg:top-6 pr-3 border-r border-[#ece9f7] self-start">
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2 px-2">
        On this lesson
      </div>
      <ol className="flex flex-col gap-0.5">
        {patterns.map((p, i) => {
          const active = i === activePattern;
          const complete = p.examples.every((_, j) => viewedExamples.has(`${i}-${j}`));
          return (
            <li key={p.name}>
              <button
                onClick={() => onSelectPattern(i)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-[12.5px] leading-snug flex items-start gap-1.5 border-l-2 transition-colors ${
                  active
                    ? "border-ink text-ink font-semibold bg-[#f5f4fb]"
                    : complete
                    ? "border-accent/50 text-gray-600 hover:bg-[#faf9ff]"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-[#faf9ff]"
                }`}
              >
                <span className="flex-shrink-0 w-3.5">{complete && !active ? "✓" : `${i + 1}.`}</span>
                <span>{p.name}</span>
              </button>
              {active && p.examples.length > 1 && (
                <ol className="ml-6 mt-0.5 mb-1 flex flex-col gap-0.5">
                  {p.examples.map((_, j) => {
                    const isCurrent = j === activeExample;
                    const isViewed = viewedExamples.has(`${i}-${j}`);
                    return (
                      <li key={j}>
                        <button
                          onClick={() => onSelectExample(i, j)}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center gap-1.5 ${
                            isCurrent ? "text-ink font-semibold" : isViewed ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              isCurrent ? "bg-ink" : isViewed ? "bg-accent/60" : "bg-gray-300"
                            }`}
                          />
                          Example {j + 1}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * For Words in Context questions, `vocabWord` names the exact word (as it
 * appears in `q`) the question is testing -- underlined here so a student
 * doesn't have to hunt for which word in the passage the question means.
 * Falls back to a plain MathText render when there's no vocab word, or the
 * word can't be found verbatim in the text.
 */
function VocabAwareText({ text, word }: { text: string; word?: string }) {
  if (!word) return <MathText text={text} />;
  const idx = text.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return <MathText text={text} />;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + word.length);
  const after = text.slice(idx + word.length);
  return (
    <>
      <MathText text={before} />
      <u className="decoration-2 decoration-accent underline-offset-2">{match}</u>
      <MathText text={after} />
    </>
  );
}
