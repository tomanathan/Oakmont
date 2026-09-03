import { ALL_DOMAINS } from "@/data/curriculum";
import { parseDateOnly, utcDayDiff } from "./dateOnly";

const VALID_DOMAINS = new Set(ALL_DOMAINS.map((d) => d.domain));
// No real SAT domain has come close to this many questions on one test
// (Reading & Writing is 54 questions total across all 4 domains, Math is
// 44) -- just a sanity ceiling to block obviously-fabricated counts, not a
// precise per-domain limit.
const MAX_DOMAIN_QUESTIONS = 60;

export interface DomainCount {
  correct: number;
  total: number;
}

export interface PracticeTestInput {
  takenAt?: string;
  compositeScore?: number;
  rwScore?: number;
  mathScore?: number;
  // The literal "X correct out of Y" fraction Bluebook's own score report
  // shows per domain -- e.g. { "Algebra": { correct: 11, total: 13 } }.
  // This replaces asking the student to mentally convert that into a
  // percentage themselves.
  domainCounts?: Record<string, DomainCount | null>;
}

export interface ValidatedPracticeTest {
  takenAt: Date;
  compositeScore: number;
  rwScore: number;
  mathScore: number;
  domainCounts: Record<string, DomainCount>;
  domainScores: Record<string, number>;
}

export type ValidationResult =
  | { ok: true; value: ValidatedPracticeTest }
  | { ok: false; error: string };

/**
 * Shared validation for logging or editing a practice test -- used by both
 * POST (create) and PATCH (edit) so the two can't drift apart and quietly
 * accept different things.
 */
export function validatePracticeTestInput(body: PracticeTestInput): ValidationResult {
  const { takenAt, compositeScore, rwScore, mathScore, domainCounts } = body;

  // Real SAT section scores are always multiples of 10, from 200 to 800 --
  // and the composite is defined as exactly their sum, never a separately
  // reported number, so the three can't be allowed to disagree.
  if (
    typeof compositeScore !== "number" ||
    compositeScore < 400 ||
    compositeScore > 1600 ||
    compositeScore % 10 !== 0
  ) {
    return { ok: false, error: "Composite score must be a multiple of 10 between 400 and 1600." };
  }
  if (typeof rwScore !== "number" || rwScore < 200 || rwScore > 800 || rwScore % 10 !== 0) {
    return { ok: false, error: "Reading & Writing score must be a multiple of 10 between 200 and 800." };
  }
  if (typeof mathScore !== "number" || mathScore < 200 || mathScore > 800 || mathScore % 10 !== 0) {
    return { ok: false, error: "Math score must be a multiple of 10 between 200 and 800." };
  }
  if (rwScore + mathScore !== compositeScore) {
    return { ok: false, error: "Reading & Writing + Math must add up to the composite score." };
  }

  let parsedDate = new Date();
  if (takenAt) {
    const d = parseDateOnly(takenAt);
    if (!d) {
      return { ok: false, error: "Invalid test date." };
    }
    // A test can be logged the day it was taken, but not a day that hasn't
    // happened yet.
    if (utcDayDiff(new Date(), d) > 0) {
      return { ok: false, error: "Test date can't be in the future." };
    }
    parsedDate = d;
  }

  // Validate the raw counts, then derive the percentage from them --
  // domainScores is never taken from the client directly, so the two can
  // never disagree.
  const cleanDomainCounts: Record<string, DomainCount> = {};
  const cleanDomainScores: Record<string, number> = {};
  if (domainCounts) {
    for (const [domain, count] of Object.entries(domainCounts)) {
      if (count === null || count === undefined) continue;
      if (!VALID_DOMAINS.has(domain)) continue;
      const { correct, total } = count;
      if (
        typeof correct !== "number" ||
        typeof total !== "number" ||
        !Number.isInteger(correct) ||
        !Number.isInteger(total) ||
        total <= 0 ||
        total > MAX_DOMAIN_QUESTIONS ||
        correct < 0 ||
        correct > total
      ) {
        return { ok: false, error: `Invalid question count for ${domain}.` };
      }
      cleanDomainCounts[domain] = { correct, total };
      cleanDomainScores[domain] = Math.round((correct / total) * 100);
    }
  }

  return {
    ok: true,
    value: {
      takenAt: parsedDate,
      compositeScore,
      rwScore,
      mathScore,
      domainCounts: cleanDomainCounts,
      domainScores: cleanDomainScores,
    },
  };
}
