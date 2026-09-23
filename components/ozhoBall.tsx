// Ozho's fetch toy: a pixel-art tennis ball drawn on the same blocky grid
// as PixelDog (so the one he carries in his mouth and the one bouncing
// across the page are the same object), plus the little physics that
// throws it -- gravity, a couple of decaying bounces, then a roll to a
// stop -- planned so it comes to rest exactly on a chosen spot.

// 8x8, one character per pixel: b base, d shade, h highlight, s seam.
const BALL_PIXELS = [
  "..bbbb..",
  ".bsbbbb.",
  "bhsbbbbb",
  "bbbssbbb",
  "bbbbbssb",
  "bbbbbbsd",
  ".bbbbsd.",
  "..dddd..",
];
const BALL_COLORS: Record<string, string> = { b: "#cfdc3a", d: "#a4b21f", h: "#eef5b0", s: "#fbfdf0" };

/** The ball's pixels as rects, placed at (x, y) in whatever SVG they're drawn into. */
export function ballRects(x: number, y: number, keyPrefix = "ball") {
  const out: JSX.Element[] = [];
  BALL_PIXELS.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = row[i];
      if (c === ".") continue;
      out.push(<rect key={`${keyPrefix}-${i}-${j}`} x={x + i} y={y + j} width={1} height={1} fill={BALL_COLORS[c]} />);
    }
  });
  return out;
}

export function PixelBall({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 8 8" width={size} height={size} shapeRendering="crispEdges" style={{ display: "block" }}>
      {ballRects(0, 0)}
    </svg>
  );
}

// ---- physics ---------------------------------------------------------------
// The throw happens in the page plane (where he walks) with a separate
// height above it, so it can arc, bounce and cast a shadow on the spot
// beneath it. Units are px and seconds.
const G = 1500;
const RESTITUTION = 0.45;
const MIN_BOUNCE = 70; // below this impact speed it stops bouncing and rolls
const BOUNCE_KEEP = 0.7; // ground speed kept through each bounce
const ROLL_DECEL = 260;
const ROLL_DRAG = 1.4;
const STOP_SPEED = 4;
const STEP = 1 / 120;

export interface BallSim {
  ox: number;
  oy: number;
  dx: number;
  dy: number;
  dist: number; // along the ground from the origin
  s: number; // ground speed
  h: number; // height above the ground
  vh: number;
  squash: number; // 0..1, set on impact and eased out
  spin: number; // degrees rolled
  resting: boolean;
  target: number; // the planned rest distance
  acc: number; // unstepped time carried to the next frame
}

function advance(b: BallSim, dt: number) {
  if (b.resting) return;
  if (b.h > 0 || b.vh > 0) {
    b.vh -= G * dt;
    b.h += b.vh * dt;
    b.dist += b.s * dt;
    if (b.h <= 0) {
      b.h = 0;
      const impact = -b.vh;
      b.s *= BOUNCE_KEEP;
      b.squash = Math.min(1, impact / 480);
      b.vh = impact > MIN_BOUNCE ? impact * RESTITUTION : 0;
    }
  } else {
    b.s = Math.max(0, b.s - (ROLL_DECEL + ROLL_DRAG * b.s) * dt);
    b.dist += b.s * dt;
    if (b.s < STOP_SPEED) {
      b.s = 0;
      b.resting = true;
    }
  }
  b.spin += ((b.s * dt) / 6) * (180 / Math.PI);
  b.squash *= Math.exp(-dt * 16);
}

function restDistance(s: number, vh: number, h: number) {
  const b: BallSim = { ox: 0, oy: 0, dx: 1, dy: 0, dist: 0, s, h, vh, squash: 0, spin: 0, resting: false, target: 0, acc: 0 };
  for (let i = 0; i < 120 * 12 && !b.resting; i++) advance(b, STEP);
  return b.dist;
}

/** A throw from `from` that comes to rest exactly at `to`. */
export function planToss(from: { x: number; y: number }, to: { x: number; y: number }): BallSim {
  const D = Math.hypot(to.x - from.x, to.y - from.y);
  const dx = D > 0 ? (to.x - from.x) / D : 1;
  const dy = D > 0 ? (to.y - from.y) / D : 0;
  const h0 = 22;
  const vh0 = Math.min(560, 330 + 0.3 * D);
  // Rest distance grows with launch speed, so bisect for the one that
  // lands on the spot.
  let lo = 0;
  let hi = 3000;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (restDistance(mid, vh0, h0) < D) lo = mid;
    else hi = mid;
  }
  return { ox: from.x, oy: from.y, dx, dy, dist: 0, s: (lo + hi) / 2, h: h0, vh: vh0, squash: 0, spin: 0, resting: false, target: D, acc: 0 };
}

/** Advances the sim by `dt` seconds, in the same fixed steps it was planned with. */
export function stepBall(b: BallSim, dt: number) {
  b.acc += Math.min(dt, 0.1);
  while (b.acc >= STEP && !b.resting) {
    advance(b, STEP);
    b.acc -= STEP;
  }
  if (b.resting) b.dist = b.target;
}

export function ballGround(b: BallSim) {
  return { x: b.ox + b.dx * b.dist, y: b.oy + b.dy * b.dist };
}
