import { ALL_SUBSKILLS } from "@/data/curriculum";

// How much of the digital SAT each domain is worth, from College Board's
// published test specifications (approximate shares of each section's
// questions). Each section is half the composite score. Used to spend the
// plan's time -- and mixed review's questions -- where the points are,
// instead of evenly across 29 subskills that are worth very different
// amounts.
export const DOMAIN_SHARE: Record<string, number> = {
  "Information and Ideas": 0.26,
  "Craft and Structure": 0.28,
  "Expression of Ideas": 0.2,
  "Standard English Conventions": 0.26,
  Algebra: 0.35,
  "Advanced Math": 0.35,
  "Problem-Solving and Data Analysis": 0.15,
  "Geometry and Trigonometry": 0.15,
};

const countByDomain = new Map<string, number>();
for (const s of ALL_SUBSKILLS) countByDomain.set(s.domain, (countByDomain.get(s.domain) ?? 0) + 1);

/** A subskill's approximate share of the composite score (all 29 sum to ~1). */
export function subskillWeight(subskill: { domain: string }): number {
  const share = DOMAIN_SHARE[subskill.domain] ?? 0.2;
  return (0.5 * share) / (countByDomain.get(subskill.domain) ?? 1);
}
