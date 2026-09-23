import { QUESTIONS, type Question } from "@/data/questions";
import { getSubskill } from "@/data/curriculum";

// Every practice question gets a stable id derived from its own text, so
// attempt history (the ItemAttempt table) keeps pointing at the same
// question even if the bank is reordered or grows. Editing a question's
// wording gives it a new id, which is right: it's a different question.

function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

export interface BankItem extends Question {
  id: string;
  subskillId: string;
  section: string;
  domain: string;
}

const byId = new Map<string, BankItem>();
const bySubskill = new Map<string, BankItem[]>();
for (const [subskillId, qs] of Object.entries(QUESTIONS)) {
  const sub = getSubskill(subskillId);
  const list: BankItem[] = [];
  for (const q of qs) {
    const item: BankItem = {
      ...q,
      id: `${subskillId}:${fnv1a(q.q)}`,
      subskillId,
      section: sub?.section ?? "",
      domain: sub?.domain ?? "",
    };
    byId.set(item.id, item);
    list.push(item);
  }
  bySubskill.set(subskillId, list);
}

export function getItem(id: string): BankItem | undefined {
  return byId.get(id);
}

export function itemsForSubskill(subskillId: string): BankItem[] {
  return bySubskill.get(subskillId) ?? [];
}

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

export interface GradedItem {
  item: BankItem;
  choice: number;
  correct: boolean;
  ms: number | null;
  confidence: Confidence | null;
}

const CONFIDENCES = new Set(["sure", "unsure", "guessed"]);

/** Grades a client submission against the bank; drops anything malformed. */
export function gradeItems(raw: unknown, onlySubskill?: string): GradedItem[] {
  if (!Array.isArray(raw)) return [];
  const out: GradedItem[] = [];
  const seen = new Set<string>();
  for (const r of raw.slice(0, 60)) {
    if (!r || typeof r !== "object") continue;
    const { itemId, choiceText, ms, confidence } = r as Record<string, unknown>;
    if (typeof itemId !== "string" || typeof choiceText !== "string" || seen.has(itemId)) continue;
    const item = getItem(itemId);
    if (!item || (onlySubskill && item.subskillId !== onlySubskill)) continue;
    const choice = item.choices.indexOf(choiceText);
    if (choice < 0) continue;
    seen.add(itemId);
    out.push({
      item,
      choice,
      correct: choice === item.answer,
      ms: typeof ms === "number" && Number.isFinite(ms) ? Math.max(0, Math.min(3_600_000, Math.round(ms))) : null,
      confidence: typeof confidence === "string" && CONFIDENCES.has(confidence) ? (confidence as Confidence) : null,
    });
  }
  return out;
}
