import type { ProgressMap } from "./progressState";
import { isMastered } from "./progressState";
import { subskillWeight } from "./testWeights";

export type { ProgressMap } from "./progressState";

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
  // Every subskill in this domain is mastered (see lib/progressState.ts) --
  // the "completed a section" moment that unlocks a wardrobe costume.
  completed: boolean;
}

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
  return subskillIds.every((id) => isMastered(progress[id]));
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
 *
 * Exported (not just orderSubskillsByWeakness-internal) so /api/pet/state
 * can pick out a single "weakest domain worth mentioning" for Ozho's own
 * progression-aware chatter, using the exact same notion of "weak" the
 * study plan itself schedules around, rather than inventing a second one.
 */
export function domainWeaknessScore(dm: Pick<DomainMastery, "testPct" | "quizPct"> | undefined): number {
  if (!dm) return 60;
  if (dm.testPct !== null && dm.quizPct !== null) return dm.testPct * 0.65 + dm.quizPct * 0.35;
  if (dm.testPct !== null) return dm.testPct;
  if (dm.quizPct !== null) return dm.quizPct;
  return 60;
}

/**
 * The order the study plan introduces subskills in. Three rules:
 *
 * - Sections alternate. Reading and Writing and Math are interleaved by
 *   how much of the score each subskill carries (see lib/testWeights.ts),
 *   rather than finishing one section before starting the other -- which
 *   left one half of the test untouched for months before test day.
 * - Within a section, domains a logged practice test shows are weaker come
 *   first; untested domains keep their authored order. Subskills within a
 *   domain always keep theirs (it runs easy -> hard).
 * - Only practice tests move it. Quiz scores deliberately don't: a quiz
 *   retaken until perfect says little about the skill, and letting quiz
 *   results re-sort the plan meant it reshuffled itself after every quiz.
 *   So the plan holds still between practice tests.
 *
 * Always a pure reordering: every subskill appears exactly once.
 */
export function orderSubskillsByWeakness<T extends { id: string; domain: string; section: string }>(
  subskills: T[],
  domainMastery: DomainMastery[]
): string[] {
  const testByDomain = new Map(domainMastery.map((d) => [d.domain, d.testPct]));
  const sections: string[] = [];
  const bySection = new Map<string, { s: T; i: number; score: number }[]>();
  subskills.forEach((s, i) => {
    if (!bySection.has(s.section)) {
      bySection.set(s.section, []);
      sections.push(s.section);
    }
    bySection.get(s.section)!.push({ s, i, score: testByDomain.get(s.domain) ?? 60 });
  });
  for (const list of bySection.values()) list.sort((a, b) => a.score - b.score || a.i - b.i);

  const cum = new Map(sections.map((sec) => [sec, 0]));
  const out: string[] = [];
  while (out.length < subskills.length) {
    let pickSec: string | null = null;
    for (const sec of sections) {
      if (!bySection.get(sec)!.length) continue;
      if (pickSec === null || cum.get(sec)! < cum.get(pickSec)!) pickSec = sec;
    }
    const next = bySection.get(pickSec!)!.shift()!;
    out.push(next.s.id);
    cum.set(pickSec!, cum.get(pickSec!)! + subskillWeight(next.s));
  }
  return out;
}
