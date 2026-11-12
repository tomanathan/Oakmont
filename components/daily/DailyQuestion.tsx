"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExamChoices } from "@/components/ExamChoices";
import { PassageText } from "@/components/PassageText";
import { MathText } from "@/components/MathText";
import { WhyWrong } from "@/components/WhyWrong";
import { PixelDog } from "@/components/PixelDog";
import { Stamp } from "@/components/paper/Stamp";
import { PenTick, seedOf } from "@/components/paper/Pencil";
import type { PracticeQuestion } from "@/lib/skillPreview";
import { dailyNumberAt } from "./day";
import {
  bestStreak,
  currentStreak,
  formatTime,
  loadStore,
  questionFingerprint,
  recordAnswer,
  saveStore,
  shareText,
  type DailyStore,
} from "./streak";
import { useShareText } from "./useShareText";

const letter = (i: number) => String.fromCharCode(65 + i);

// The SAT question of the day, to answer (app/daily, and app/embed/daily
// with `compact`). It gets today's question and number and nothing else,
// and imports only the leaf render components, so the bank stays out of
// the browser. The question renders on the server, where search engines
// read it. A pick is final: it marks the choices, Ozho reacts, and the
// explanation, the time taken and (on the site) the streak and a share
// button come out under it, then `after` (the page's call to action).
//
// The clock starts when the question first scrolls into view or is first
// touched, counts only while the tab is showing, and is shown only once
// they've answered: a time to share, never a countdown.
//
// `compact` is the card other sites embed in an iframe, where storage may
// be blocked or kept per site: it doesn't read or write any, so it shows no
// streak, no share and no "you already answered".
export function DailyQuestion({
  day,
  question,
  compact = false,
  after,
}: {
  day: number;
  question: PracticeQuestion;
  compact?: boolean;
  after?: React.ReactNode;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [ms, setMs] = useState(0);
  // Null until loaded, and for good when storage is off (or compact).
  const [store, setStore] = useState<DailyStore | null>(null);
  const [newDay, setNewDay] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const answered = picked !== null;
  const right = picked === question.answer;
  const fingerprint = questionFingerprint(question);

  // Coming back the same day: their answer and the explanation, as they left them.
  useEffect(() => {
    if (compact) return;
    const saved = loadStore();
    if (!saved) return;
    setStore(saved);
    const entry = saved.days[day];
    if (entry && entry.h === fingerprint && entry.c >= 0 && entry.c < question.choices.length) {
      setPicked(entry.c);
      setMs(entry.ms);
    }
  }, [compact, day, fingerprint, question.choices.length]);

  // ---- the clock ----
  const clock = useRef({ began: false, start: null as number | null, total: 0, stopped: false });
  const begin = useCallback(() => {
    const c = clock.current;
    if (c.began || c.stopped) return;
    c.began = true;
    if (document.visibilityState !== "hidden") c.start = performance.now();
  }, []);
  useEffect(() => {
    if (answered) clock.current.stopped = true;
  }, [answered]);
  useEffect(() => {
    const el = rootRef.current;
    let io: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver === "function") {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            begin();
            io?.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      io.observe(el);
    }
    function onVisibility() {
      const c = clock.current;
      if (document.visibilityState === "hidden") {
        if (c.start !== null) c.total += performance.now() - c.start;
        c.start = null;
      } else if (c.began && !c.stopped && c.start === null) {
        c.start = performance.now();
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [begin]);

  // A tab left open past midnight in New York: offer the new question.
  useEffect(() => {
    function check() {
      if (dailyNumberAt(new Date()) > day) setNewDay(true);
    }
    check();
    const t = window.setInterval(check, 60_000);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", check);
    };
  }, [day]);

  function pick(ci: number) {
    if (picked !== null) return;
    const c = clock.current;
    const took = Math.round(c.total + (c.start !== null ? performance.now() - c.start : 0));
    c.start = null;
    c.stopped = true;
    setPicked(ci);
    setMs(took);
    if (compact) return;
    const saved = loadStore();
    if (!saved) return;
    const next = recordAnswer(saved, day, { c: ci, r: ci === question.answer, ms: took, h: fingerprint });
    setStore(saveStore(next) ? next : null);
  }

  const note = answered && !right ? question.why?.[picked] : null;
  const streak = store && answered ? currentStreak(store, day) : null;

  return (
    <div ref={rootRef} onPointerDownCapture={begin} onKeyDownCapture={begin} onFocusCapture={begin}>
      {newDay && (
        <p className="mb-3 text-[16px] text-stone-600">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-[44px] items-center font-semibold text-[#26427e] underline underline-offset-4"
          >
            A new question is up
          </button>
        </p>
      )}

      <div className={compact ? "" : "rounded-xl border border-[#c9d6ee] bg-white p-4 shadow-[3px_3px_0_rgba(52,97,193,0.13)] sm:p-5"}>
        <div className="mb-4 min-w-0 text-[16px] text-ink">
          <PassageText text={question.q} highlight={question.underline ?? undefined} figure={question.figure} />
        </div>
        <ExamChoices
          choices={question.choices}
          correctIndex={question.answer}
          selected={picked}
          revealed={answered}
          disabled={answered}
          onSelect={pick}
          crossOut={false}
          arrowSelects={false}
        />
        {/* Read out when the pick is checked; present (and empty) from the
            start so screen readers are already listening when it fills. */}
        <p className="sr-only" aria-live="polite">
          {!answered ? "" : right ? `Correct. ${letter(question.answer)} is the answer.` : `Not quite. You picked ${letter(picked)}. The answer is ${letter(question.answer)}.`}
        </p>

        <Ozho answered={answered} right={right} compact={compact} />
      </div>

      {answered && (
        <section
          aria-label="Your result"
          className={`mt-4 rounded-xl border p-4 sm:p-5 ${right ? "paper-unfold border-[#cde8d9] bg-[#fbfefc]" : "paper-sticky border-[#f0d0d0] bg-[#fefbfb]"}`}
        >
          {/* The stamp sits beside the verdict, and drops under it when a
              narrow card has no room beside it. */}
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div className="min-w-0">
              <p className="font-display text-[22px] font-semibold leading-tight text-ink">{right ? "Correct" : "Not quite"}</p>
              <p className="mt-1 text-[16px] text-stone-600">
                {right ? `${letter(question.answer)} is the answer` : `The answer is ${letter(question.answer)}`} · in {formatTime(ms)}
              </p>
            </div>
            {right && <Stamp big="Fed" small={`Daily #${day}`} tone="green" tilt={7} className="mr-1 mt-1" delay={300} />}
          </div>
          {note && <WhyWrong letter={letter(picked)} note={note} />}
          <div className="mt-4 border-t border-[#d9e2f4] pt-4">
            <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-accent">Why {letter(question.answer)} is right</div>
            <div className="text-[16px] leading-relaxed text-stone-700">
              <MathText text={question.explain} />
            </div>
          </div>
        </section>
      )}

      {answered && !compact && (
        <section aria-label="Your streak" className="paper-unfold mt-4 rounded-xl border border-[#c9d6ee] bg-white p-4 sm:p-5">
          {store && streak !== null && (
            <div className="mb-4 grid grid-cols-2 gap-3">
              <Stat n={streak} label={streak === 1 ? "day in a row" : "days in a row"} />
              <Stat n={Math.max(bestStreak(store), streak)} label="best streak" />
            </div>
          )}
          <ShareResult text={shareText({ day, right, ms, streak })} seed={seedOf(`daily-${day}`)} />
          <p className="mt-3 text-[16px] leading-relaxed text-stone-600">A new question goes up every night at midnight, New York time.</p>
        </section>
      )}

      {answered && after}
    </div>
  );
}

// Ozho waits by the bowl; a right answer feeds him. Either way he has a
// kind word, and he is never sad about a miss.
function Ozho({ answered, right, compact }: { answered: boolean; right: boolean; compact: boolean }) {
  const line = !answered
    ? "My bowl is empty. A right answer fills it."
    : right
      ? "Crunch! You fed me. Tail at full speed."
      : "Not this one, and that's okay. I'll be here tomorrow with a new one.";
  return (
    <div className="mt-4 flex items-center gap-3">
      <div className={`flex-none ${answered && right ? "animate-ozho-pet" : ""}`}>
        <PixelDog size={compact ? 44 : 60} mood={answered && right ? "happy" : "neutral"} tailFrame={answered && right ? 2 : 0} />
      </div>
      <p
        key={answered ? (right ? "right" : "wrong") : "waiting"}
        className={`relative min-w-0 flex-1 rounded-xl border border-[#c9d6ee] bg-[#f3f6fc] px-3.5 py-2.5 text-[16px] leading-snug text-ink ${answered ? "paper-sticky" : ""}`}
      >
        <span className="absolute -left-[7px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-[#c9d6ee] bg-[#f3f6fc]" aria-hidden />
        <span className="sr-only">Ozho the dog: </span>
        {line}
      </p>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-lg border border-[#d9e2f4] bg-[#f3f6fc] px-3 py-2.5 text-center">
      <div className="font-display text-[28px] font-semibold leading-none text-ink">{n}</div>
      <div className="mt-1 text-[14px] text-stone-600">{label}</div>
    </div>
  );
}

const MANUAL_HINT = "Couldn't copy in this browser. Your result is selected so you can copy it yourself.";

/** "Share your result": the share sheet, else copied, with a pen tick. */
function ShareResult({ text, seed }: { text: string; seed: number }) {
  const { copied, manual, fieldRef, share } = useShareText(text);
  return (
    <div>
      <button
        type="button"
        onClick={share}
        className="relative inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-forest px-6 text-[16px] font-semibold text-white transition-colors hover:bg-[#1f2f5a] sm:w-auto"
      >
        {/* Both labels share one grid cell so the button keeps its width. */}
        <span className="inline-grid">
          <span className={`col-start-1 row-start-1 ${copied ? "invisible" : ""}`}>Share your result</span>
          <span className={`col-start-1 row-start-1 ${copied ? "" : "invisible"}`}>Copied</span>
        </span>
        <PenTick show={copied} seed={seed} className="-right-3 -top-3.5 h-[24px] w-[28px]" />
      </button>
      <p aria-live="polite" className={manual ? "mt-2 text-[14px] text-stone-600" : "sr-only"}>
        {manual ? MANUAL_HINT : copied ? "Result copied." : ""}
      </p>
      {manual && (
        <textarea
          ref={fieldRef}
          readOnly
          rows={2}
          value={text}
          aria-label="Your result"
          onFocus={(e) => e.currentTarget.select()}
          className="mt-2 w-full resize-none rounded-lg border border-[#b4c5e6] bg-[#eef3fb] px-3 py-2 font-mono text-[14px] text-ink focus:border-[#4a67a6] focus:outline-none"
        />
      )}
    </div>
  );
}
