import type { Axis, FigureSpec } from "@/lib/figureTypes";
import { PlaneFigure, SolidShape } from "./PlaneFigure";

// Drawn to scale from the figure's data (see lib/figureTypes.ts). Colors
// follow the geometry diagrams: ink strokes, a quiet grid, one accent.
const INK = "#383a30";
const GRID = "#e9e6f3";
const MUTED = "#8f887a";
const POINT = "#5b6fd0";
const LINE = "#b5602f";
const BAR = "#c9d8c2";
const DOT_R = 5;

const W = 360;
const H = 250;
const M = { top: 12, right: 14, bottom: 46, left: 52 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;

function ticks(a: Axis): number[] {
  const n = Math.round((a.max - a.min) / a.step);
  return Array.from({ length: n + 1 }, (_, i) => +(a.min + i * a.step).toFixed(6));
}

// 1200 -> "1,200"; 2.50 -> "2.5"; plain: 2016 -> "2016"
function fmt(v: number, plain = false): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: 4, useGrouping: !plain });
}

function scaleX(a: Axis) {
  return (v: number) => M.left + ((v - a.min) / (a.max - a.min)) * PW;
}
function scaleY(a: Axis) {
  return (v: number) => M.top + PH - ((v - a.min) / (a.max - a.min)) * PH;
}

function YAxis({ a, grid = true }: { a: Axis; grid?: boolean }) {
  const sy = scaleY(a);
  return (
    <g>
      {ticks(a).map((t) => (
        <g key={t}>
          {grid && <line x1={M.left} x2={M.left + PW} y1={sy(t)} y2={sy(t)} stroke={GRID} />}
          <text x={M.left - 7} y={sy(t) + 4} fontSize={11} textAnchor="end" fill={MUTED}>
            {fmt(t, a.plain)}
          </text>
        </g>
      ))}
      <line x1={M.left} x2={M.left} y1={M.top} y2={M.top + PH} stroke={INK} strokeWidth={1.25} />
      <text
        transform={`translate(13 ${M.top + PH / 2}) rotate(-90)`}
        fontSize={11.5}
        textAnchor="middle"
        fill={INK}
        fontWeight={600}
      >
        {a.label}
      </text>
    </g>
  );
}

function XAxis({ a, grid = true }: { a: Axis; grid?: boolean }) {
  const sx = scaleX(a);
  return (
    <g>
      {ticks(a).map((t) => (
        <g key={t}>
          {grid && <line x1={sx(t)} x2={sx(t)} y1={M.top} y2={M.top + PH} stroke={GRID} />}
          <text x={sx(t)} y={M.top + PH + 16} fontSize={11} textAnchor="middle" fill={MUTED}>
            {fmt(t, a.plain)}
          </text>
        </g>
      ))}
      <line x1={M.left} x2={M.left + PW} y1={M.top + PH} y2={M.top + PH} stroke={INK} strokeWidth={1.25} />
      <XLabel text={a.label} />
    </g>
  );
}

function XLabel({ text }: { text: string }) {
  return (
    <text x={M.left + PW / 2} y={H - 6} fontSize={11.5} textAnchor="middle" fill={INK} fontWeight={600}>
      {text}
    </text>
  );
}

function Scatter({ spec }: { spec: Extract<FigureSpec, { kind: "scatter" }> }) {
  const sx = scaleX(spec.x);
  const sy = scaleY(spec.y);
  const line = spec.line;
  return (
    <>
      <defs>
        <clipPath id="plot-area">
          <rect x={M.left} y={M.top} width={PW} height={PH} />
        </clipPath>
      </defs>
      <YAxis a={spec.y} />
      <XAxis a={spec.x} />
      {line && (
        <line
          clipPath="url(#plot-area)"
          x1={sx(spec.x.min)}
          y1={sy(line.slope * spec.x.min + line.intercept)}
          x2={sx(spec.x.max)}
          y2={sy(line.slope * spec.x.max + line.intercept)}
          stroke={LINE}
          strokeWidth={2}
        />
      )}
      {spec.connect && (
        <polyline
          points={spec.points.map(([px, py]) => `${sx(px)},${sy(py)}`).join(" ")}
          fill="none"
          stroke={POINT}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}
      {spec.points.map(([px, py], i) => (
        <circle key={i} cx={sx(px)} cy={sy(py)} r={3.6} fill={POINT} stroke="#fff" strokeWidth={1} />
      ))}
    </>
  );
}

function Bars({ spec }: { spec: Extract<FigureSpec, { kind: "bar" }> }) {
  const sy = scaleY(spec.y);
  const slot = PW / spec.bars.length;
  const bw = Math.min(46, slot * 0.6);
  return (
    <>
      <YAxis a={spec.y} />
      {spec.bars.map((b, i) => {
        const cx = M.left + slot * (i + 0.5);
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y={sy(b.value)} width={bw} height={sy(spec.y.min) - sy(b.value)} fill={BAR} stroke={INK} strokeWidth={1} />
            <text x={cx} y={M.top + PH + 16} fontSize={11} textAnchor="middle" fill={MUTED}>
              {b.label}
            </text>
          </g>
        );
      })}
      <line x1={M.left} x2={M.left + PW} y1={M.top + PH} y2={M.top + PH} stroke={INK} strokeWidth={1.25} />
      <XLabel text={spec.xLabel} />
    </>
  );
}

function Histogram({ spec }: { spec: Extract<FigureSpec, { kind: "histogram" }> }) {
  const sx = scaleX(spec.x);
  const sy = scaleY(spec.y);
  return (
    <>
      <YAxis a={spec.y} />
      {spec.bins.map((b, i) => (
        <rect
          key={i}
          x={sx(b.from)}
          y={sy(b.count)}
          width={sx(b.to) - sx(b.from)}
          height={sy(spec.y.min) - sy(b.count)}
          fill={BAR}
          stroke={INK}
          strokeWidth={1}
        />
      ))}
      <XAxis a={spec.x} grid={false} />
    </>
  );
}

function DotPlot({ spec }: { spec: Extract<FigureSpec, { kind: "dotplot" }> }) {
  const sx = scaleX(spec.x);
  const base = M.top + PH;
  const counts = new Map<number, number>();
  const dots = spec.values.map((v) => {
    const k = (counts.get(v) ?? 0) + 1;
    counts.set(v, k);
    return { v, k };
  });
  const r = DOT_R;
  return (
    <>
      <XAxis a={spec.x} grid={false} />
      {dots.map(({ v, k }, i) => (
        <circle key={i} cx={sx(v)} cy={base - 4 - r - (k - 1) * (2 * r + 3)} r={r} fill={POINT} />
      ))}
    </>
  );
}

function describe(spec: FigureSpec): string {
  switch (spec.kind) {
    case "table":
      return `Table: ${spec.header.join(", ")}. ` + spec.rows.map((r) => r.join(", ")).join("; ");
    case "scatter":
      return (
        `Scatterplot of ${spec.y.label} against ${spec.x.label}: ` +
        spec.points.map(([x, y]) => `(${fmt(x)}, ${fmt(y)})`).join(", ") +
        (spec.line ? `. Line of best fit y = ${fmt(spec.line.slope)}x + ${fmt(spec.line.intercept)}.` : ".")
      );
    case "bar":
      return `Bar graph of ${spec.y.label} by ${spec.xLabel}: ` + spec.bars.map((b) => `${b.label}: ${fmt(b.value)}`).join(", ");
    case "histogram":
      return `Histogram of ${spec.x.label}: ` + spec.bins.map((b) => `${fmt(b.from)} to ${fmt(b.to)}: ${b.count}`).join(", ");
    case "dotplot":
      return `Dot plot of ${spec.x.label}: ` + spec.values.map((v) => fmt(v)).join(", ");
    default:
      return "";
  }
}

// A dot plot only needs as much height as its tallest stack, so crop the
// empty plot area above it instead of leaving a mostly blank figure.
function viewBox(spec: FigureSpec): string {
  if (spec.kind !== "dotplot") return `0 0 ${W} ${H}`;
  const tallest = Math.max(1, ...Array.from(new Set(spec.values)).map((v) => spec.values.filter((u) => u === v).length));
  const top = Math.max(0, M.top + PH - 4 - tallest * (2 * DOT_R + 3) - 14);
  return `0 ${top} ${W} ${H - top}`;
}

export function QuestionFigure({ spec }: { spec: FigureSpec }) {
  return (
    <figure className="my-1 rounded-lg border border-[#ebe3d3] bg-[#f8f4eb] px-3 py-3">
      {spec.title && (
        <figcaption className="mb-2 text-center text-[12.5px] font-semibold text-ink">{spec.title}</figcaption>
      )}
      {spec.kind === "geometry" ? (
        <PlaneFigure spec={spec} />
      ) : spec.kind === "solid" ? (
        <SolidShape spec={spec} />
      ) : spec.kind === "table" ? (
        <div className="overflow-x-auto">
          <table className="mx-auto border-collapse text-[13px] tabular-nums text-ink">
            <thead>
              <tr>
                {spec.header.map((h, i) => (
                  <th key={i} className="border border-[#dcd8ec] bg-[#f3f1fa] px-3 py-1.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spec.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`border border-[#dcd8ec] bg-white px-3 py-1.5 text-center ${ci === 0 ? "font-medium" : ""}`}
                    >
                      {typeof cell === "number" ? fmt(cell) : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <svg
          viewBox={viewBox(spec)}
          className="mx-auto h-auto w-full max-w-[400px] font-[inherit] tabular-nums"
          role="img"
          aria-label={describe(spec)}
        >
          {spec.kind === "scatter" && <Scatter spec={spec} />}
          {spec.kind === "bar" && <Bars spec={spec} />}
          {spec.kind === "histogram" && <Histogram spec={spec} />}
          {spec.kind === "dotplot" && <DotPlot spec={spec} />}
        </svg>
      )}
    </figure>
  );
}
