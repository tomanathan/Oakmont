import { MathText } from "./MathText";

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
}) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>, ci: number) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(ci);
      return;
    }
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (delta === 0) return;
    e.preventDefault();
    const next = (ci + delta + choices.length) % choices.length;
    onSelect(next);
    const group = e.currentTarget.parentElement;
    (group?.children[next] as HTMLElement | undefined)?.focus();
  }

  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Answer choices">
      {choices.map((choice, ci) => {
        const isSelected = selected === ci;
        const isCorrect = revealed && ci === correctIndex;
        const isWrongSelected = (revealed && isSelected && ci !== correctIndex) || (struck.includes(ci) && ci !== correctIndex);
        // Roving tabIndex: only the selected choice sits in the Tab order
        // (the first choice, before anything's picked), so Tab moves past
        // the whole group in one stop and arrow keys move within it --
        // exactly how a native radio group behaves.
        const tabIndex = disabled ? -1 : isSelected || (selected === null && ci === 0) ? 0 : -1;
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
          : `border-[#d9ceb7] bg-white ${disabled ? "" : "hover:border-[#587356] hover:bg-[#fbf8f1]"}`;
        const badge = isCorrect
          ? "bg-accent text-white"
          : isWrongSelected
          ? "bg-[#b23b3b] text-white"
          : isSelected
          ? "bg-forest text-white"
          : "bg-[#eef3e9] text-[#2c4c3b]";
        return (
          <div
            key={ci}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={disabled}
            tabIndex={tabIndex}
            onClick={() => !disabled && onSelect(ci)}
            onKeyDown={(e) => handleKeyDown(e, ci)}
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-[14.5px] leading-snug text-ink shadow-[0_1px_2px_rgba(38,34,24,0.05)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#587356] focus-visible:ring-offset-2 ${
              disabled ? "cursor-default" : "cursor-pointer"
            } ${row}`}
          >
            <span
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[12.5px] font-bold transition-colors ${badge}`}
              aria-hidden
            >
              {isCorrect ? "✓" : isWrongSelected ? "✕" : String.fromCharCode(65 + ci)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="sr-only">{String.fromCharCode(65 + ci)}. </span>
              <MathText text={choice} />
            </span>
          </div>
        );
      })}
    </div>
  );
}
