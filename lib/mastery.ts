// Per-domain quiz mastery: the single source of truth for the star ratings
// shown on the dashboard, analysis page, and the wardrobe -- and for which
// domains count as "completed" for costume unlocks (see lib/costumes.ts).
// Deliberately quiz-only: a domain's stars track how well you've actually
// done on that domain's subskill quizzes, not a blend with self-reported
// practice-test scores (those still show up as their own separate number on
// the analysis page, just not folded into the star rating itself).

export const MAX_STARS = 5;

/**
 * Converts a quiz-mastery % into a 0-5 star rating. No stars at all until
 * the student has actually attempted the domain (pct === null) -- after
 * that, every domain shows at least one star for having started, scaling
 * up to 5 at a perfect average quiz score.
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
  quizPct: number | null; // 0-100, average best-score % across this domain's subskill quizzes
  testPct: number | null; // 0-100, this domain's subscore on the latest logged practice test
  stars: number; // 0-5, from quizPct alone
  // Every subskill in this domain has been quizzed to a perfect score --
  // the "completed a section" moment that unlocks a wardrobe costume.
  completed: boolean;
}

/**
 * Per-subskill quiz best-score %, keyed by subskill id -- the shared input
 * shape both quiz-mastery and pacing calculations read from.
 */
export type ProgressMap = Record<string, { bestScore: number; total: number }>;

function quizPctForDomain(subskillIds: string[], progress: ProgressMap): number | null {
  const attempted = subskillIds.map((id) => progress[id]).filter(Boolean) as {
    bestScore: number;
    total: number;
  }[];
  if (attempted.length === 0) return null;
  const pct = attempted.reduce((acc, p) => acc + p.bestScore / p.total, 0) / attempted.length;
  return Math.round(pct * 100);
}

function isDomainComplete(subskillIds: string[], progress: ProgressMap): boolean {
  if (subskillIds.length === 0) return false;
  return subskillIds.every((id) => {
    const p = progress[id];
    return !!p && p.bestScore === p.total;
  });
}

/**
 * Builds the full per-domain mastery breakdown used everywhere: dashboard
 * star pills, the wardrobe's unlock count, and the analysis page's subject
 * breakdown. `latestTestDomainScores` is the most recently logged practice
 * test's domainScores object (or null/undefined if none has been logged
 * yet) -- shown alongside quiz mastery on the analysis page, but no longer
 * folded into the star rating itself.
 */
export function computeDomainMastery(
  domains: DomainInfo[],
  subskillsByDomain: Record<string, string[]>,
  progress: ProgressMap,
  latestTestDomainScores: Record<string, number> | null | undefined
): DomainMastery[] {
  return domains.map(({ domain, section }) => {
    const subskillIds = subskillsByDomain[domain] ?? [];
    const quizPct = quizPctForDomain(subskillIds, progress);
    const testPct = latestTestDomainScores?.[domain] ?? null;
    return {
      domain,
      section,
      quizPct,
      testPct,
      stars: starsForPct(quizPct),
      completed: isDomainComplete(subskillIds, progress),
    };
  });
}

/** How many domains ("sections") the student has fully completed -- the currency costume unlocks spend. */
export function completedDomainCount(domainMastery: DomainMastery[]): number {
  return domainMastery.filter((d) => d.completed).length;
}
