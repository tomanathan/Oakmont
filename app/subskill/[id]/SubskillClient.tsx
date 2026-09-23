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

// The digital SAT actually gives students two different built-in Desmos
// tools depending on the question -- a full graphing calculator on Math
// questions that allow one, and a separate four-function/scientific
// calculator on questions that don't graph anything -- not one calculator
// at two URLs. Every pattern's own desmosCalculator field (see
// data/curriculum.ts's Pattern type) says which one its trick actually
// needs, so the link below can send students to the matching tool instead
// of always defaulting to graphing regardless of the pattern.
const DESMOS_URLS: Record<"graphing" | "scientific", string> = {
  graphing: "https://www.desmos.com/testing/texas/graphing",
  scientific: "https://www.desmos.com/testing/texas/scientific",
};

// A quiz in progress is real work a student doesn't want to redo --
// persisted per subskill so a refresh, a back-button, or navigating away
// and back restores exactly where they left off. Stores the actual
// shuffled `quizQuestions` (not just answer indices) because the choice
// order is re-randomized on every fresh mount (see shuffleChoices below);
// restoring raw indices against a freshly-reshuffled order would silently
// score against the wrong choice -- the same failure mode this file's own
// comments already document for the *questions* prop reshuffling out from
// under `answers` after a router.refresh(). Restoring the exact shuffled
// order sidesteps that entirely.
interface QuizDraft {
  quizQuestions: Question[];
  answers: Record<number, number>;
}

function quizDraftKey(subskillId: string): string {
  return `oakmont:quiz-draft:${subskillId}`;
}

// Safari private mode (and any browser with storage disabled) throws on
// both getItem and setItem, not just setItem -- and this is a phone-first
// user, so every call here is wrapped rather than just the writes.
function loadQuizDraft(subskillId: string, expectedQuestionCount: number): QuizDraft | null {
  try {
    const raw = window.localStorage.getItem(quizDraftKey(subskillId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      !Array.isArray(parsed.quizQuestions) ||
      typeof parsed.answers !== "object" ||
      parsed.answers === null
    ) {
      clearQuizDraft(subskillId);
      return null;
    }
    // The one piece of drift worth guarding against here: the question
    // bank itself changed (a question added/removed) between visits. A
    // full content diff isn't worth it for a draft that's discarded
    // outright on mismatch anyway -- length is enough to catch it. Removed
    // outright rather than just ignored, so a stale draft doesn't linger
    // forever if this subskill's question count never changes back.
    if (parsed.quizQuestions.length !== expectedQuestionCount) {
      clearQuizDraft(subskillId);
      return null;
    }
    return { quizQuestions: parsed.quizQuestions, answers: parsed.answers };
  } catch {
    return null;
  }
}

function saveQuizDraft(subskillId: string, quizQuestions: Question[], answers: Record<number, number>) {
  try {
    window.localStorage.setItem(quizDraftKey(subskillId), JSON.stringify({ quizQuestions, answers }));
  } catch {
    // Private browsing, storage disabled, or quota exceeded -- the quiz
    // still works this session, it just won't survive a reload. Nothing
    // to recover from here.
  }
}

function clearQuizDraft(subskillId: string) {
  try {
    window.localStorage.removeItem(quizDraftKey(subskillId));
  } catch {
    // ignore, same as above
  }
}

export function SubskillClient({
  subskill,
  questions,
}: {
  subskill: Subskill;
  questions: Question[];
}) {
  const router = useRouter();
  // Defaults to "lesson" and gets flipped to "practice" in the restore
  // effect below when a draft with real answers in it is found -- a
  // student resuming a quiz should land back in the quiz, not on the
  // lesson tab wondering why their answers "disappeared" when they
  // haven't actually been touched at all.
  const [mode, setMode] = useState<"lesson" | "practice">("lesson");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [extras, setExtras] = useState<ResultExtras | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
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
  //
  // Keyed on subskill.id, NOT the `questions` prop itself -- this used to
  // depend on `questions`, which is exactly what caused the "wrong score"
  // bug: submitQuiz() calls router.refresh() to pick up the freshly-saved
  // progress, which re-runs the server component and hands this client
  // component a brand-new `questions` array. Same subskill, same
  // questions, same order -- but Server Component props are always a
  // fresh object across a refresh, deserialized from a new RSC payload
  // rather than the literal same reference, so a dependency array
  // comparing `questions` by identity saw that as "the questions changed"
  // every single time. That re-ran this effect and reshuffled the choices
  // out from under the answers the student had already picked -- their
  // `answers` state (a plain choice *index* per question) still pointed
  // at the old positions, so after the reshuffle it was effectively
  // scoring against the wrong choice for however many questions the
  // reshuffle happened to move the correct answer on. subskill.id is a
  // plain string, compared by value, so it's only ever "different" when
  // it's actually a different subskill -- a refresh of this same page
  // leaves it untouched and this effect alone.
  const [quizQuestions, setQuizQuestions] = useState<Question[]>(questions);
  // One entry per quiz question card, so an incomplete submission can jump
  // straight to the first one that's still unanswered instead of leaving
  // the student to hunt for it across a long, multi-screen scroll. Also
  // what the draft-restore effect below scrolls to, so a resumed quiz
  // lands on the first thing still left to do instead of the top of a
  // long page of already-answered questions.
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Set by the restore effect below when a draft has an unanswered
  // question to jump to; consumed by the effect further down once `mode`
  // actually flips to "practice". The quiz cards (and questionRefs) only
  // exist in the DOM once that mode switch has itself committed -- the
  // section is conditionally rendered (`mode === "practice" && ...`), not
  // just hidden -- so a plain setTimeout here raced the render and
  // silently scrolled nothing.
  const pendingRestoreScrollRef = useRef<number | null>(null);
  useEffect(() => {
    const draft = loadQuizDraft(subskill.id, questions.length);
    if (draft) {
      setQuizQuestions(draft.quizQuestions);
      setAnswers(draft.answers);
      if (Object.keys(draft.answers).length > 0) {
        const firstUnanswered = draft.quizQuestions.findIndex((_, i) => draft.answers[i] === undefined);
        pendingRestoreScrollRef.current = firstUnanswered === -1 ? 0 : firstUnanswered;
        setMode("practice");
      }
      return;
    }
    setQuizQuestions(questions.map(shuffleChoices));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subskill.id, shuffleSeed]);

  useEffect(() => {
    if (mode !== "practice" || pendingRestoreScrollRef.current === null) return;
    const idx = pendingRestoreScrollRef.current;
    pendingRestoreScrollRef.current = null;
    questionRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [mode]);

  // Same idea for the lesson's worked examples, shuffled once per page
  // visit (not on every navigation between examples) -- exampleSelections
  // above stores a plain choice *index* per example, so reshuffling a
  // pattern's examples every time a student steps back to one already
  // viewed would leave that stored index pointing at a different choice
  // than the one they actually clicked. Keyed on subskill.id rather than
  // `subskill` itself, for exactly the same reason the quiz's own shuffle
  // effect is keyed on subskill.id and not `questions` -- see that
  // effect's comment. `subskill` is just as much a fresh-object-every-
  // refresh Server Component prop as `questions` is, so depending on it
  // directly reshuffled these choices out from under exampleSelections
  // any time router.refresh() fired (every quiz submission does exactly
  // that) while this same subskill was still on screen.
  const [shuffledPatterns, setShuffledPatterns] = useState<Pattern[]>(subskill.patterns);
  useEffect(() => {
    setShuffledPatterns(subskill.patterns.map((p) => ({ ...p, examples: p.examples.map(shuffleChoices) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subskill.id]);

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

  // Whether a student has actually looked at this pattern -- every label
  // this drives says "viewed" ("X/Y viewed", the outline's checkmarks), so
  // that's what it checks: has at least one of its examples been opened.
  // This used to require *every* example in the pattern to have been
  // viewed (`.every` instead of `.some`), which was the bug where the
  // counter looked stuck -- clicking through the pattern tabs at the top
  // of the lesson (a completely normal way to browse) only ever visits
  // whichever example each one opens on, so a 5-example pattern stayed
  // uncounted forever unless a student happened to step through all five
  // of its examples specifically, one by one, which "click through the
  // question types" was never asking anyone to do.
  function isPatternViewed(i: number) {
    const p = subskill.patterns[i];
    return p.examples.some((_, j) => viewedExamples.has(`${i}-${j}`));
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
    setAnswers((prev) => {
      const next = { ...prev, [qIdx]: choiceIdx };
      // Written against the actual shuffled quizQuestions in scope right
      // now, so a later restore replays the exact same choice order these
      // indices were picked against -- see loadQuizDraft's own comment.
      saveQuizDraft(subskill.id, quizQuestions, next);
      return next;
    });
    setErrorMsg("");
  }

  function reviewPattern(patternName: string) {
    const i = subskill.patterns.findIndex((p) => p.name === patternName);
    if (i === -1) return;
    setActivePattern(i);
    setActiveExample(0);
    setMode("lesson");
  }

  function reviewMisses() {
    const first = quizQuestions.findIndex((q, i) => answers[i] !== q.answer);
    questionRefs.current[first]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function retakeQuiz() {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setExtras(null);
    setErrorMsg("");
    setShuffleSeed((s) => s + 1);
    // Belt and suspenders with the clear in submitQuiz below -- a retake
    // is a fresh start either way, never a draft to resume.
    clearQuizDraft(subskill.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitQuiz() {
    if (Object.keys(answers).length < quizQuestions.length) {
      const firstUnanswered = quizQuestions.findIndex((_, i) => answers[i] === undefined);
      setErrorMsg("Answer every question before submitting. We jumped you to the first one left.");
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
    // The results card renders at the top of the quiz, a long scroll up
    // from the submit button -- bring it into view on the next frame, once
    // it actually exists in the DOM.
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subskillId: subskill.id, score, total: quizQuestions.length }),
      });
      if (res.ok) {
        // The whole reason this existed was to resume an *unsubmitted*
        // attempt -- a successful submit means there's nothing left to
        // resume, and a later retake should start from a real reshuffle,
        // not this now-scored attempt.
        clearQuizDraft(subskill.id);
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
        // secondPetJustUnlocked takes priority over streakMilestone even
        // though both can fire on the exact same submission -- Mochi's
        // unlock day (see lib/pet.ts's SECOND_PET_UNLOCK_STREAK_DAYS) is
        // itself one of lib/gamification.ts's own milestone numbers, so a
        // generic "days straight" line would undersell what actually just
        // happened. The streak count still gets mentioned in Mochi's own
        // message, so nothing from the milestone line is lost.
        const celebration: { message: string; tier: "small" | "big" } | null = data.secondPetJustUnlocked
          ? { message: `Someone new wants to meet you — say hi to Mochi! (${data.currentStreak}-day streak, by the way.)`, tier: "big" }
          : data.streakMilestone
          ? { message: `${data.currentStreak} days straight?! You're unstoppable.`, tier: "big" }
          : data.justCompletedCurriculum
          ? { message: "You did it — the WHOLE curriculum. Best trick I know, just for this.", tier: "big" }
          : data.justCompletedSection
          ? { message: `${data.justCompletedSection}: fully mastered, every domain. That's huge.`, tier: "big" }
          : data.newCostume
          ? {
              // justCompletedDomain can be null here now -- costumes can
              // also unlock from a streak milestone, not just a finished
              // domain (see lib/costumes.ts) -- so the message branches on
              // which currency actually earned it instead of assuming.
              message: data.justCompletedDomain
                ? `${data.justCompletedDomain}: mastered! And look what that unlocked — the ${data.newCostume.name}.`
                : `Look what that streak just unlocked — the ${data.newCostume.name}.`,
              tier: "big",
            }
          : data.justCompletedDomain
          ? { message: `${data.justCompletedDomain}: mastered! On to the next one.`, tier: "small" }
          : data.justMastered
          ? { message: `${subskill.name}: mastered! Nice work.`, tier: "small" }
          : null;
        // Either way Ozho comes over to the results card to react: the
        // big moments above as a celebration, anything else as a plain
        // line about the score (see resultCopy's `ozho`).
        const near = ozhoSpotBeside(resultsRef.current);
        if (celebration) {
          window.dispatchEvent(new CustomEvent("ozho:celebrate", { detail: { ...celebration, near } }));
        } else {
          window.dispatchEvent(
            new CustomEvent("ozho:say", {
              detail: { message: resultCopy(score, quizQuestions.length, false).ozho, near },
            })
          );
        }
        // A freshly unlocked costume becomes the worn one automatically
        // (same fallback Settings and the header pill use) unless the
        // student already hand-picked something -- update every mounted
        // Ozho icon immediately rather than waiting on a page reload.
        if (data.newCostume) {
          window.dispatchEvent(new CustomEvent("ozho:costume", { detail: { costume: data.newCostume.id } }));
        }
        // Makes the already-mounted SecondCompanion (Mochi) start
        // rendering immediately, rather than waiting for a full page
        // reload to re-fetch and discover it's unlocked -- see that
        // component's own listener for why a plain event, not a refetch.
        if (data.secondPetJustUnlocked) {
          window.dispatchEvent(new CustomEvent("ozho:mochi-unlocked"));
        }
        // What the results card points at next -- read *after* the save
        // so a just-mastered subskill drops out of the recommendation. Not
        // essential, so a failure just leaves the card without it.
        fetch("/api/plan/next")
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
          .then((plan) => setExtras({ nextUp: plan?.recommendation ?? null }));
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
                    {subskill.patterns.filter((_, i) => isPatternViewed(i)).length}/
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
                  const complete = isPatternViewed(i);
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
                      <span className="text-[11px] font-bold text-[#3a6690] uppercase tracking-wide">
                        Desmos shortcut for this pattern
                      </span>
                    </div>
                    <StepList text={pattern.desmosTrick} className="text-[13px] text-gray-700 mb-2.5" />
                    <a
                      href={DESMOS_URLS[pattern.desmosCalculator ?? "graphing"]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] font-semibold text-[#3a6690] hover:underline"
                    >
                      Open Desmos {pattern.desmosCalculator === "scientific" ? "(scientific)" : "(graphing)"} to try
                      it &#8599;
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
                // Was px-4.5 -- not a real Tailwind utility (the default
                // spacing scale has no 4.5 step, only 4 and 5), so it
                // silently generated no CSS at all and left this button
                // with zero horizontal padding, text running right up to
                // both edges. px-5 also gives this primary (filled) button
                // a little more breathing room than the outlined
                // "Previous" button's px-4 -- a common convention for the
                // more emphasized side of a button pair -- and the hover
                // state matches the other bg-ink buttons elsewhere in the
                // app instead of sitting flat with no feedback at all.
                className="px-5 py-2.5 rounded-lg bg-ink text-white font-semibold text-sm hover:bg-[#2a2a42] transition-colors"
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
          {submitted && (
            <ResultsCard
              cardRef={resultsRef}
              score={score ?? 0}
              total={quizQuestions.length}
              saving={saving}
              result={result}
              extras={extras}
              currentSubskillId={subskill.id}
              onReview={reviewMisses}
              onRetake={retakeQuiz}
            />
          )}
          {quizQuestions.length > 0 && (
            // Shown regardless of submitted state -- not gated with
            // QuizProgress below, which only makes sense pre-submission.
            // Placed once above the whole quiz, not per-question: the
            // point is pointing students at more practice for this
            // subskill overall, not repeating the same link a dozen times
            // down the page. Same "tip" visual language as TipsPanel's own
            // callout (warm cream, not the Desmos blue used elsewhere on
            // this page) since this reads the same way: a helpful
            // pointer, not an interactive tool embedded in the page.
            <div className="bg-[#fffaf0] border border-[#f0e4c8] rounded-lg p-3.5 mb-3.5 flex items-start gap-2.5">
              <div className="text-[13px] text-gray-700 leading-relaxed">
                Once you&apos;ve worked through these, the College Board&apos;s own{" "}
                <a
                  href="https://satsuite.collegeboard.org/practice/student-question-bank"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#9a6a12] hover:underline"
                >
                  SAT Suite Question Bank &#8599;
                </a>{" "}
                is a great supplement &mdash; real retired questions, official practice, straight from the
                source.
              </div>
            </div>
          )}
          {!submitted && quizQuestions.length > 0 && (
            <QuizProgress answeredCount={Object.keys(answers).length} total={quizQuestions.length} />
          )}
          {quizQuestions.map((q, i) => {
            const isCorrect = answers[i] === q.answer;
            return (
              <div
                key={i}
                ref={(el) => {
                  questionRefs.current[i] = el;
                }}
                className={`border shadow-[0_1px_2px_rgba(26,26,46,0.03),0_4px_14px_rgba(26,26,46,0.04)] rounded-xl p-5 mb-3.5 ${
                  submitted
                    ? isCorrect
                      ? "bg-[#fbfefc] border-[#cde8d9]"
                      : "bg-[#fefbfb] border-[#f0d0d0]"
                    : "bg-white border-[#ece9f7]"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="text-sm text-ink flex-1 min-w-0">
                    <PassageText text={q.q} highlight={q.underline} number={i + 1} />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {submitted && <QuestionResultPill correct={isCorrect} />}
                    {q.difficulty && <DifficultyPill difficulty={q.difficulty} />}
                  </div>
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
                {submitted && !isCorrect && q.pattern && (
                  <MethodCallout
                    patternName={q.pattern}
                    pattern={subskill.patterns.find((p) => p.name === q.pattern)}
                    onReview={() => reviewPattern(q.pattern!)}
                  />
                )}
              </div>
            );
          })}
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
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#ece9f7] bg-white px-4 py-3">
              <span className="text-sm font-semibold text-ink tabular-nums">
                {score ?? 0} / {quizQuestions.length} correct
              </span>
              <span className="text-gray-300">·</span>
              <button
                onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="text-sm text-gray-500 hover:text-ink"
              >
                Back to results ↑
              </button>
              {!saving && (
                <button
                  onClick={retakeQuiz}
                  className="ml-auto rounded-lg border border-[#e0defa] px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#c9c6ee] hover:text-ink"
                >
                  Retake quiz
                </button>
              )}
            </div>
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

// What the quiz's results moment reads from beyond the score itself --
// fetched once the save lands, so "Up next" points somewhere real.
interface ResultExtras {
  nextUp: { label: string; href: string } | null;
}

// A page-coordinate point inside the results card, down its right side
// by the chips row -- so his speech bubble lands in the empty space to
// the right of the headline -- for Ozho to trot to when he reacts.
function ozhoSpotBeside(el: HTMLElement | null): { x: number; y: number } | undefined {
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.right + window.scrollX - 90, y: r.top + window.scrollY + 140 };
}

function resultCopy(score: number, total: number, justMastered: boolean) {
  const missed = total - score;
  const ratio = total > 0 ? score / total : 0;
  if (missed === 0) {
    return justMastered
      ? {
          headline: "Mastered.",
          body: "Every question right, so this subskill is checked off your plan.",
          ozho: "Every single one! My tail hasn't stopped.",
        }
      : {
          headline: "Perfect, again.",
          body: "Still sharp. A clean run like this is exactly what sticks on test day.",
          ozho: "Showing off now, huh? I love it.",
        };
  }
  const misses = `${missed} ${missed === 1 ? "question" : "questions"}`;
  if (ratio >= 0.8)
    return {
      headline: "So close.",
      body: `Mastery takes a perfect score. Look over the ${misses} you missed, then take it again.`,
      ozho: "One more go? I can smell the finish line.",
    };
  if (ratio >= 0.5)
    return {
      headline: "Getting there.",
      body: `Each of the ${misses} you missed links back to the pattern it tests. Start there.`,
      ozho: "Let's sniff out those misses together.",
    };
  return {
    headline: "A tough round.",
    body: "That's what the lesson is for. Revisit the patterns behind your misses, then retake.",
    ozho: "Rough one. The lesson's right there, I'll wait.",
  };
}

function ScoreRing({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const shown = useCountUp(pct, 900);
  const r = 34;
  const c = 2 * Math.PI * r;
  const color = pct === 100 ? "#c9971b" : pct >= 50 ? "#2f6f4f" : "#6d7fd6";
  return (
    <div className="relative h-[88px] w-[88px] flex-shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f0eff9" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[22px] font-semibold leading-none text-ink tabular-nums">{shown}%</span>
        <span className="mt-1 text-[11px] text-gray-400 tabular-nums">
          {score}/{total}
        </span>
      </div>
    </div>
  );
}

// The results moment, shown at the top of the quiz the instant it's
// submitted (and scrolled to), instead of a grey score line under a
// dozen screens of questions. Leads with the score, then says what it
// means and what to do about it -- review, move on, or go again. Ozho
// himself (the roaming companion, not a copy drawn in here) trots over to
// the card and says his piece -- see ozhoResultLine / submitQuiz.
function ResultsCard({
  cardRef,
  score,
  total,
  saving,
  result,
  extras,
  currentSubskillId,
  onReview,
  onRetake,
}: {
  cardRef: React.Ref<HTMLDivElement>;
  score: number;
  total: number;
  saving: boolean;
  result: SubmitResult | null;
  extras: ResultExtras | null;
  currentSubskillId: string;
  onReview: () => void;
  onRetake: () => void;
}) {
  const perfect = total > 0 && score === total;
  const missed = total - score;
  const copy = resultCopy(score, total, !!result?.justMastered);
  // The planner can legitimately recommend the subskill just taken (it's
  // still the first unmastered one) -- "Up next" pointing back at this
  // same page would read as a bug, and Retake already covers it.
  const nextUp =
    extras?.nextUp && !extras.nextUp.href.endsWith(`/${currentSubskillId}`) ? extras.nextUp : null;

  return (
    <div
      ref={cardRef}
      className={`scroll-mt-4 mb-5 overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(26,26,46,0.04),0_12px_32px_-12px_rgba(26,26,46,0.14)] ${
        perfect ? "border-[#f0e0b0]" : "border-[#ece9f7]"
      }`}
      aria-live="polite"
    >
      <div className={`flex flex-wrap items-center gap-5 p-5 sm:p-6 ${perfect ? "bg-[#fffcf3]" : ""}`}>
        <ScoreRing score={score} total={total} />
        <div className="min-w-[200px] flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">Quiz results</div>
          <div className="mt-1 font-display text-[26px] font-semibold leading-tight text-ink">{copy.headline}</div>
          <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-gray-600">{copy.body}</p>
        </div>
      </div>

      {result && !saving && (result.currentStreak > 0 || result.newCostume || result.justCompletedDomain) && (
        <div className="flex flex-wrap gap-2 border-t border-[#f2f0fa] px-5 py-3 sm:px-6">
          {result.currentStreak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff4e6] px-3 py-1 text-[12.5px] font-semibold text-[#b4541a]">
              <FlameIcon />
              {result.currentStreak}-day streak
            </span>
          )}
          {result.justCompletedDomain && (
            <span className="inline-flex items-center rounded-full bg-[#eaf6ef] px-3 py-1 text-[12.5px] font-semibold text-accent">
              {result.justCompletedDomain} complete
            </span>
          )}
          {result.newCostume && (
            <a
              href="/settings#wardrobe"
              className="inline-flex items-center gap-2 rounded-full bg-[#fbf3dc] py-0.5 pl-1 pr-3 text-[12.5px] font-semibold text-[#8a5f0c] transition-colors hover:bg-[#f7eac6]"
            >
              <span className="-my-1">
                <PixelDog size={26} costume={result.newCostume.id} shadow={false} />
              </span>
              New outfit: {result.newCostume.name} · see wardrobe →
            </a>
          )}
        </div>
      )}

      {!saving && (
        <div className="flex flex-wrap gap-2 border-t border-[#f2f0fa] bg-[#fafafd] px-5 py-3.5 sm:px-6">
          {missed > 0 && (
            <button
              onClick={onReview}
              className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Review {missed} {missed === 1 ? "miss" : "misses"} ↓
            </button>
          )}
          {nextUp && (
            <a
              href={nextUp.href}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                missed === 0
                  ? "bg-ink text-white hover:opacity-90"
                  : "border border-[#e0defa] bg-white text-ink hover:border-[#c9c6ee]"
              }`}
            >
              Up next: {nextUp.label} →
            </a>
          )}
          <button
            onClick={onRetake}
            className="rounded-lg border border-[#e0defa] bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-[#c9c6ee] hover:text-ink"
          >
            Retake quiz
          </button>
          {!nextUp && missed === 0 && (
            <a
              href="/dashboard"
              className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Back to dashboard →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function FlameIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
      <path
        d="M6 0.5c.6 2.3 3.2 3.6 3.2 7a3.2 3.2 0 0 1-6.4 0c0-1.4.7-2.3 1.4-3 .1 1 .6 1.7 1.3 1.9C5 4.6 5 2.4 6 .5Z"
        fill="currentColor"
      />
    </svg>
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

// One per question once results are in -- same easy/hard color pairing
// DifficultyPill already uses (green for easy, red for hard) rather than
// a new palette, so right/wrong reads as an extension of the same visual
// language instead of a second accent system. Sits next to the answer
// choices' own green/red highlighting (see ExamChoices) as an explicit,
// at-a-glance label -- a student scanning a long results page shouldn't
// have to re-read every choice to tell which questions they missed.
function QuestionResultPill({ correct }: { correct: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full border whitespace-nowrap ${
        correct
          ? "bg-[#eaf6ef] text-accent border-[#cde8d9]"
          : "bg-[#fbeaea] text-[#b23b3b] border-[#f0d0d0]"
      }`}
    >
      {correct ? "✓ Correct" : "✗ Incorrect"}
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
          // "Viewed" means at least one example opened, not every one of
          // them -- see isPatternViewed's own comment in the parent for why
          // requiring all of them was the bug.
          const complete = p.examples.some((_, j) => viewedExamples.has(`${i}-${j}`));
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
