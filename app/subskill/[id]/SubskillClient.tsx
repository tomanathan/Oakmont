"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Subskill, Pattern } from "@/data/curriculum";
import type { Question } from "@/data/questions";
import { NavButton } from "@/components/NavButton";
import { useCountUp } from "@/components/CountUp";
import { StepList, ProseText } from "@/components/StepList";
import { MathText } from "@/components/MathText";
import { GeometryDiagram } from "@/components/GeometryDiagram";
import { ExamChoices } from "@/components/ExamChoices";
import { PixelDog } from "@/components/PixelDog";
import { sectionTheme } from "@/lib/sectionTheme";

interface SubmitResult {
  justMastered: boolean;
  currentStreak: number;
  justCompletedDomain: string | null;
  newCostume: { id: string; name: string } | null;
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
  // Bumped on every retake to force a fresh shuffle -- see quizQuestions
  // below -- so the correct answer's position doesn't stay memorizable
  // across attempts either.
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // The practice quiz's own choice order, reshuffled per mount/retake so
  // the correct answer isn't always sitting at the position it was
  // authored in (every question in data/questions.ts is written with the
  // correct choice at index 0 for authoring clarity -- shown unshuffled,
  // that would train students to just click the first option).
  //
  // Deliberately NOT a useMemo: this component is server-rendered for the
  // initial HTML, and Math.random() inside a useMemo would run once on the
  // server and again during client hydration with a *different* result,
  // making the server-rendered choice order disagree with what the client
  // immediately re-renders -- a real hydration mismatch, not a cosmetic
  // one. Starting state at the authored (unshuffled) order matches
  // whatever the server actually sent, then shuffling in an effect (client
  // -only, runs after hydration completes) avoids that entirely, at the
  // cost of one imperceptible extra render right after mount.
  const [quizQuestions, setQuizQuestions] = useState<Question[]>(questions);
  useEffect(() => {
    setQuizQuestions(questions.map(shuffleChoices));
  }, [questions, shuffleSeed]);

  // One entry per quiz question card, so an incomplete submission can jump
  // straight to the first one that's still unanswered instead of leaving
  // the student to hunt for it across a long, multi-screen scroll.
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Same idea for the lesson's worked examples, shuffled once per page
  // visit (not on every navigation between examples) -- exampleSelections
  // above stores a plain choice *index* per example, so reshuffling a
  // pattern's examples every time a student steps back to one already
  // viewed would leave that stored index pointing at a different choice
  // than the one they actually clicked.
  const [shuffledPatterns, setShuffledPatterns] = useState<Pattern[]>(subskill.patterns);
  useEffect(() => {
    setShuffledPatterns(subskill.patterns.map((p) => ({ ...p, examples: p.examples.map(shuffleChoices) })));
  }, [subskill]);

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

  const pattern = shuffledPatterns[activePattern];
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
    setShuffleSeed((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitQuiz() {
    if (Object.keys(answers).length < quizQuestions.length) {
      const firstUnanswered = quizQuestions.findIndex((_, i) => answers[i] === undefined);
      setErrorMsg("Answer every question before submitting -- jumped you to the first one left.");
      const el = questionRefs.current[firstUnanswered];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Land keyboard focus on the actual answer choices, not just the
        // card -- a student tabbing from here goes straight into the
        // question they still need to answer.
        (el.querySelector('[role="radio"]') as HTMLElement | null)?.focus();
      }
      return;
    }
    const score = quizQuestions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
    setSubmitted(true);
    setSaving(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subskillId: subskill.id, score, total: quizQuestions.length }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult({
          justMastered: !!data.justMastered,
          currentStreak: data.currentStreak ?? 0,
          justCompletedDomain: data.justCompletedDomain ?? null,
          newCostume: data.newCostume ?? null,
        });
        // Lets Ozho (mounted separately, at the root layout) react with his
        // trick + a celebratory line + a burst of confetti -- see
        // ScoutCompanion's and GlobalConfetti's "ozho:celebrate" listeners.
        // Several of these can technically be true from one submission at
        // once (mastering the subskill that also happens to complete its
        // domain, section, or the entire curriculum, on the day a streak
        // milestone lands) -- only the single most significant one is
        // actually shown, biggest first, rather than stacking messages.
        const celebration: { message: string; tier: "small" | "big" } | null = data.streakMilestone
          ? { message: `🔥 ${data.currentStreak} days straight?! You're unstoppable.`, tier: "big" }
          : data.justCompletedCurriculum
          ? { message: "You did it — the WHOLE curriculum. Best trick I know, just for this.", tier: "big" }
          : data.justCompletedSection
          ? { message: `${data.justCompletedSection}: fully mastered, every domain. That's huge.`, tier: "big" }
          : data.newCostume
          ? { message: `${data.justCompletedDomain}: mastered! And look what that unlocked — the ${data.newCostume.name}.`, tier: "big" }
          : data.justCompletedDomain
          ? { message: `${data.justCompletedDomain}: mastered! On to the next one.`, tier: "small" }
          : data.justMastered
          ? { message: `${subskill.name}: mastered! Nice work.`, tier: "small" }
          : null;
        if (celebration) {
          window.dispatchEvent(new CustomEvent("ozho:celebrate", { detail: celebration }));
        }
        // A freshly unlocked costume becomes the worn one automatically
        // (same fallback Settings and the header pill use) unless the
        // student already hand-picked something -- update every mounted
        // Ozho icon immediately rather than waiting on a page reload.
        if (data.newCostume) {
          window.dispatchEvent(new CustomEvent("ozho:costume", { detail: { costume: data.newCostume.id } }));
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
    ? quizQuestions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0)
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
                      <div className="text-sm text-ink mb-3">
                        <PassageText text={example.q} highlight={example.underline} />
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
          {quizQuestions.length === 0 && (
            <div className="text-sm text-gray-500 mb-4">
              No practice questions are available for this subskill yet.
            </div>
          )}
          {!submitted && quizQuestions.length > 0 && (
            <QuizProgress answeredCount={Object.keys(answers).length} total={quizQuestions.length} />
          )}
          {quizQuestions.map((q, i) => (
            <div
              key={i}
              ref={(el) => {
                questionRefs.current[i] = el;
              }}
              className="bg-white border border-[#ece9f7] shadow-[0_1px_2px_rgba(26,26,46,0.03),0_4px_14px_rgba(26,26,46,0.04)] rounded-xl p-5 mb-3.5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="text-sm text-ink flex-1 min-w-0">
                  <PassageText text={q.q} highlight={q.underline} number={i + 1} />
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
            quizQuestions.length > 0 && (
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
                total={quizQuestions.length}
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

// A long quiz (some run to 15-20+ questions) previously gave no sense of
// how far along you were or how much was left -- just a stack of cards and
// a submit button many screens down. Sticky so it stays visible while
// scrolling through the questions themselves.
function QuizProgress({ answeredCount, total }: { answeredCount: number; total: number }) {
  const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  return (
    <div className="sticky top-2 z-10 bg-white/95 backdrop-blur-sm border border-[#ece9f7] rounded-lg px-3.5 py-2 mb-3.5 shadow-[0_1px_2px_rgba(26,26,46,0.03)]">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-semibold text-ink">
          {answeredCount} of {total} answered
        </span>
        <span className="text-xs text-gray-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-[#f0eff9] rounded-md overflow-hidden">
        <div
          className="h-full bg-[#6d7fd6] transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
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

      {result?.justCompletedDomain && !saving && (
        <div className="mt-3 pt-3 border-t border-[#f0e0b0] flex items-center gap-3">
          {result.newCostume && <PixelDog size={36} costume={result.newCostume.id} />}
          <div className="text-[13px] text-[#9a6a12]">
            <span className="font-semibold">{result.justCompletedDomain} complete!</span>{" "}
            {result.newCostume ? (
              <>
                Ozho unlocked a new outfit: <span className="font-semibold">{result.newCostume.name}</span>.
                Equip it from{" "}
                <a href="/settings" className="underline hover:text-[#7a5410]">
                  Settings
                </a>
                .
              </>
            ) : (
              "Every subskill in this section is now mastered."
            )}
          </div>
        </div>
      )}
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
 * Underlines one exact substring of `text` -- the tested word in a Words in
 * Context question, or the specific sentence a text-structure question is
 * asking about (both via `highlight`) -- so the student sees it highlighted
 * directly in the passage instead of having to relocate it, matching how
 * the real exam marks it. Falls back to a plain MathText render when
 * there's nothing to highlight, or it can't be found verbatim.
 */
function HighlightedText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight) return <MathText text={text} />;
  const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return <MathText text={text} />;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + highlight.length);
  const after = text.slice(idx + highlight.length);
  return (
    <>
      <MathText text={before} />
      <u className="decoration-2 decoration-accent underline-offset-2">{match}</u>
      <MathText text={after} />
    </>
  );
}

// Matches a leading "Passage 1:", "Passage 2 (a historian):" etc. at the
// start of a paragraph -- see PassageText below.
const PASSAGE_LABEL_RE = /^(Passage \d+(?:\s*\([^)]+\))?)\s*:\s*/i;

/**
 * Renders a question's full text, splitting on blank lines (`\n\n`) into
 * real, visually separated paragraphs instead of one dense run-on block --
 * and, when a paragraph starts with "Passage 1:"/"Passage 2:" (Cross-Text
 * Connections), pulling that label out into its own small heading above a
 * distinctly boxed passage, so each passage and the question itself read as
 * clearly separate pieces rather than one blob of text. Single-paragraph
 * text (the vast majority of questions) renders exactly as before, with
 * `number` (if given) inline as "1. " -- multi-paragraph text moves that
 * same number to a small heading above the stacked paragraphs instead,
 * since there's no longer one single line to prefix it onto.
 */
function PassageText({
  text,
  highlight,
  number,
}: {
  text: string;
  highlight?: string;
  number?: number;
}) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  if (paragraphs.length <= 1) {
    return (
      <p className="leading-relaxed">
        {number !== undefined && `${number}. `}
        <HighlightedText text={text} highlight={highlight} />
      </p>
    );
  }

  return (
    <div>
      {number !== undefined && (
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Question {number}
        </div>
      )}
      <div className="flex flex-col gap-3">
        {paragraphs.map((para, i) => {
          const m = para.match(PASSAGE_LABEL_RE);
          if (m) {
            const label = m[1];
            const body = para.slice(m[0].length);
            return (
              <div key={i} className="bg-[#f8f8fb] border border-[#ece9f7] rounded-lg px-3.5 py-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">
                  {label}
                </div>
                <p className="leading-relaxed">
                  <HighlightedText text={body} highlight={highlight} />
                </p>
              </div>
            );
          }
          return (
            <p key={i} className="leading-relaxed font-medium">
              <HighlightedText text={para} highlight={highlight} />
            </p>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Reshuffles a question's or worked example's choices (Fisher-Yates) and
 * remaps `answer` to match, so the correct choice doesn't always land
 * wherever it was authored -- every item in data/questions.ts and
 * data/curriculum.ts is written with the correct choice at index 0 for
 * authoring clarity, and shown unshuffled that would just train students
 * to click the first option. Generic over both Question and WorkedExample
 * since both share the same {choices, answer} shape; every other field is
 * passed through untouched.
 */
function shuffleChoices<T extends { choices: string[]; answer: number }>(item: T): T {
  const order = [0, 1, 2, 3].slice(0, item.choices.length);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...item, choices: order.map((idx) => item.choices[idx]), answer: order.indexOf(item.answer) };
}
