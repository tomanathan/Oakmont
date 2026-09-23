/**
 * Reshuffles a question's or worked example's choices (Fisher-Yates) and
 * remaps `answer` to match, so the correct choice never sits wherever it
 * happened to be authored -- a position a student would otherwise start
 * to learn. Generic over both Question and WorkedExample, which share the
 * same {choices, answer} shape; every other field passes through.
 */
export function shuffleChoices<T extends { choices: string[]; answer: number }>(item: T): T {
  const order = [0, 1, 2, 3].slice(0, item.choices.length);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...item, choices: order.map((idx) => item.choices[idx]), answer: order.indexOf(item.answer) };
}

/** A shuffled copy of an array (Fisher-Yates). */
export function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
