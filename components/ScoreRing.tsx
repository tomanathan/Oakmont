"use client";

import { useCountUp } from "./CountUp";

/** Score as a filling ring with the percentage counting up in the middle. */
export function ScoreRing({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const shown = useCountUp(pct, 900);
  const r = 34;
  const c = 2 * Math.PI * r;
  const color = pct === 100 ? "#c9971b" : pct >= 50 ? "#2f6f4f" : "#6d7fd6";
  return (
    <div className="relative h-[88px] w-[88px] flex-shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f0eff9" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[22px] font-semibold leading-none text-ink tabular-nums">{shown}%</span>
        <span className="mt-1 text-[11px] text-gray-400 tabular-nums">
          {score}/{total}
        </span>
      </div>
    </div>
  );
}
