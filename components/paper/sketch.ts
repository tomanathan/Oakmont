// Hand-drawn marks: circles, ticks, crosses and scribbles that look like
// someone drew them, not like geometry. Each is seeded, so a given mark is
// the same shape every render (no wobble on re-render) but two marks side
// by side never match.

export function rng(seed: number) {
  let a = (seed * 2654435761) >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type P = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;

/** A smooth path through points (Catmull-Rom, as cubic Béziers). */
export function smooth(pts: P[]): string {
  if (pts.length < 2) return "";
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/**
 * A loop drawn round something: starts top-left, goes round once and a bit,
 * drifting outward so the ends don't meet, the way a quick pen circle does.
 */
export function loop(cx: number, cy: number, rx: number, ry: number, seed: number): string {
  const r = rng(seed);
  const start = -2.5 + r() * 0.7;
  const sweep = Math.PI * 2 * (1.12 + r() * 0.1);
  const tilt = (r() - 0.5) * 0.25;
  const wob = r() * Math.PI * 2;
  const n = 30;
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = start + sweep * t;
    // a slight egg shape, and the second lap a touch wider
    const k = 1 + 0.045 * Math.sin(a * 2 + wob) + 0.07 * t;
    const x = Math.cos(a) * rx * k;
    const y = Math.sin(a) * ry * k;
    pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
  }
  return smooth(pts);
}

/** A tick: a short stroke down, then a long flick up and right. */
export function tick(w: number, h: number, seed: number): string {
  const r = rng(seed);
  const j = (n: number) => (r() - 0.5) * n;
  return smooth([
    [w * 0.06 + j(2), h * 0.52 + j(2)],
    [w * 0.22, h * 0.68 + j(2)],
    [w * 0.36 + j(1.5), h * 0.92],
    [w * 0.55, h * 0.58 + j(3)],
    [w * 0.78 + j(2), h * 0.26],
    [w * 0.96, h * 0.06 + j(2)],
  ]);
}

/** A cross: two quick strokes (returned separately so they draw in turn). */
export function cross(w: number, h: number, seed: number): [string, string] {
  const r = rng(seed);
  const j = (n: number) => (r() - 0.5) * n;
  return [
    smooth([
      [w * 0.12 + j(3), h * 0.1 + j(3)],
      [w * 0.5 + j(2), h * 0.5 + j(2)],
      [w * 0.9 + j(3), h * 0.9 + j(2)],
    ]),
    smooth([
      [w * 0.86 + j(3), h * 0.12 + j(3)],
      [w * 0.5 + j(2), h * 0.52 + j(2)],
      [w * 0.14 + j(3), h * 0.88 + j(3)],
    ]),
  ];
}

/** A highlighter or pencil stroke along a line, wavering a little. */
export function stroke(w: number, h: number, seed: number, rise = 0): string {
  const r = rng(seed);
  const n = 6;
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([w * (0.01 + 0.98 * t), h / 2 + (r() - 0.5) * h * 0.18 - rise * (t - 0.5)]);
  }
  return smooth(pts);
}

/** A check-box tick sized for a small square. */
export function boxTick(seed: number): string {
  return tick(20, 18, seed);
}
