// The small, data-free half of lib/items.ts: the pace target and the shapes
// an answered question travels in. Client components import from here, never
// from lib/items.ts -- that file builds its lookup tables from the whole
// question bank (answer keys included) and the whole curriculum, and one
// value import of it from a "use client" file ships all of that to the
// browser.

// The digital SAT's own pace: Reading and Writing is 54 questions in 64
// minutes, Math 44 in 70. Used as the gentle per-question target on the
// pace clock -- never a cutoff.
export const PACE_SECONDS: Record<string, number> = {
  "Reading and Writing": 71,
  Math: 95,
};

export function paceFor(section: string): number {
  return PACE_SECONDS[section] ?? 80;
}

export type Confidence = "sure" | "unsure" | "guessed";

/** One answered question, as the client reports it. */
export interface AnsweredItem {
  itemId: string;
  // The chosen choice's text: robust to the per-attempt shuffle, and
  // graded on the server against the bank, never trusted as "correct".
  choiceText: string;
  ms?: number;
  confidence?: Confidence;
}
