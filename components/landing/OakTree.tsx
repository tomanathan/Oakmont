// A quiet, illustrated oak for the hero background -- not the logo and not
// a fractal: a tapered trunk with a flared base, a few curving limbs, and a
// broad rounded crown built from overlapping leaf masses, each with its own
// soft shadow underneath and highlight on top, like a storybook drawing.
// Deterministic (seeded), so it renders identically on every request; it's
// a server component and nothing here runs in the browser. Kept pale so it
// never competes with the headline.

const TRUNK = "#cbbda3";
const TRUNK_SHADE = "#b9aa8e";
const LEAF = "#dbe6d2";
const LEAF_SHADE = "#c8d7bd";
const LEAF_LIGHT = "#edf2e6";

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

// A limb as a tapered stroke: a quadratic curve cut into short segments whose
// width shrinks from `w0` to `w1`.
function limb(p0: [number, number], c: [number, number], p1: [number, number], w0: number, w1: number) {
  const segs: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [];
  const N = 10;
  const at = (t: number): [number, number] => [
    (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0],
    (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1],
  ];
  for (let i = 0; i < N; i++) {
    const a = at(i / N);
    const b = at((i + 1) / N);
    segs.push({ x1: r1(a[0]), y1: r1(a[1]), x2: r1(b[0]), y2: r1(b[1]), w: r1(w0 + (w1 - w0) * (i / N)) });
  }
  return segs;
}

interface Cluster {
  circles: { cx: number; cy: number; r: number }[];
}

function grow(seed: number) {
  const rand = rng(seed);
  const j = (n: number) => (rand() - 0.5) * n;

  // The crown: leaf masses arranged in a broad dome, back row first so the
  // front row (lower, nearer) overlaps it.
  const centers: [number, number, number][] = [
    [205, 105, 62],
    [300, 82, 72],
    [398, 104, 64],
    [128, 178, 66],
    [472, 176, 68],
    [250, 160, 82],
    [352, 158, 84],
    [178, 240, 70],
    [300, 222, 86],
    [424, 238, 72],
    [238, 286, 58],
    [364, 286, 60],
  ];
  const clusters: Cluster[] = centers.map(([x, y, r]) => {
    const cx0 = x + j(22);
    const cy0 = y + j(16);
    const rr = r * (0.9 + rand() * 0.2);
    const n = 5 + Math.floor(rand() * 2);
    const circles = [{ cx: r1(cx0), cy: r1(cy0), r: r1(rr * 0.72) }];
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + j(0.6);
      // Flatter underneath, fuller on top, the way a leaf mass hangs.
      const dist = rr * (0.3 + rand() * 0.12);
      circles.push({
        cx: r1(cx0 + Math.cos(ang) * dist),
        cy: r1(cy0 + Math.sin(ang) * dist * (Math.sin(ang) > 0 ? 0.55 : 0.85)),
        r: r1(rr * (0.46 + rand() * 0.12)),
      });
    }
    return { circles };
  });

  // Trunk and limbs, reaching up into the crown.
  const base: [number, number] = [300, 560];
  const fork: [number, number] = [300 + j(10), 340];
  const limbs = [
    ...limb([fork[0], fork[1] + 40], [fork[0] - 30, 290], [190 + j(20), 215 + j(20)], 26, 9),
    ...limb([fork[0], fork[1] + 30], [fork[0] + 34, 285], [418 + j(20), 212 + j(20)], 25, 9),
    ...limb([fork[0], fork[1]], [fork[0] - 6, 260], [302 + j(20), 170], 22, 8),
    ...limb([fork[0] - 18, 300], [150, 280], [128 + j(14), 220], 12, 5),
    ...limb([fork[0] + 20, 298], [452, 282], [474 + j(14), 222], 12, 5),
  ];
  return { clusters, limbs, base, fork };
}

export function OakTree({ className = "", seed = 7 }: { className?: string; seed?: number }) {
  const { clusters, limbs, base, fork } = grow(seed);
  const [bx, by] = base;
  const fx = fork[0];
  // Trunk outline: wide flared roots at the ground, a slight waist, then
  // widening a little again where the limbs leave it.
  const trunk = `M ${bx - 64} ${by} C ${bx - 34} ${by - 8}, ${bx - 26} ${by - 40}, ${bx - 24} ${by - 90}
    L ${fx - 20} 372 C ${fx - 24} 350, ${fx - 34} 336, ${fx - 42} 318 L ${fx + 42} 318
    C ${fx + 34} 336, ${fx + 24} 350, ${fx + 20} 372 L ${bx + 24} ${by - 90}
    C ${bx + 26} ${by - 40}, ${bx + 34} ${by - 8}, ${bx + 64} ${by} Z`;
  const trunkShade = `M ${bx + 6} ${by} C ${bx + 18} ${by - 30}, ${bx + 14} ${by - 70}, ${bx + 12} ${by - 110}
    L ${fx + 10} 360 C ${fx + 14} 348, ${fx + 22} 336, ${fx + 30} 322 L ${fx + 42} 318
    C ${fx + 34} 336, ${fx + 24} 350, ${fx + 20} 372 L ${bx + 24} ${by - 90}
    C ${bx + 26} ${by - 40}, ${bx + 34} ${by - 8}, ${bx + 64} ${by} Z`;

  return (
    <svg className={className} viewBox="0 0 600 560" fill="none" overflow="visible" aria-hidden="true">
      {/* soft ground shadow */}
      <ellipse cx={bx} cy={by - 2} rx={120} ry={9} fill={TRUNK_SHADE} opacity={0.18} />

      {/* limbs, then trunk over their bases */}
      <g stroke={TRUNK} strokeLinecap="round">
        {limbs.map((s, i) => (
          <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} strokeWidth={s.w} />
        ))}
      </g>
      <path d={trunk} fill={TRUNK} />
      <path d={trunkShade} fill={TRUNK_SHADE} opacity={0.55} />

      {/* the crown: each leaf mass gets its own shadow, body and highlight,
          drawn back to front so the masses read as overlapping volumes */}
      {clusters.map((c, i) => (
        <g key={i}>
          {c.circles.map((k, n) => (
            <circle key={`s${n}`} cx={k.cx + 3} cy={k.cy + 9} r={k.r} fill={LEAF_SHADE} />
          ))}
          {c.circles.map((k, n) => (
            <circle key={`b${n}`} cx={k.cx} cy={k.cy} r={k.r} fill={LEAF} />
          ))}
          {/* one soft highlight, upper left, where the light falls */}
          <circle cx={c.circles[0].cx - c.circles[0].r * 0.3} cy={c.circles[0].cy - c.circles[0].r * 0.35} r={c.circles[0].r * 0.62} fill={LEAF_LIGHT} opacity={0.55} />
        </g>
      ))}
    </svg>
  );
}
