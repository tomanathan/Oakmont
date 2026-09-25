"use client";

import { useEffect, useState } from "react";

const HIDE_KEY = "oakmont:pace-clock-hidden";

export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.round(total));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function readHidden(): boolean {
  try {
    return window.localStorage.getItem(HIDE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * A quiet clock against the real SAT's pace. It never stops her or takes
 * anything away -- practicing at test speed is the point, and a clock
 * that punished would teach rushing instead. Past the target it turns
 * amber and keeps counting. Hideable (remembered on this device).
 *
 * `elapsed` is seconds spent so far; `target` is the seconds the SAT
 * allows for the same amount of work.
 */
export function PaceClock({ elapsed, target, label }: { elapsed: number; target: number; label: string }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => setHidden(readHidden()), []);
  function toggle() {
    const next = !hidden;
    setHidden(next);
    try {
      window.localStorage.setItem(HIDE_KEY, next ? "1" : "0");
    } catch {
      // private mode: the choice just won't persist
    }
  }

  if (hidden) {
    return (
      <button onClick={toggle} className="text-[11.5px] font-medium text-stone-400 transition-colors hover:text-ink">
        Show clock
      </button>
    );
  }
  const over = elapsed > target;
  const pct = Math.min(100, (elapsed / Math.max(1, target)) * 100);
  return (
    <div className="flex items-center gap-2.5" title={`SAT pace for this: ${formatSeconds(target)}`}>
      <div className="flex flex-col items-end leading-none">
        <span className={`text-[13px] font-semibold tabular-nums ${over ? "text-[#b4541a]" : "text-ink"}`}>
          {formatSeconds(elapsed)}
          <span className="font-normal text-stone-400"> / {formatSeconds(target)}</span>
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.08em] text-stone-400">{label}</span>
      </div>
      <div className="flex h-7 w-1.5 flex-col justify-end overflow-hidden rounded-full bg-[#eef3e9]" aria-hidden>
        <div
          className={`w-full rounded-full transition-[height] duration-700 ${over ? "bg-[#e07a3a]" : "bg-[#587356]"}`}
          style={{ height: `${pct}%` }}
        />
      </div>
      <button
        onClick={toggle}
        aria-label="Hide clock"
        className="flex h-6 w-6 items-center justify-center rounded-md text-stone-300 transition-colors hover:bg-[#f5f0e5] hover:text-stone-500"
      >
        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/** Seconds since `since` (ms timestamp), ticking once a second while `running`. */
export function useElapsed(since: number | null, running: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running, since]);
  return since === null ? 0 : Math.max(0, (now - since) / 1000);
}
