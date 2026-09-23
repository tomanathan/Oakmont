/**
 * Which known trap a wrong answer fell into, in the lesson's own words.
 * Naming the mistake is what stops it repeating: "you missed it" says
 * nothing about why, "you used a comma splice" does.
 */
export function TrapNote({ trap }: { trap: string }) {
  return (
    <div className="mt-3 flex gap-2.5 rounded-lg border border-[#f3dcc4] bg-[#fff8f1] px-3.5 py-2.5">
      <span className="mt-[1px] flex-shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#b4541a]">Trap</span>
      <span className="text-[13px] leading-relaxed text-[#6b3a14]">{trap}</span>
    </div>
  );
}

/**
 * The trap that caught her more than once in one set, if any -- the single
 * most useful thing to take away from a set of misses.
 */
export function topRepeatedTrap(traps: (string | null | undefined)[]): { trap: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const t of traps) if (t) counts.set(t, (counts.get(t) ?? 0) + 1);
  let best: { trap: string; count: number } | null = null;
  for (const [trap, count] of counts) if (count >= 2 && (!best || count > best.count)) best = { trap, count };
  return best;
}

export function TrapToWatch({ trap, count }: { trap: string; count: number }) {
  return (
    <div className="border-t border-[#f2f0fa] px-5 py-3 sm:px-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#b4541a]">
        Trap to watch · caught you {count} times
      </div>
      <div className="mt-1 text-[13.5px] leading-relaxed text-gray-700">{trap}</div>
    </div>
  );
}
