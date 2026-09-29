// Art for the notebook homepage, printed the riso way: a flat colour layer
// knocked slightly off-register (down-right) with the ultramarine ink line
// on top in the true position. Ported from the approved "Ozho's Notebook"
// prototype; only the pieces the homepage uses.
//
// Colour rule: hot pink is the primary-action colour, so no art uses it.

import type { CSSProperties } from "react";

export const C = {
  ink: "#2A2FE0",
  inkDeep: "#1D22A8",
  paper: "#FFFCF1",
  butter: "#FFEE7C",
  cyan: "#4FE6F2",
  lilac: "#C8B4FF",
  tangerine: "#FF9A4D",
};

const SANS = "var(--font-ui), system-ui, sans-serif";
const SERIF = "var(--font-display), Georgia, serif";

const rr = (x: number, y: number, w: number, h: number, r = 0) =>
  r <= 0
    ? `M${x} ${y}H${x + w}V${y + h}H${x}Z`
    : `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${
        y + h - r
      }V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;

const OFF = "translate(3 2.6)";

/** One riso shape: paper knockout, off-register colour, true ink line. */
function RS({ d, fill, t, sw = 2.3 }: { d: string; fill: string; t?: string; sw?: number }) {
  return (
    <g transform={t}>
      <path d={d} fill={C.paper} />
      <path d={d} fill={fill} transform={OFF} />
      <path d={d} fill="none" stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
}

export function Sparkle({ color = C.butter, size = 24 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="-2 -2 28 28" width={size} height={size} overflow="visible" style={{ display: "block" }} aria-hidden>
      <RS d="M12 0Q13 11 24 12Q13 13 12 24Q11 13 0 12Q11 11 12 0Z" fill={color} sw={1.6} />
    </svg>
  );
}

/* ------------------------------------------------------------ Ozho's room props */

const KIBBLE: [number, number, string][] = [
  [62, 44, C.tangerine], [82, 38, C.butter], [102, 35, C.tangerine], [122, 37, C.butter], [142, 41, C.tangerine], [158, 46, C.butter],
  [72, 32, C.butter], [94, 27, C.tangerine], [114, 25, C.butter], [134, 29, C.tangerine], [88, 19, C.tangerine], [110, 15, C.butter], [128, 19, C.tangerine],
];

/** Ozho's bowl, heaped with kibble. */
export function Bowl() {
  return (
    <svg viewBox="-4 -4 228 128" width="100%" height="100%" overflow="visible" aria-hidden>
      <RS d={ell(110, 52, 96, 16)} fill={C.lilac} />
      {KIBBLE.map(([x, y, f], i) => (
        <RS key={i} d={ell(x, y + 6, 8, 6)} fill={f} sw={1.7} />
      ))}
      <RS d="M14 52Q110 78 206 52L188 108Q110 122 32 108Z" fill={C.cyan} sw={2.6} />
      <text x={110} y={98} textAnchor="middle" style={{ fontFamily: SERIF }} fontSize={22} fontWeight={800} fill={C.ink} letterSpacing={2}>
        OZHO
      </text>
    </svg>
  );
}

/** The view through the doorway: sky, a hill, and a blobby oak. */
export function DoorView() {
  return (
    <svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" aria-hidden>
      <rect width={200} height={300} fill="#A9F1F7" />
      <circle cx={150} cy={70} r={22} fill={C.butter} stroke={C.ink} strokeWidth={3} />
      <path d="M20 60 q10 -14 24 -6 q12 -10 22 4 q10 2 6 10 h-56 q-6 -6 4 -8 z" fill={C.paper} stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M-10 210 Q60 170 120 196 T220 190 V300 H-10 Z" fill={C.lilac} stroke={C.ink} strokeWidth={3} />
      <rect x={58} y={150} width={22} height={62} rx={8} fill={C.tangerine} stroke={C.ink} strokeWidth={3} />
      <path d="M22 140 q-10 -40 30 -52 q14 -34 50 -14 q40 -2 32 38 q20 26 -12 40 q-20 20 -46 6 q-40 12 -54 -18 z" fill={C.cyan} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={62} cy={110} r={5} fill={C.tangerine} stroke={C.ink} strokeWidth={1.5} />
      <circle cx={96} cy={96} r={5} fill={C.tangerine} stroke={C.ink} strokeWidth={1.5} />
      <circle cx={104} cy={132} r={5} fill={C.tangerine} stroke={C.ink} strokeWidth={1.5} />
    </svg>
  );
}

export function Shelf() {
  return (
    <svg viewBox="0 0 220 110" width="100%" height="100%" overflow="visible" aria-hidden>
      <RS d={rr(18, 34, 46, 56, 14)} fill={C.tangerine} />
      <RS d={rr(22, 24, 38, 14, 5)} fill={C.butter} />
      <text x={41} y={68} textAnchor="middle" style={{ fontFamily: SANS }} fontWeight={700} fontSize={10} fill={C.ink}>
        kibble
      </text>
      <RS d={rr(80, 44, 40, 46, 12)} fill={C.lilac} />
      <RS d={rr(84, 34, 32, 13, 5)} fill={C.cyan} />
      <RS d="M140 38 H184 V52 Q184 74 162 74 Q140 74 140 52 Z" fill={C.butter} />
      <path d="M140 44 Q128 44 130 56 Q132 64 142 62 M184 44 Q196 44 194 56 Q192 64 182 62" fill="none" stroke={C.ink} strokeWidth={2.3} />
      <RS d={rr(156, 74, 12, 8, 1)} fill={C.butter} />
      <RS d={rr(146, 82, 32, 8, 3)} fill={C.cyan} />
      <RS d={rr(4, 90, 212, 12, 6)} fill={C.tangerine} />
    </svg>
  );
}

export function Bunting() {
  const colors = [C.cyan, C.butter, C.lilac, C.tangerine, C.cyan, C.butter, C.lilac];
  return (
    <svg viewBox="0 0 420 60" width="100%" height="100%" preserveAspectRatio="none" aria-hidden>
      <path d="M0 6 Q210 34 420 6" fill="none" stroke={C.ink} strokeWidth={2.5} />
      {colors.map((c, i) => {
        const x = 20 + i * 58;
        const t = x / 420;
        const y = 6 + 4 * 28 * t * (1 - t);
        return <RS key={i} d={`M${x} ${y} L${x + 38} ${y + 1} L${x + 19} ${y + 34} Z`} fill={c} sw={2.2} />;
      })}
    </svg>
  );
}

export function Plant() {
  return (
    <svg viewBox="0 0 110 150" width="100%" height="100%" overflow="visible" aria-hidden>
      <RS d="M55 92 C30 70 18 44 30 24 C44 40 52 62 55 92 Z" fill={C.cyan} />
      <RS d="M55 92 C70 60 88 44 100 40 C98 64 80 84 55 92 Z" fill={C.cyan} />
      <RS d="M55 92 C50 60 56 30 64 10 C74 34 66 66 55 92 Z" fill={C.lilac} />
      <RS d="M24 90 H86 L78 144 H32 Z" fill={C.tangerine} />
      <RS d={rr(18, 84, 74, 14, 6)} fill={C.butter} />
    </svg>
  );
}

export function Ball() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" overflow="visible" aria-hidden>
      <RS d={ell(30, 30, 24, 24)} fill={C.butter} />
      <path d="M10 18 Q30 30 12 44 M50 16 Q30 30 48 44" fill="none" stroke={C.ink} strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  );
}

/** Washi tape strip with torn zig-zag ends (world and reward pieces only). */
export function Tape({ color = C.butter, pattern = "stripe", className, style }: { color?: string; pattern?: "stripe" | "dots" | "grid"; className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={`nb-tape nb-tape--${pattern} ${className ?? ""}`} style={{ ...style, ["--tape" as string]: color }} />;
}

/** A doodled arrow, drawn in once. */
export function DoodleArrow({ w = 90, className }: { w?: number; className?: string }) {
  return (
    <svg viewBox="0 0 130 100" width={w} className={className} aria-hidden>
      <g fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <path pathLength={1} className="nb-draw" d="M8 12 C 40 -2, 70 8, 82 34 S 96 78, 118 86" />
        <path pathLength={1} className="nb-draw nb-draw--late" d="M98 84 L119 87 L112 66" />
      </g>
    </svg>
  );
}

/** A scribbled underline for section titles. Static below the fold. */
export function Scribble({ w = 220, className }: { w?: number; className?: string }) {
  return (
    <svg viewBox="0 0 300 22" width={w} preserveAspectRatio="none" className={className} aria-hidden>
      <path d="M4 12 C 50 4, 110 18, 160 9 S 250 6, 296 10" fill="none" stroke={C.ink} strokeWidth={3.5} strokeLinecap="round" />
    </svg>
  );
}

/** A small check mark for lists. */
export function Tick() {
  return (
    <svg width="16" height="16" viewBox="0 0 12 12" aria-hidden className="nb-tick">
      <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
