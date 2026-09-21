import type { Section } from "@/data/curriculum";
import type { ProgressMap } from "./mastery";

export interface SectionProgress {
  total: number;
  attemptedCount: number;
  masteredCount: number;
  avgPct: number | null;
}

/**
 * Real mastery numbers for one whole section (Math, or Reading and
 * Writing) -- every subskill across every domain in this section, split
 * into mastered (a perfect quiz score), attempted-but-not-mastered, and
 * untouched. `avgPct` is the average score across ATTEMPTED subskills
 * only (untouched subskills are simply absent from it, not a zero
 * dragging it down) -- an early first attempt shouldn't read as a
 * near-failing grade just because the rest of the section hasn't been
 * started yet. `avgPct` is null with zero attempted, since there's
 * nothing to average and "0%" would misreport "you're failing" instead
 * of the truth, "you haven't started".
 *
 * Shared by the student dashboard and the parent dashboard/share-link
 * view (see components/SubjectRing.tsx, its usual companion) -- both
 * render the exact same ring and number off the exact same numbers,
 * rather than a parent-side reimplementation drifting out of sync.
 */
export function sectionProgress(section: Section, progress: ProgressMap): SectionProgress {
  const subskillIds = section.domains.flatMap((d) => d.subskills.map((s) => s.id));
  const attempted = subskillIds.filter((id) => !!progress[id]);
  const masteredCount = attempted.filter((id) => progress[id].bestScore === progress[id].total).length;
  const avgPct =
    attempted.length > 0
      ? Math.round(
          attempted.reduce((sum, id) => {
            const p = progress[id];
            return sum + (p.total > 0 ? (p.bestScore / p.total) * 100 : 0);
          }, 0) / attempted.length
        )
      : null;
  return { total: subskillIds.length, attemptedCount: attempted.length, masteredCount, avgPct };
}
