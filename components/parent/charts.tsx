"use client";

import { useState } from "react";
import type { DayCell, WeekPoint } from "@/lib/parentInsights";

// Small SVG charts for the parent report. Drawn from the report's own
// numbers, no chart library.

const INK = "#1a1a2e";
const GRID = "#ece9f7";
const MUTED = "#8a8499";
const GREEN = "#2f6f4f";

function fmtDay(key: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

// ---- 12-week activity calendar ------------------------------------------------

const CAL_LEVELS = ["#f1eff8", "#cfe3d7", "#9cc8ae", "#5f9f7b", GREEN];

function level(minutes: number): number {
  if (minutes <= 0) return 0;
  if (minutes < 10) return 1;
  if (minutes < 25) return 2;
  if (minutes < 45) return 3;
  return 4;
}

export function ActivityCalendar({ days }: { days: DayCell[] }) {
  const [hover, setHover] = useState<DayCell | null>(null);
  // Columns are Monday-start weeks; pad the front so the first column
  // starts on a Monday.
  const first = days[0];
  const [y, m, d] = first.day.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const pad = (wd + 6) % 7;
  const cells: (DayCell | null)[] = [...Array(pad).fill(null), ...days];
  const weeks: (DayCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const size = 13;
  const gap = 3;
  const w = weeks.length * (size + gap) + 26;
  const h = 7 * (size + gap) + 18;
  // A month label over the first column that starts in a new month.
  const monthMarks: { x: number; label: string }[] = [];
  let lastMonth = "";
  weeks.forEach((col, i) => {
    const firstReal = col.find((c) => c);
    if (!firstReal) return;
    const month = firstReal.day.slice(0, 7);
    if (month !== lastMonth) {
      if (lastMonth || Number(firstReal.day.slice(8)) <= 7) monthMarks.push({ x: 26 + i * (size + gap), label: fmtDay(firstReal.day, { month: "short" }) });
      lastMonth = month;
    }
  });
  const total = days.reduce((s, c) => s + c.minutes, 0);
  const active = days.filter((c) => c.minutes > 0 || c.questions > 0).length;

  return (
    <div>
      <div className="overflow-x-auto">
        <svg width={w} height={h} role="img" aria-label={`Study calendar: ${active} active days and ${total} minutes over 12 weeks`}>
          {monthMarks.map((mk) => (
            <text key={mk.x} x={mk.x} y={10} fontSize={10} fill={MUTED}>
              {mk.label}
            </text>
          ))}
          {["Mon", "Wed", "Fri"].map((lbl, i) => (
            <text key={lbl} x={0} y={18 + (i * 2 + 0) * (size + gap) + size - 3} fontSize={9} fill={MUTED}>
              {lbl}
            </text>
          ))}
          {weeks.map((col, ci) =>
            col.map((c, ri) =>
              c ? (
                <rect
                  key={c.day}
                  x={26 + ci * (size + gap)}
                  y={16 + ri * (size + gap)}
                  width={size}
                  height={size}
                  rx={3}
                  fill={CAL_LEVELS[level(c.minutes)]}
                  stroke={hover?.day === c.day ? INK : "none"}
                  onMouseEnter={() => setHover(c)}
                  onMouseLeave={() => setHover(null)}
                />
              ) : null
            )
          )}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-gray-500">
        <span className="min-h-[18px]">
          {hover
            ? `${fmtDay(hover.day, { weekday: "short", month: "short", day: "numeric" })}: ${hover.minutes ? `${hover.minutes} min` : "no study"}${hover.questions ? `, ${hover.questions} questions` : ""}`
            : `${active} active days, ${Math.round(total / 60)} hours total in 12 weeks`}
        </span>
        <span className="flex items-center gap-1">
          Less
          {CAL_LEVELS.map((c) => (
            <span key={c} className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: c }} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}

// ---- weekly minutes (bars) with accuracy (line) --------------------------------

export function WeeklyTrend({ weeks }: { weeks: WeekPoint[] }) {
  const W = 520;
  const H = 198;
  const L = 34;
  const R = 34;
  const T = 26;
  const B = 28;
  const pw = W - L - R;
  const ph = H - T - B;
  const maxMin = Math.max(30, ...weeks.map((w) => w.minutes));
  const niceMax = Math.ceil(maxMin / 30) * 30;
  const slot = pw / weeks.length;
  const bw = Math.min(34, slot * 0.55);
  const yMin = (v: number) => T + ph - (v / niceMax) * ph;
  const yAcc = (v: number) => T + ph - (v / 100) * ph;
  const accPts = weeks
    .map((w, i) => (w.accuracy === null ? null : [L + slot * (i + 0.5), yAcc(w.accuracy)] as const))
    .filter((p): p is readonly [number, number] => p !== null);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Study minutes and accuracy by week">
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={L} x2={W - R} y1={T + ph * (1 - f)} y2={T + ph * (1 - f)} stroke={GRID} />
          <text x={L - 6} y={T + ph * (1 - f) + 3.5} fontSize={10} fill={MUTED} textAnchor="end">
            {Math.round(niceMax * f)}
          </text>
          <text x={W - R + 6} y={T + ph * (1 - f) + 3.5} fontSize={10} fill={MUTED}>
            {Math.round(100 * f)}%
          </text>
        </g>
      ))}
      {weeks.map((w, i) => {
        const x = L + slot * (i + 0.5);
        return (
          <g key={w.weekStart}>
            <rect x={x - bw / 2} y={yMin(w.minutes)} width={bw} height={T + ph - yMin(w.minutes)} rx={4} fill={i === weeks.length - 1 ? "#6d7fd6" : "#c5cbef"}>
              <title>{`Week of ${fmtDay(w.weekStart)}: ${w.minutes} min, ${w.questions} questions${w.accuracy !== null ? `, ${w.accuracy}% correct` : ""}, ${w.activeDays} active days`}</title>
            </rect>
            <text x={x} y={H - 10} fontSize={10} fill={MUTED} textAnchor="middle">
              {i === weeks.length - 1 ? "This wk" : fmtDay(w.weekStart)}
            </text>
          </g>
        );
      })}
      {accPts.length > 1 && (
        <polyline points={accPts.map((p) => p.join(",")).join(" ")} fill="none" stroke={GREEN} strokeWidth={2} strokeLinejoin="round" />
      )}
      {accPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3.2} fill="#fff" stroke={GREEN} strokeWidth={2} />
      ))}
      <text x={L} y={10} fontSize={10} fill={MUTED}>
        minutes
      </text>
      <text x={W - R + 34} y={10} fontSize={10} fill={GREEN} textAnchor="end">
        accuracy
      </text>
    </svg>
  );
}

// ---- practice-test scores against the goal -------------------------------------

export function ScoreTrend({
  tests,
  baseline,
  goal,
}: {
  tests: { takenAt: string; composite: number }[];
  baseline: number | null;
  goal: number | null;
}) {
  const W = 520;
  const H = 200;
  const L = 40;
  const R = 16;
  const T = 16;
  const B = 28;
  const pw = W - L - R;
  const ph = H - T - B;
  const vals = [...tests.map((t) => t.composite), ...(baseline ? [baseline] : []), ...(goal ? [goal] : [])];
  const lo = Math.max(400, Math.floor((Math.min(...vals) - 60) / 100) * 100);
  const hi = Math.min(1600, Math.ceil((Math.max(...vals) + 60) / 100) * 100);
  const y = (v: number) => T + ph - ((v - lo) / (hi - lo)) * ph;
  const n = tests.length;
  const inset = 28; // keeps the first and last points (and their labels) off the axes
  const x = (i: number) => (n === 1 ? L + pw / 2 : L + inset + (i / (n - 1)) * (pw - inset * 2));
  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += 100) ticks.push(v);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Practice test scores over time">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={GRID} />
          <text x={L - 6} y={y(v) + 3.5} fontSize={10} fill={MUTED} textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      {goal && (
        <g>
          <line x1={L} x2={W - R} y1={y(goal)} y2={y(goal)} stroke={GREEN} strokeDasharray="5 4" strokeWidth={1.5} />
          <text x={W - R} y={y(goal) - 5} fontSize={10.5} fill={GREEN} textAnchor="end" fontWeight={600}>
            Goal {goal}
          </text>
        </g>
      )}
      {baseline && (
        <g>
          <line x1={L} x2={W - R} y1={y(baseline)} y2={y(baseline)} stroke={MUTED} strokeDasharray="2 4" />
          <text x={L + 4} y={y(baseline) - 5} fontSize={10.5} fill={MUTED}>
            Starting point {baseline}
          </text>
        </g>
      )}
      {n > 1 && (
        <polyline points={tests.map((t, i) => `${x(i)},${y(t.composite)}`).join(" ")} fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      )}
      {tests.map((t, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(t.composite)} r={4} fill={INK} />
          <text x={x(i)} y={y(t.composite) - 8} fontSize={10.5} fill={INK} textAnchor="middle" fontWeight={600}>
            {t.composite}
          </text>
          <text x={x(i)} y={H - 10} fontSize={10} fill={MUTED} textAnchor="middle">
            {new Date(t.takenAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---- a 0-100 bar ------------------------------------------------------------------

export function PctBar({ value, color = GREEN, track = "#f1eff8" }: { value: number | null; color?: string; track?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: track }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value ?? 0}%`, background: color }} />
    </div>
  );
}
