import { statusOf, type SubskillProgress, type SubskillStatus } from "@/lib/progressState";

const STATUS_TITLE: Record<SubskillStatus, string> = {
  new: "Not started yet",
  attempted: "Quizzed, not perfect yet. A perfect quiz passes it.",
  passed: "Perfect quiz. Get it right in a mixed review to master it.",
  mastered: "Mastered: passed, then answered correctly in a mixed review.",
  due: "Mastered, but it's been a while. It's in your mixed review until you get it right again.",
};

/** Card styling per status, shared by every subskill list. */
export const STATUS_CARD: Record<SubskillStatus, string> = {
  new: "",
  attempted: "bg-white border-gray-200 hover:border-gray-300",
  passed: "bg-[#f0f7f2] border-[#cde8d9] hover:border-[#b5dcc6]",
  mastered: "bg-[#fffaf0] border-[#f0e0b0] hover:border-[#e8d29a]",
  due: "bg-[#fff8f1] border-[#f3dcc4] hover:border-[#ebc7a3]",
};

/**
 * One subskill's standing, as a small label: its best score while it's
 * being worked on, then Passed, Mastered, or Refresher due. The title
 * explains each, since "passed" and "mastered" now mean different things.
 */
export function SubskillStatusBadge({
  progress,
  showNew = false,
}: {
  progress: SubskillProgress | undefined;
  showNew?: boolean;
}) {
  const status = statusOf(progress);
  const base = "whitespace-nowrap text-[11px] font-semibold";
  const title = STATUS_TITLE[status];
  switch (status) {
    case "mastered":
      return (
        <span className={`${base} text-[#c9971b]`} title={title}>
          ★ Mastered
        </span>
      );
    case "due":
      return (
        <span className={`${base} text-[#b4541a]`} title={title}>
          ↻ Refresher due
        </span>
      );
    case "passed":
      return (
        <span className={`${base} text-accent`} title={title}>
          ✓ Passed
        </span>
      );
    case "attempted":
      return (
        <span className={`${base} text-gray-500`} title={title}>
          {progress!.bestScore}/{progress!.total}
        </span>
      );
    default:
      return showNew ? (
        <span className={`${base} font-normal text-gray-300`} title={title}>
          Not started
        </span>
      ) : null;
  }
}
