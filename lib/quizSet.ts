import type { BankItem } from "@/lib/items";

// A subskill quiz is a draw from its bank, not the whole bank: 15
// questions, spread across the lesson's patterns, favoring ones she's never
// seen, then ones she missed or wasn't sure of, then the least recent. So
// a retake is a genuinely different set -- passing reflects the skill, not
// a memory of last attempt's questions -- and a quiz stays about 15-25
// minutes at SAT pace however deep the bank grows.

export const QUIZ_SIZE = 15;

export interface QuizAttemptLite {
  itemId: string;
  correct: boolean;
  confidence: string | null;
  createdAt: Date;
}

export function quizSizeFor(bankSize: number): number {
  return Math.min(QUIZ_SIZE, bankSize);
}

export function pickQuizItems(
  bank: BankItem[],
  attempts: QuizAttemptLite[],
  rng: () => number = Math.random,
  now: Date = new Date()
): BankItem[] {
  const size = quizSizeFor(bank.length);
  if (bank.length <= size) return bank;

  const last = new Map<string, QuizAttemptLite>();
  for (const a of [...attempts].sort((x, y) => x.createdAt.getTime() - y.createdAt.getTime())) last.set(a.itemId, a);

  const score = (it: BankItem) => {
    const a = last.get(it.id);
    if (!a) return 100 + rng();
    const days = (now.getTime() - a.createdAt.getTime()) / 86_400_000;
    let s = Math.min(days, 60);
    if (!a.correct) s += 50;
    else if (a.confidence === "unsure" || a.confidence === "guessed") s += 30;
    return s + rng();
  };

  // Round-robin across patterns, best-scored first within each, so no
  // pattern is left out of a quiz while its items are fresh.
  const byPattern = new Map<string, { it: BankItem; s: number }[]>();
  for (const it of bank) {
    const key = it.pattern ?? "";
    byPattern.set(key, [...(byPattern.get(key) ?? []), { it, s: score(it) }]);
  }
  const queues = Array.from(byPattern.values()).map((q) => q.sort((a, b) => b.s - a.s));
  queues.sort((a, b) => b[0].s - a[0].s);
  const picked: BankItem[] = [];
  while (picked.length < size) {
    let took = false;
    for (const q of queues) {
      if (picked.length >= size) break;
      const next = q.shift();
      if (next) {
        picked.push(next.it);
        took = true;
      }
    }
    if (!took) break;
  }
  return picked;
}
