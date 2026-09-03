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
        const isWrongSelected = revealed && isSelected && ci !== correctIndex;
        // Roving tabIndex: only the selected choice sits in the Tab order
        // (the first choice, before anything's picked), so Tab moves past
        // the whole group in one stop and arrow keys move within it --
        // exactly how a native radio group behaves.
        const tabIndex = disabled ? -1 : isSelected || (selected === null && ci === 0) ? 0 : -1;
        return (
          <div
            key={ci}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={disabled}
            tabIndex={tabIndex}
            onClick={() => !disabled && onSelect(ci)}
            onKeyDown={(e) => handleKeyDown(e, ci)}
            className={`px-3 py-2.5 rounded-lg text-[13.5px] border focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d7fd6] focus-visible:ring-offset-1 ${
              disabled ? "cursor-default" : "cursor-pointer"
            } ${
              isCorrect
                ? "border-accent bg-[#f0f7f2]"
                : isWrongSelected
                ? "border-red-700 bg-[#fdf0f0]"
                : isSelected
                ? "border-ink bg-[#f5f5f8]"
                : "border-[#ece9f7] bg-white hover:border-[#d8d4f0]"
            } text-ink`}
          >
            {String.fromCharCode(65 + ci)}. <MathText text={choice} />
          </div>
        );
      })}
    </div>
  );
}
