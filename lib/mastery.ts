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

/** Every domain within one subject (Math, or Reading and Writing) mastered. */
export function isSectionComplete(domainMastery: DomainMastery[], section: string): boolean {
  const inSection = domainMastery.filter((d) => d.section === section);
  return inSection.length > 0 && inSection.every((d) => d.completed);
}

/** Every domain across the entire curriculum mastered -- the top of the mountain. */
export function isCurriculumComplete(domainMastery: DomainMastery[]): boolean {
  return domainMastery.length > 0 && domainMastery.every((d) => d.completed);
}

/**
 * A domain's "how urgently does this need study time" number for
 * ordering the study plan -- lower means weaker means scheduled sooner.
 * Deliberately a different number from `stars` above: stars are a
 * quiz-mastery-only display value (see computeDomainMastery's own
 * comment on why testPct was pulled back out of it), but scheduling
 * priority is exactly the place a real practice-test score should carry
 * more weight than quiz history -- an actual exam-format result is the
 * more current, more direct signal of where a student stands, with quiz
 * mastery filling in for domains a recent test didn't cover.
 *
 * A domain with neither signal yet (never quizzed, never tested) gets a
 * neutral middle score rather than being pushed to the front (treated as
 * maximally weak, which isn't known) or the back (treated as safely
 * mastered, which also isn't known) -- see orderSubskillsByWeakness for
 * why that neutral default is what keeps a brand-new student's plan
 * exactly in its original order.
 */
function domainWeaknessScore(dm: Pick<DomainMastery, "testPct" | "quizPct"> | undefined): number {
  if (!dm) return 60;
  if (dm.testPct !== null && dm.quizPct !== null) return dm.testPct * 0.65 + dm.quizPct * 0.35;
  if (dm.testPct !== null) return dm.testPct;
  if (dm.quizPct !== null) return dm.quizPct;
  return 60;
}

/**
 * Reorders a list of subskills so the ones in weaker domains come first --
 * this is what makes the study plan actually reflect practice-test and
 * quiz performance, not just the curriculum's original authoring order
 * and the target test date. Two things are deliberately preserved:
 *
 * - Stable within ties: a domain's own subskills keep their original
 *   relative order (that order is already easy -> hard), and a brand-new
 *   student with no quiz or test data at all gets back the *exact*
 *   original order -- every domain scores the same neutral default, so
 *   nothing moves until real performance data exists to move it.
 * - A pure reordering, never a filter: the result is always the same
 *   subskills, just resequenced, so buildStudyPlan's guarantee that every
 *   subskill gets scheduled exactly once still holds no matter what
 *   domainMastery says.
 */
export function orderSubskillsByWeakness<T extends { id: string; domain: string }>(
  subskills: T[],
  domainMastery: DomainMastery[]
): string[] {
  const scoreByDomain = new Map(domainMastery.map((d) => [d.domain, domainWeaknessScore(d)]));
  return subskills
    .map((s, i) => ({ id: s.id, i, score: scoreByDomain.get(s.domain) ?? 60 }))
    .sort((a, b) => a.score - b.score || a.i - b.i)
    .map((x) => x.id);
}
