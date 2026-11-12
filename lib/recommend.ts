import type { OutlineSection } from "./curriculumOutline";
import { isPassed, type ProgressMap } from "./progressState";

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
  kind: "lesson" | "review" | "test";
}

export const MIXED_REVIEW: Recommendation = { label: "Today's mixed review", href: "/review", kind: "review" };
export const WEEKLY_REVIEW_HREF = "/review?weekly=1";

/**
 * The single next step to feature as a one-click "start here" -- on the
 * dashboard card, and in Ozho's panel:
 *
 * 1. Today's new subskill, if it isn't passed yet.
 * 2. On a test day, the practice test (until it's logged).
 * 3. On a review day, mixed review (once there are two subskills to mix),
 *    or the week's weekly review on its own day until it's done.
 * 4. Otherwise the next subskill she hasn't passed, in plan order.
 * 5. Everything passed: mixed review, which is where mastery happens.
 *
 * `order` is the plan's own subskill order (see orderSubskillsByWeakness);
 * without it, curriculum order. `weekly` and `testLogged` come from
 * lib/planStatus.ts, so the dashboard, Ozho and the quiz's "Up next" all
 * give the same answer.
 */
export function findRecommended(
  curriculum: OutlineSection[],
  progress: ProgressMap,
  today: RecommendTodayPlan | null,
  opts: {
    order?: string[];
    reviewReady?: boolean;
    weekly?: { week: number; today: boolean; done: boolean } | null;
    testLogged?: boolean;
  } = {}
): Recommendation | null {
  if (today && today.type === "lesson") {
    const next = today.subskills.find((s) => !isPassed(progress[s.id]));
    if (next) return { label: next.name, href: `/subskill/${next.id}`, domain: next.domain, kind: "lesson" };
  }
  if (today?.type === "test" && !opts.testLogged) {
    return { label: `Take full-length practice test ${today.testNumber} of 8`, href: "/plan#practice-tests", kind: "test" };
  }
  if (today?.type === "review" && opts.reviewReady) {
    const w = opts.weekly;
    return w && w.today && !w.done ? { label: `Week ${w.week} review`, href: WEEKLY_REVIEW_HREF, kind: "review" } : MIXED_REVIEW;
  }

  const all = curriculum.flatMap((sec) => sec.domains.flatMap((d) => d.subskills.map((s) => ({ ...s, domain: d.domain }))));
  const byId = new Map(all.map((s) => [s.id, s]));
  const ordered = opts.order ? opts.order.map((id) => byId.get(id)!).filter(Boolean) : all;
  const next = ordered.find((s) => !isPassed(progress[s.id]));
  if (next) return { label: next.name, href: `/subskill/${next.id}`, domain: next.domain, kind: "lesson" };
  return opts.reviewReady ? MIXED_REVIEW : null;
}
