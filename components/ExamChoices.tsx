"use client";

import { useState } from "react";
import { MathText } from "./MathText";
import { PenCross, PencilStrike, PenLoop, PenTick, seedOf } from "./paper/Pencil";

/**
 * Renders a set of exam-style A/B/C/D answer choices with click-to-select
 * and reveal styling. Shared by the practice quiz (SubskillClient) and the
 * lesson's worked examples (also SubskillClient) so a question looks and
 * behaves identically whether a student is being taught or being tested --
 * that structural sameness is the whole point of both surfaces now using
 * the same exam-format question shape (see WorkedExample/Question).
 *
 * A real ARIA radio group: each choice is `role="radio"` inside a
 * `radiogroup`, with a roving tabIndex (one stop in the Tab order for the
 * whole group, same as a native radio button set) and arrow-key navigation
 * that moves the selection the way arrow keys do on a real radio group.
 * Before this, every choice was a bare `<div onClick>` with no keyboard or
 * screen-reader path at all -- a student who couldn't use a mouse could not
 * answer a single question anywhere in the app.
 */
export function ExamChoices({
  choices,
  correctIndex,
  selected,
  revealed,
  onSelect,
  disabled = false,
  struck = [],
  crossOut = true,
  arrowSelects = true,
}: {
  choices: string[];
  correctIndex: number;
  selected: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
  // The practice quiz locks choices once submitted (retaking is its own
  // explicit action); a worked example never needs this -- picking a
  // different choice after seeing the answer is fine, even encouraged.
  disabled?: boolean;
  // Choices already tried and found wrong (worked examples), marked wrong
  // even before the correct answer is revealed.
  struck?: number[];
  // The cross-out tool, as on the real test: rule a pencil line through a
  // choice you've ruled out. Only while answering; the lines stay once
  // the answer is shown.
  crossOut?: boolean;
  // Whether arrow keys pick the choice they land on, as on a native radio
  // group. False where picking is final (the starter questions reveal the
  // answer at once): arrows then only move focus, and Enter or Space picks.
  arrowSelects?: boolean;
}) {
  const key = choices.join("|");
  const [crossed, setCrossed] = useState<{ key: string; set: Set<number> }>({ key, set: new Set() });
  const out = crossed.key === key ? crossed.set : new Set<number>();
  const canCross = crossOut && !revealed && !disabled;
  // Where the Tab stop sits when arrows only move focus (it follows focus).
  const [focused, setFocused] = useState<{ key: string; ci: number } | null>(null);
  const tabStop = !arrowSelects && focused?.key === key ? focused.ci : selected ?? 0;
  function toggleCross(ci: number) {
    const next = new Set(out);
    if (next.has(ci)) next.delete(ci);
    else next.add(ci);
    setCrossed({ key, set: next });
  }
  function select(ci: number) {
    // Picking a crossed-out choice takes the line back off it.
    if (out.has(ci)) toggleCross(ci);
    onSelect(ci);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>, ci: number) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(ci);
      return;
    }
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (delta === 0) return;
    e.preventDefault();
    const next = (ci + delta + choices.length) % choices.length;
    if (arrowSelects) select(next);
    const group = e.currentTarget.closest('[role="radiogroup"]');
    (group?.querySelectorAll<HTMLElement>('[role="radio"]')[next])?.focus();
  }

  const seed = seedOf(key);
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Answer choices">
      {choices.map((choice, ci) => {
        const isSelected = selected === ci;
        const isCorrect = revealed && ci === correctIndex;
        const isWrongSelected = (revealed && isSelected && ci !== correctIndex) || (struck.includes(ci) && ci !== correctIndex);
        const isOut = out.has(ci) && !isSelected;
        // Roving tabIndex: only the selected choice sits in the Tab order
        // (the first choice, before anything's picked), so Tab moves past
        // the whole group in one stop and arrow keys move within it --
        // exactly how a native radio group behaves.
        const tabIndex = disabled ? -1 : ci === tabStop ? 0 : -1;
        // Row and letter badge share one state: resting (warm border,
        // pale sage badge), picked (green outline, solid badge), and once
        // revealed, right (green) or wrong (red). The badge carries the
        // state even for readers who don't register the row tint.
        const row = isCorrect
          ? "border-accent bg-[#edf6f0] ring-1 ring-accent"
          : isWrongSelected
          ? "border-[#c0524f] bg-[#fcefee] ring-1 ring-[#c0524f]"
          : isSelected
          ? "border-forest bg-[#f2f5ee] ring-1 ring-forest"
          : `border-[#d9ceb7] bg-white ${disabled ? "" : "hover:border-[#4a67a6] hover:bg-[#fbf8f1]"}`;
        const badge = isCorrect
          ? "bg-accent text-white"
          : isWrongSelected
          ? "bg-[#b23b3b] text-white"
          : isSelected
          ? "bg-forest text-white"
          : "bg-[#e9effb] text-[#26427e]";
        const letter = String.fromCharCode(65 + ci);
        return (
          <div key={ci} className="flex items-center gap-2">
            <div
              role="radio"
              aria-checked={isSelected}
              aria-disabled={disabled}
              tabIndex={tabIndex}
              onClick={() => !disabled && select(ci)}
              onKeyDown={(e) => handleKeyDown(e, ci)}
              onFocus={arrowSelects ? undefined : () => setFocused({ key, ci })}
              className={`relative flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-3.5 py-3 text-[14.5px] leading-snug text-ink shadow-[3px_3px_0_rgba(52,97,193,0.13)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a67a6] focus-visible:ring-offset-2 ${
                disabled ? "cursor-default" : "cursor-pointer"
              } ${row}`}
            >
              <span className="relative flex-shrink-0">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-[12.5px] font-bold transition-colors ${badge}`}
                  aria-hidden
                >
                  {isCorrect ? "✓" : isWrongSelected ? "✕" : letter}
                </span>
                {/* The student's own pen loop round the letter they picked;
                    picking another rubs this one out. */}
                <PenLoop show={isSelected} seed={seed + ci} className="-left-[9px] -top-[8px] h-[44px] w-[46px]" />
              </span>
              <span className="relative min-w-0 flex-1">
                <span className="sr-only">
                  {letter}. {isOut ? "(crossed out) " : ""}
                </span>
                <span className="relative inline-block max-w-full">
                  <span className={`transition-opacity duration-200 ${isOut ? "opacity-40" : ""}`}>
                    <MathText text={choice} />
                  </span>
                  <PencilStrike show={isOut} seed={seed + ci * 5} className="-left-1.5 -right-1.5 top-1/2 h-[10px] -translate-y-1/2" />
                </span>
              </span>
              {/* Marked like a teacher would: a tick on the right one, a
                  cross on a wrong pick, in the corner. */}
              <PenTick show={isCorrect} seed={seed + ci * 7} delay={isSelected ? 0 : 160} className="-right-2.5 -top-5 h-[38px] w-[44px]" />
              <PenCross show={isWrongSelected} seed={seed + ci * 11} className="-right-2 -top-3.5 h-[28px] w-[28px]" />
            </div>
            {crossOut && (
              <button
                type="button"
                onClick={() => toggleCross(ci)}
                disabled={!canCross || isSelected}
                aria-label={isOut ? `Undo cross-out on choice ${letter}` : `Cross out choice ${letter}`}
                title={isOut ? "Undo" : "Cross out"}
                className={`relative flex h-8 w-8 flex-none items-center justify-center rounded-full border text-[12px] font-bold transition-[transform,opacity] duration-150 ${
                  isOut ? "border-[#7d8fb5] bg-[#eef2f9] text-[#4b5d82]" : "border-[#c9d6ee] bg-white text-[#5b6b8f] hover:border-[#4a67a6] hover:text-[#26427e]"
                } ${!canCross || isSelected ? "pointer-events-none opacity-0" : "hover:-translate-y-0.5 active:scale-90"}`}
              >
                {isOut ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                    <path d="M4 6.5h6a3 3 0 0 1 0 6H7M4 6.5 6.8 3.7M4 6.5l2.8 2.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <>
                    {letter}
                    <span className="absolute left-1.5 right-1.5 top-1/2 h-[1.5px] -rotate-12 rounded bg-current" aria-hidden />
                  </>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
