import { MathText } from "./MathText";

/**
 * Renders a set of exam-style A/B/C/D answer choices with click-to-select
 * and reveal styling. Shared by the practice quiz (SubskillClient) and the
 * lesson's worked examples (also SubskillClient) so a question looks and
 * behaves identically whether a student is being taught or being tested --
 * that structural sameness is the whole point of both surfaces now using
 * the same exam-format question shape (see WorkedExample/Question).
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
  return (
    <div className="flex flex-col gap-2">
      {choices.map((choice, ci) => {
        const isSelected = selected === ci;
        const isCorrect = revealed && ci === correctIndex;
        const isWrongSelected = revealed && isSelected && ci !== correctIndex;
        return (
          <div
            key={ci}
            onClick={() => !disabled && onSelect(ci)}
            className={`px-3 py-2.5 rounded-lg text-[13.5px] border ${disabled ? "cursor-default" : "cursor-pointer"} ${
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
