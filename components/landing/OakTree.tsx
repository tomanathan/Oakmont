// The title page's trees, drawn in the same language as the Oakmont mark --
// flat single-tone silhouettes, sinuous tapering limbs that end in little
// curls, almond-shaped leaves set along the twigs, roots that flow out and
// curl at the tips -- but as a free-standing, asymmetric oak planted on the
// ground rather than the mark's closed circle of knotwork, so the two read
// as related without the logo simply being repeated.
//
// The trunk base sits exactly on the bottom edge of the viewBox, so the
// caller can plant it on a ground line by positioning the SVG's bottom.
// Seeded, so it renders the same on every request (server component).

const BARK = "#cdc3af";
const LEAF_TONES = ["#c9d8bd", "#bccdb0", "#d5e1ca", "#c3d4b6"];

type P = [number, number];

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => Math.round(n * 10) / 10;

// Point and tangent on a cubic Bezier.
function bez(p0: P, c1: P, c2: P, p1: P, t: number): { p: P; d: P } {
  const u = 1 - t;
  const p: P = [
    u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
    u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1],
  ];
  const d: P = [
    3 * u * u * (c1[0] - p0[0]) + 6 * u * t * (c2[0] - c1[0]) + 3 * t * t * (p1[0] - c2[0]),
    3 * u * u * (c1[1] - p0[1]) + 6 * u * t * (c2[1] - c1[1]) + 3 * t * t * (p1[1] - c2[1]),
  ];
  return { p, d };
}

// A limb as one filled, tapered shape along a curve -- the flat, carved look
// of the mark's branches, rather than a stroked line.
function taper(p0: P, c1: P, c2: P, p1: P, w0: number, w1: number): string {
  const N = 18;
  const left: P[] = [];
  const right: P[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const { p, d } = bez(p0, c1, c2, p1, t);
    const len = Math.hypot(d[0], d[1]) || 1;
    const nx = -d[1] / len;
    const ny = d[0] / len;
    const w = (w0 + (w1 - w0) * Math.pow(t, 0.8)) / 2;
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
  }
  const pts = [...left, ...right.reverse()];
  return `M ${pts.map((q) => `${f(q[0])} ${f(q[1])}`).join(" L ")} Z`;
}

interface Leaf {
  x: number;
  y: number;
  rot: number;
  len: number;
  fill: string;
}

function grow(seed: number) {
  const rand = rng(seed);
  const j = (n: number) => (rand() - 0.5) * n;
  const limbs: string[] = [];
  const leaves: Leaf[] = [];

  const leafAt = (p: P, deg: number, len: number) =>
    leaves.push({ x: f(p[0]), y: f(p[1]), rot: f(deg), len: f(len), fill: LEAF_TONES[Math.floor(rand() * LEAF_TONES.length)] });

  // A branch from `start` heading `angle` (0 = right, -PI/2 = up), `len`
  // long, bending by `bend` along the way, `w` wide at the base.
  function branch(start: P, angle: number, len: number, bend: number, w: number, depth: number) {
    const a1 = angle + bend * 0.35;
    const a2 = angle + bend;
    const p1: P = [start[0] + Math.cos(angle + bend * 0.55) * len, start[1] + Math.sin(angle + bend * 0.55) * len];
    const c1: P = [start[0] + Math.cos(a1) * len * 0.4, start[1] + Math.sin(a1) * len * 0.4];
    const c2: P = [p1[0] - Math.cos(a2) * len * 0.35, p1[1] - Math.sin(a2) * len * 0.35];
    const terminal = depth >= 3;
    limbs.push(taper(start, c1, c2, p1, w, terminal ? 1.2 : w * 0.45));

    if (terminal) {
      // A small curl at the tip, like the mark's, and almond leaves in
      // alternating pairs along the twig's outer part.
      const curlDir = bend >= 0 ? 1 : -1;
      const cl = len * 0.26;
      const q1: P = [p1[0] + Math.cos(a2 + curlDir * 1.3) * cl, p1[1] + Math.sin(a2 + curlDir * 1.3) * cl];
      const qc1: P = [p1[0] + Math.cos(a2) * cl * 0.8, p1[1] + Math.sin(a2) * cl * 0.8];
      const qc2: P = [q1[0] + Math.cos(a2 + curlDir * 2.5) * cl * 0.5, q1[1] + Math.sin(a2 + curlDir * 2.5) * cl * 0.5];
      limbs.push(taper(p1, qc1, qc2, q1, 1.6, 0.5));
      const n = 9 + Math.floor(rand() * 3);
      for (let i = 0; i < n; i++) {
        const t = 0.12 + (i / n) * 0.86;
        const { p, d } = bez(start, c1, c2, p1, t);
        const dir = Math.atan2(d[1], d[0]);
        const side = i % 2 === 0 ? 1 : -1;
        leafAt(p, ((dir + side * (0.7 + j(0.5))) * 180) / Math.PI + 90, 17 + rand() * 9);
      }
      leafAt(p1, (a2 * 180) / Math.PI + 90 - curlDir * 25, 17 + rand() * 5);
      return;
    }

    // A few leaves along the outer part of the inner limbs too, so the
    // crown reads full, not like leaves only at the fingertips.
    if (depth === 2) {
      for (let i = 0; i < 4; i++) {
        const { p, d } = bez(start, c1, c2, p1, 0.55 + i * 0.12);
        const dir = Math.atan2(d[1], d[0]);
        leafAt(p, ((dir + (i % 2 ? 1 : -1) * 0.9) * 180) / Math.PI + 90, 16 + rand() * 6);
      }
    }

    const kids = 3;
    for (let k = 0; k < kids; k++) {
      const t = 0.5 + (k / (kids - 1 || 1)) * 0.5;
      const { p, d } = bez(start, c1, c2, p1, t);
      const dir = Math.atan2(d[1], d[0]);
      const spread = (k - (kids - 1) / 2) * (0.6 + j(0.2));
      branch(p, dir + spread, len * (0.62 + rand() * 0.14), (spread >= 0 ? 1 : -1) * (0.25 + rand() * 0.35), w * 0.55, depth + 1);
    }
  }

  // Trunk: a gentle S rising from the ground, wide at the base.
  const base: P = [300 + j(8), 560];
  const fork: P = [300 + j(24), 332];
  const trunk = taper(base, [base[0] + 14, 470], [fork[0] - 16, 400], fork, 58, 30);

  // Main limbs from the fork: a wide, low-reaching oak crown.
  branch(fork, -Math.PI / 2 - 0.95 + j(0.1), 150, -0.35, 26, 1);
  branch(fork, -Math.PI / 2 + 0.95 + j(0.1), 155, 0.35, 26, 1);
  branch([fork[0], fork[1] + 6], -Math.PI / 2 + j(0.12), 125, j(0.4), 22, 1);

  // Roots: flowing out along the ground from the trunk base, each ending
  // in a small upturned curl -- a light nod to the mark's roots.
  const roots: string[] = [];
  for (const side of [-1, 1]) {
    for (let r = 0; r < 2; r++) {
      const len = 46 + r * 26 + j(8);
      const s: P = [base[0] + side * (10 + r * 6), 556 - r * 3];
      const e: P = [s[0] + side * len, 558];
      roots.push(taper(s, [s[0] + side * len * 0.3, 552 + r * 3], [e[0] - side * len * 0.35, 561], e, 22 - r * 7, 2));
      const curl: P = [e[0] + side * 12, 550 - r * 2];
      roots.push(taper(e, [e[0] + side * 8, 559], [curl[0] + side * 2, 556], curl, 2, 0.8));
    }
  }

  return { trunk, roots, limbs, leaves };
}

export function OakTree({ className = "", style, seed = 7 }: { className?: string; style?: React.CSSProperties; seed?: number }) {
  const { trunk, roots, limbs, leaves } = grow(seed);
  return (
    <svg className={className} style={style} viewBox="0 0 600 560" fill="none" overflow="visible" aria-hidden="true">
      <g fill={BARK}>
        {roots.map((d, i) => (
          <path key={`r${i}`} d={d} />
        ))}
        <path d={trunk} />
        {limbs.map((d, i) => (
          <path key={`l${i}`} d={d} />
        ))}
      </g>
      <g>
        {leaves.map((l, i) => (
          <path
            key={i}
            // An almond leaf pointing up from its stem at (0,0), rotated into
            // place -- the same leaf shape the mark uses.
            d={`M 0 0 C ${f(l.len * 0.42)} ${f(-l.len * 0.25)} ${f(l.len * 0.3)} ${f(-l.len * 0.8)} 0 ${f(-l.len)} C ${f(-l.len * 0.3)} ${f(-l.len * 0.8)} ${f(-l.len * 0.42)} ${f(-l.len * 0.25)} 0 0 Z`}
            transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}
            fill={l.fill}
          />
        ))}
      </g>
    </svg>
  );
}
