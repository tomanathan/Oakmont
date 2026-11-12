import type { Difficulty } from "@/lib/skillPreview";

// The lesson's difficulty pill (DifficultyPill in SubskillClient), same
// colours, for the public skill pages.
const STYLES: Record<Difficulty, string> = {
  easy: "bg-[#eaf6ef] text-accent border-[#cde8d9]",
  medium: "bg-[#fbf1df] text-[#9a6a12] border-[#f0ddb8]",
  hard: "bg-[#fbeaea] text-[#b23b3b] border-[#f0d0d0]",
};
const LABELS: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };

export function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${STYLES[difficulty]}`}>
      {LABELS[difficulty]}
    </span>
  );
}
