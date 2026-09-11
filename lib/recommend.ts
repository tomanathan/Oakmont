import type { Section } from "@/data/curriculum";

type ProgressMap = Record<string, { bestScore: number; total: number }>;

// The minimal shape of "what's on the plan today" that findRecommended
// needs -- a subset of the dashboard's own TodayPlan and of what
// getTodayPlanItem returns, so both the dashboard (client) and the
// /api/plan/next route (server, for Ozho's "what should I do next?"
// action) can call this with what they already have.
export interface RecommendTodayPlan {
  type: "lesson" | "test" | "review" | "rest";
  testNumber?: number;
  subskills: { id: string; name: string; domain: string }[];
}

export interface Recommendation {
  label: string;
  href: string;
  domain?: string;
}

/**
 * The single subskill to feature as a one-click "start here" -- on the
 * dashboard card, and in Ozho's click menu. Prefers whatever the study
 * plan has scheduled for today (skipping anything already mastered);
 * falls back to the first not-yet-mastered subskill in curriculum order
 * once today's slate is clear (or there's no plan slot at all -- e.g. a
 * custom timeline that's already finished).
 */
export function findRecommended(
  curriculum: Section[],
  progress: ProgressMap,
  today: RecommendTodayPlan | null
): Recommendation | null {
  if (today && today.type !== "test" && today.type !== "rest") {
    const next = today.subskills.find((s) => {
      const p = progress[s.id];
      return !p || p.bestScore !== p.total;
    });
    if (next) return { label: next.name, href: `/subskill/${next.id}`, domain: next.domain };
  }
  if (today?.type === "test") {
    return { label: `Take full-length practice test ${today.testNumber} of 8`, href: "/plan#practice-tests" };
  }
  for (const sec of curriculum) {
    for (const d of sec.domains) {
      for (const s of d.subskills) {
        const p = progress[s.id];
        if (!p || p.bestScore !== p.total) {
          return { label: s.name, href: `/subskill/${s.id}`, domain: d.domain };
        }
      }
    }
  }
  return null;
}
