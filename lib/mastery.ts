// Blends two different signals of how well a student knows a domain into one
// number, so logging a practice test in the analysis section visibly moves
// the same "mastery" the dashboard, plan, and star ratings all read from --
// instead of practice-test scores living only on the analysis page.
//
//   - quizPct: average best-score % across that domain's subskill quizzes
//     (null if the student hasn't attempted any of them yet)
//   - testPct: that domain's subscore % from the most recent practice test
//     the student logged (null if they've never reported one)
//
// Quiz mastery is weighted higher: it's granular, per-subskill, and the
// thing the student is actually practicing day to day. The practice-test
// score is a real, holistic signal but self-reported and lower-resolution
// (one % per domain per test), so it nudges the number rather than setting
// it outright.
const QUIZ_WEIGHT = 0.6;
const TEST_WEIGHT = 0.4;

export function blendMastery(quizPct: number | null, testPct: number | null): number | null {
  if (quizPct === null && testPct === null) return null;
  if (quizPct === null) return testPct;
  if (testPct === null) return quizPct;
  return Math.round(quizPct * QUIZ_WEIGHT + testPct * TEST_WEIGHT);
}

export const MAX_STARS = 5;

/**
 * Converts a blended mastery % into a 0-5 star rating. No stars at all until
 * the student has actually touched the domain (pct === null) -- after that,
 * every domain shows at least one star for having started, scaling up to 5
 * at a perfect blended score.
 */
export function starsForPct(pct: number | null): number {
  if (pct === null) return 0;
  return Math.max(1, Math.min(MAX_STARS, Math.round((pct / 100) * MAX_STARS)));
}

export interface DomainInfo {
  domain: string;
  section: string;
}

export interface DomainMastery extends DomainInfo {
  quizPct: number | null;
  testPct: number | null;
  blendedPct: number | null;
  stars: number;
}

/**
 * Per-subskill quiz best-score %, keyed by subskill id -- the shared input
 * shape both quiz-mastery and pacing calculations read from.
 */
export type ProgressMap = Record<string, { bestScore: number; total: number }>;

function quizPctForDomain(domain: string, subskillIds: string[], progress: ProgressMap): number | null {
  const attempted = subskillIds.map((id) => progress[id]).filter(Boolean) as {
    bestScore: number;
    total: number;
  }[];
  if (attempted.length === 0) return null;
  const pct = attempted.reduce((acc, p) => acc + p.bestScore / p.total, 0) / attempted.length;
  return Math.round(pct * 100);
}

/**
 * Builds the full per-domain mastery breakdown used everywhere: dashboard
 * star pills, the plan page's "today" recommendation, and the analysis
 * page's subject breakdown. `latestTestDomainScores` is the most recently
 * logged practice test's domainScores object (or null/undefined if none
 * has been logged yet).
 */
export function computeDomainMastery(
  domains: DomainInfo[],
  subskillsByDomain: Record<string, string[]>,
  progress: ProgressMap,
  latestTestDomainScores: Record<string, number> | null | undefined
): DomainMastery[] {
  return domains.map(({ domain, section }) => {
    const quizPct = quizPctForDomain(domain, subskillsByDomain[domain] ?? [], progress);
    const testPct = latestTestDomainScores?.[domain] ?? null;
    const blendedPct = blendMastery(quizPct, testPct);
    return { domain, section, quizPct, testPct, blendedPct, stars: starsForPct(blendedPct) };
  });
}

/** Star total across every domain, the currency costume unlocks spend. */
export function totalStars(domainMastery: DomainMastery[]): number {
  return domainMastery.reduce((acc, d) => acc + d.stars, 0);
}

/** Same blend/star rating rolled up to one section ("Math" or "Reading and Writing"). */
export function sectionMastery(domainMastery: DomainMastery[], section: string): { pct: number | null; stars: number } {
  const inSection = domainMastery.filter((d) => d.section === section && d.blendedPct !== null);
  if (inSection.length === 0) return { pct: null, stars: 0 };
  const pct = Math.round(inSection.reduce((acc, d) => acc + (d.blendedPct as number), 0) / inSection.length);
  return { pct, stars: starsForPct(pct) };
}
