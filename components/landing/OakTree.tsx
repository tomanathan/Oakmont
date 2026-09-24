// A quiet, drawn oak for the hero background -- not the logo, just a tree.
// Grown from a fixed seed so it renders identically on every request (it's
// a server component; nothing here runs in the browser). Thin taupe
// branches, a canopy of soft pastel leaf dabs, all kept pale so it never
// competes with the headline.

type Line = { x1: number; y1: number; x2: number; y2: number; w: number };
type Leaf = { cx: number; cy: number; r: number; fill: string };

const LEAF_FILLS = ["#d9e6d1", "#d9e6d1", "#cfdfc6", "#e4ecdd", "#f3e9c6", "#f2ddd7"];

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function grow(seed: number) {
  const rand = rng(seed);
  const lines: Line[] = [];
  const leaves: Leaf[] = [];
  const r1 = (n: number) => Math.round(n * 10) / 10;

  function branch(x: number, y: number, angle: number, len: number, depth: number) {
    const x2 = x + Math.cos(angle) * len;
    const y2 = y - Math.sin(angle) * len;
    lines.push({ x1: r1(x), y1: r1(y), x2: r1(x2), y2: r1(y2), w: r1(Math.max(0.6, depth * 0.95)) });
    if (depth <= 2) {
      const n = depth === 0 ? 4 : 2;
      for (let i = 0; i < n; i++) {
        leaves.push({
          cx: r1(x2 + (rand() - 0.5) * 34),
          cy: r1(y2 + (rand() - 0.5) * 26),
          r: r1(9 + rand() * 11),
          fill: LEAF_FILLS[Math.floor(rand() * LEAF_FILLS.length)],
        });
      }
    }
    if (depth === 0) return;
    // Oaks spread wide rather than tall: generous angles, slow taper.
    const kids = depth > 4 ? 2 : rand() < 0.35 ? 3 : 2;
    for (let i = 0; i < kids; i++) {
      const spread = 0.35 + rand() * 0.45;
      const dir = kids === 3 ? (i - 1) * spread : (i === 0 ? -1 : 1) * spread;
      branch(x2, y2, angle + dir + (rand() - 0.5) * 0.2, len * (0.72 + rand() * 0.12), depth - 1);
    }
  }

  branch(300, 560, Math.PI / 2, 130, 7);
  return { lines, leaves };
}

export function OakTree({ className = "", seed = 7 }: { className?: string; seed?: number }) {
  const { lines, leaves } = grow(seed);
  return (
    <svg className={className} viewBox="0 0 600 560" fill="none" overflow="visible" aria-hidden="true">
      <g stroke="#cdc1aa" strokeLinecap="round">
        {lines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth={l.w} />
        ))}
      </g>
      <g opacity={0.7}>
        {leaves.map((l, i) => (
          <circle key={i} cx={l.cx} cy={l.cy} r={l.r} fill={l.fill} />
        ))}
      </g>
    </svg>
  );
}
