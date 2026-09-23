// Side-view simulation of the landing hero's dog cast. Pure logic -- no DOM,
// no React -- so it can be stepped headlessly and stress-tested; HeroPets.tsx
// only measures the stage, steps this, and paints the results.
//
// The model: dogs live on a floor strip below the hero's call to action,
// seen from the side (which is how PixelDog is drawn). x is horizontal
// position, z is depth into the floor (0 = back, 1 = front), h is height
// above the floor. Nothing ever needs to route around the headline, because
// nothing walks through it.

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Stage {
  width: number;
  floorY: number; // container y where a front-row (z = 1) dog's feet touch down
  depth: number; // how much higher the back row (z = 0) sits
  apexMax: number; // highest a tossed ball may climb above the floor
  dogSize: number; // PixelDog width for a front-row dog
}

export type Gait = "walk" | "trot" | "run";
export type Mood = "happy" | "neutral" | "tired";
export type Pose = "stand" | "sit" | "sleep";

export interface DogConfig {
  variant: "ozho" | "mochi";
  costume: string | null;
  player: boolean; // one of the two fetch players
  energy: number; // 0..1 -- zoomies, trotting, play
  calm: number; // 0..1 -- sitting, napping
}

type Task =
  | { kind: "enter"; delay: number; x: number; z: number; started: boolean }
  | { kind: "idle"; until: number; nextLook: number; sniffUntil: number }
  | { kind: "sit"; until: number }
  | { kind: "nap"; until: number }
  | { kind: "move" }
  | { kind: "zoom"; legs: number; hopAt: number }
  | { kind: "bow"; until: number; partner: number }
  | { kind: "notice"; partner: number }
  | { kind: "flee"; until: number; partner: number; jukes: number }
  | { kind: "chase"; partner: number }
  | { kind: "hi"; until: number }
  | { kind: "game" };

export interface Dog {
  id: number;
  cfg: DogConfig;
  speedMul: number;
  x: number;
  z: number;
  h: number;
  vx: number;
  vh: number;
  goalX: number | null;
  goalZ: number;
  gait: Gait;
  facing: 1 | -1;
  lookX: number | null;
  pose: Pose;
  mood: Mood;
  happyUntil: number;
  carrying: boolean;
  jump: "none" | "crouch" | "air";
  jumpT: number;
  jumpV: number;
  hopsQueued: number;
  hopGap: number;
  stride: number;
  tailFrame: number;
  tailDir: 1 | -1;
  wagClock: number;
  wagBurstUntil: number;
  dip: number; // >0 head down (sniff, pick up, wind up, play bow), <0 head flicked up
  dipTarget: number;
  squash: number;
  task: Task;
  lastKind: string;
  cool: Record<string, number>;
  crowdT: number;
  entered: boolean;
}

export interface Ball {
  state: "held" | "air" | "roll" | "rest";
  holder: number | null;
  x: number;
  z: number;
  h: number;
  vx: number;
  vh: number;
  spin: number;
  squash: number;
  bounces: number;
}

type GamePhase = "enter" | "hold" | "windup" | "flight" | "pickup" | "carry" | "drop" | "break" | "regrab";

interface Game {
  phase: GamePhase;
  t: number;
  holder: number; // whoever has (or is about to pick up) the ball
  other: number;
  dir: 1 | -1;
  holdDur: number;
  chasers: number[];
  carryMode: "return" | "keep";
  approachSide: 1 | -1;
  pickupBy: number;
  pickupNext: "carry" | "hold";
  rounds: number;
  nextBreakAt: number;
  breakUntil: number;
}

export interface Yard {
  stage: Stage;
  rng: Rng;
  t: number;
  speedScale: number;
  dogs: Dog[];
  ball: Ball;
  game: Game | null;
  pointer: { x: number; y: number } | null;
  stats: { rounds: number; tosses: number };
}

export const SIM_STEP = 1 / 120;

const DOG_G = 1700;
const BALL_G = 1250;
export const BALL_R = 4;
const RESTITUTION = 0.5;
const BOUNCE_KEEP_VX = 0.78;
const MIN_BOUNCE_VH = 60;
const ROLL_C = 35;
const ROLL_K = 1.3;
const SPEED: Record<Gait, number> = { walk: 52, trot: 108, run: 225 };
const ACCEL: Record<Gait, number> = { walk: 260, trot: 430, run: 760 };
const TOSS_MARGIN = 70;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const scaleAt = (z: number) => 0.86 + 0.14 * z;
export const floorAt = (s: Stage, z: number) => s.floorY - (1 - z) * s.depth;
const dogW = (y: Yard, d: Dog) => y.stage.dogSize * scaleAt(d.z);
const xMin = (y: Yard) => y.stage.dogSize * 0.5 + 6;
const xMax = (y: Yard) => y.stage.width - y.stage.dogSize * 0.5 - 6;
const ballMin = () => BALL_R + 8;
const ballMax = (y: Yard) => y.stage.width - BALL_R - 8;
// Where PixelDog draws a carried ball, relative to the feet: (55.5, 25) in its
// 64x40 standing viewBox, whose feet-center is (32, 40).
const mouthDX = (y: Yard, d: Dog) => 0.367 * dogW(y, d);
const mouthX = (y: Yard, d: Dog) => d.x + d.facing * mouthDX(y, d);
const mouthH = (y: Yard, d: Dog) => 0.234 * dogW(y, d) + d.h;

function speedScaleFor(width: number) {
  return clamp(width / 1100, 0.72, 1.1);
}

export function createYard(stage: Stage, cast: DogConfig[], rng: Rng): Yard {
  const W = stage.width;
  const y: Yard = {
    stage,
    rng,
    t: 0,
    speedScale: speedScaleFor(W),
    dogs: [],
    ball: { state: "held", holder: null, x: 0, z: 1, h: 0, vx: 0, vh: 0, spin: 0, squash: 0, bounces: 0 },
    game: null,
    pointer: null,
    stats: { rounds: 0, tosses: 0 },
  };

  const players = cast.map((c, i) => (c.player ? i : -1)).filter((i) => i >= 0);
  const wanderSpots = [0.12, 0.88, 0.28, 0.72];
  let wi = 0;
  cast.forEach((cfg, i) => {
    const pi = players.indexOf(i);
    const spot = pi >= 0 ? (pi === 0 ? 0.4 : 0.6) : wanderSpots[wi++ % wanderSpots.length];
    const x = clamp((spot + (rng() - 0.5) * 0.06) * W, stage.dogSize, W - stage.dogSize);
    const fromLeft = x < W / 2;
    const z = pi >= 0 ? 0.55 + (pi === 0 ? 0.3 : -0.2) : rng();
    y.dogs.push({
      id: i,
      cfg,
      speedMul: 0.92 + rng() * 0.18,
      x: fromLeft ? -stage.dogSize : W + stage.dogSize,
      z,
      h: 0,
      vx: 0,
      vh: 0,
      goalX: null,
      goalZ: z,
      gait: "run",
      facing: fromLeft ? 1 : -1,
      lookX: null,
      pose: "stand",
      mood: "neutral",
      happyUntil: 0,
      carrying: false,
      jump: "none",
      jumpT: 0,
      jumpV: 0,
      hopsQueued: 0,
      hopGap: 0,
      stride: rng(),
      tailFrame: 0,
      tailDir: 1,
      wagClock: 0,
      wagBurstUntil: 0,
      dip: 0,
      dipTarget: 0,
      squash: 0,
      task: { kind: "enter", delay: 0.2 + i * 0.28 + rng() * 0.25, x, z, started: false },
      lastKind: "enter",
      cool: { zoom: 6 + rng() * 6, nap: 18 + rng() * 10, play: 8 + rng() * 6, hi: 0 },
      crowdT: 0,
      entered: false,
    });
  });

  if (players.length >= 2) {
    const [a, b] = players;
    y.dogs[a].carrying = true;
    y.ball.holder = a;
    y.game = {
      phase: "enter",
      t: 0,
      holder: a,
      other: b,
      dir: 1,
      holdDur: 1,
      chasers: [],
      carryMode: "return",
      approachSide: 1,
      pickupBy: a,
      pickupNext: "carry",
      rounds: 0,
      nextBreakAt: 3 + Math.floor(rng() * 3),
      breakUntil: 0,
    };
  } else {
    y.ball.state = "rest";
    y.ball.x = W / 2;
  }
  return y;
}

export function resizeYard(y: Yard, stage: Stage) {
  y.stage = stage;
  y.speedScale = speedScaleFor(stage.width);
  for (const d of y.dogs) {
    if (!d.entered) continue;
    d.x = clamp(d.x, xMin(y), xMax(y));
    if (d.goalX !== null) d.goalX = clamp(d.goalX, xMin(y), xMax(y));
  }
  y.ball.x = clamp(y.ball.x, ballMin(), ballMax(y));
}

export function setPointer(y: Yard, p: { x: number; y: number } | null) {
  y.pointer = p;
}

export function celebrate(y: Yard) {
  for (const d of y.dogs) {
    d.happyUntil = y.t + 3.5;
    if (d.entered) d.hopsQueued = 2;
  }
}

export function stepYard(y: Yard, dt: number) {
  y.t += dt;
  if (y.game) stepGame(y, y.game, dt);
  for (const d of y.dogs) think(y, d, dt);
  for (const d of y.dogs) move(y, d, dt);
  stepBall(y, dt);
  keepSpace(y, dt);
}

// ---- locomotion -------------------------------------------------------------

function goTo(y: Yard, d: Dog, x: number, z: number | null, gait: Gait) {
  d.goalX = d.entered ? clamp(x, xMin(y), xMax(y)) : x;
  if (z !== null) d.goalZ = clamp(z, 0, 1);
  d.gait = gait;
  d.pose = "stand";
}

function halt(d: Dog) {
  d.goalX = null;
}

const settled = (d: Dog) => d.goalX === null && Math.abs(d.vx) < 12;

function hop(d: Dog, v: number) {
  if (d.jump !== "none" || d.h > 0) return;
  d.pose = "stand";
  d.jump = "crouch";
  d.jumpT = 0.08;
  d.jumpV = v;
}

function move(y: Yard, d: Dog, dt: number) {
  const k = y.speedScale * d.speedMul;
  if (d.pose !== "stand") {
    d.vx = 0;
  } else if (d.goalX !== null) {
    const dx = d.goalX - d.x;
    const vmax = SPEED[d.gait] * k;
    const acc = ACCEL[d.gait] * k;
    // Target speed tapers so the dog can actually brake in the distance left,
    // which is what makes arrivals ease in instead of snapping to a stop.
    const want = Math.sign(dx) * Math.min(vmax, Math.sqrt(2 * acc * 0.85 * Math.abs(dx)));
    const dv = want - d.vx;
    const braking = d.vx !== 0 && Math.sign(dv) !== Math.sign(d.vx);
    const lim = (braking ? acc * 1.3 : acc) * dt;
    d.vx += clamp(dv, -lim, lim);
    if (Math.abs(dx) < 1 && Math.abs(d.vx) < 25) {
      d.x = d.goalX;
      d.vx = 0;
      d.goalX = null;
    }
  } else if (d.vx !== 0) {
    const dec = ACCEL.trot * k * dt;
    d.vx = Math.abs(d.vx) <= dec ? 0 : d.vx - Math.sign(d.vx) * dec;
  }

  d.x += d.vx * dt;
  if (d.entered) {
    const lo = xMin(y);
    const hi = xMax(y);
    if (d.x < lo || d.x > hi) {
      d.x = clamp(d.x, lo, hi);
      d.vx = 0;
    }
  }

  const zSpeed = (0.55 + (Math.abs(d.vx) / SPEED.run) * 0.9) * dt;
  d.z += clamp(d.goalZ - d.z, -zSpeed, zSpeed);

  if (d.jump === "crouch") {
    d.jumpT -= dt;
    if (d.jumpT <= 0) {
      d.jump = "air";
      d.vh = d.jumpV;
    }
  } else if (d.jump === "air") {
    d.vh -= DOG_G * dt;
    d.h += d.vh * dt;
    if (d.h <= 0) {
      d.h = 0;
      d.vh = 0;
      d.jump = "none";
      d.squash = 1;
    }
  }

  const speed = Math.abs(d.vx);
  if (d.h === 0 && speed > 1) d.stride += (speed * dt) / (10 + speed * 0.1);

  if (speed > 10) d.facing = d.vx > 0 ? 1 : -1;
  else if (d.lookX !== null && Math.abs(d.lookX - d.x) > 8) d.facing = d.lookX > d.x ? 1 : -1;

  d.squash = Math.max(0, d.squash - dt * 7);
  d.dip += (d.dipTarget - d.dip) * Math.min(1, dt * 16);

  const happy = y.t < d.happyUntil;
  const rate = d.pose === "stand" ? (happy ? 15 : y.t < d.wagBurstUntil ? 9 : 0) : 0;
  if (rate > 0) {
    d.wagClock += dt * rate;
    while (d.wagClock >= 1) {
      d.wagClock -= 1;
      d.tailFrame += d.tailDir;
      if (d.tailFrame >= 5) {
        d.tailFrame = 5;
        d.tailDir = -1;
      } else if (d.tailFrame <= 0) {
        d.tailFrame = 0;
        d.tailDir = 1;
      }
    }
  }
}

// ---- wanderer brains ---------------------------------------------------------

function idleTask(y: Yard, d: Dog, min: number, max: number): Task {
  return { kind: "idle", until: y.t + lerp(min, max, y.rng()), nextLook: y.t + 0.5 + y.rng(), sniffUntil: 0 };
}

// Picks somewhere to wander. Side margins are favored over the space right
// under the call to action, and keeping clear of other dogs is the weakest
// pull of the three -- it only breaks ties.
function pickSpot(y: Yard, d: Dog, min: number, max: number) {
  const W = y.stage.width;
  let best = { x: d.x, z: d.z };
  let bestScore = -Infinity;
  for (let i = 0; i < 10; i++) {
    const dir = y.rng() < 0.5 ? -1 : 1;
    const dist = lerp(min, max, y.rng());
    let x = d.x + dir * dist;
    if (x < xMin(y) || x > xMax(y)) x = d.x - dir * dist;
    x = clamp(x, xMin(y), xMax(y));
    const z = y.rng();
    const side = Math.abs(x - W / 2) / (W / 2);
    let spacing = 1;
    for (const o of y.dogs) {
      if (o === d || !o.entered) continue;
      const ox = o.goalX ?? o.x;
      spacing = Math.min(spacing, Math.hypot(x - ox, (z - o.goalZ) * 60) / 110);
    }
    const score = side + spacing * 0.45 + y.rng() * 0.35;
    if (score > bestScore) {
      bestScore = score;
      best = { x, z };
    }
  }
  return best;
}

function freeWanderer(y: Yard, d: Dog) {
  const k = d.task.kind;
  return !d.cfg.player && d.entered && (k === "idle" || k === "sit" || k === "move");
}

function pointerNear(y: Yard) {
  const p = y.pointer;
  return !!p && p.y > y.stage.floorY - 220;
}

function pickNext(y: Yard, d: Dog) {
  const t = y.t;
  const e = d.cfg.energy;
  const c = d.cfg.calm;
  const partner = y.dogs.find((o) => o !== d && freeWanderer(y, o) && o.task.kind !== "sit");
  const nearestToPointer =
    pointerNear(y) &&
    y.dogs
      .filter((o) => !o.cfg.player && o.entered)
      .every((o) => Math.abs(o.x - y.pointer!.x) >= Math.abs(d.x - y.pointer!.x));

  const opts: [string, number][] = [
    ["idle", 1],
    ["sit", 0.45 + c],
    ["stroll", 1.2],
    ["trot", 0.4 + e * 0.9],
    ["zoom", t >= d.cool.zoom ? e * e * 1.3 : 0],
    ["hop", 0.15 + e * 0.3],
    ["nap", t >= d.cool.nap ? c * c * 0.55 : 0],
    ["play", partner && t >= d.cool.play ? 0.3 + e * 0.9 : 0],
    ["hi", nearestToPointer && t >= d.cool.hi ? 4 : 0],
  ];
  let total = 0;
  for (const o of opts) {
    if (o[0] === d.lastKind) o[1] *= 0.35;
    total += o[1];
  }
  let roll = y.rng() * total;
  let kind = "idle";
  for (const [name, w] of opts) {
    if (roll < w) {
      kind = name;
      break;
    }
    roll -= w;
  }
  d.lastKind = kind;
  d.dipTarget = 0;

  switch (kind) {
    case "sit":
      halt(d);
      d.pose = "sit";
      d.task = { kind: "sit", until: t + lerp(2.5, 6, y.rng()) };
      break;
    case "nap":
      halt(d);
      d.pose = "sleep";
      d.cool.nap = t + 35 + y.rng() * 25;
      d.task = { kind: "nap", until: t + lerp(5, 9, y.rng()) };
      break;
    case "stroll": {
      const s = pickSpot(y, d, 50, 200);
      goTo(y, d, s.x, s.z, "walk");
      d.task = { kind: "move" };
      break;
    }
    case "trot": {
      const s = pickSpot(y, d, 140, 380);
      goTo(y, d, s.x, s.z, "trot");
      d.task = { kind: "move" };
      break;
    }
    case "zoom": {
      const far = d.x < y.stage.width / 2 ? xMax(y) - y.rng() * 60 : xMin(y) + y.rng() * 60;
      goTo(y, d, far, y.rng(), "run");
      d.happyUntil = t + 4;
      d.cool.zoom = t + 14 + y.rng() * 10;
      d.task = { kind: "zoom", legs: y.rng() < 0.5 ? 1 : 0, hopAt: t + 0.4 + y.rng() * 0.6 };
      break;
    }
    case "hop":
      d.hopsQueued = y.rng() < 0.4 ? 2 : 1;
      d.happyUntil = t + 1.5;
      d.task = idleTask(y, d, 1, 2);
      break;
    case "play": {
      const p = partner!;
      halt(d);
      d.pose = "stand";
      d.happyUntil = t + 6;
      d.cool.play = t + 18 + y.rng() * 10;
      d.task = { kind: "bow", until: t + 0.6, partner: p.id };
      halt(p);
      p.pose = "stand";
      p.happyUntil = t + 6;
      p.cool.play = d.cool.play;
      p.task = { kind: "notice", partner: d.id };
      break;
    }
    case "hi":
      d.cool.hi = t + 10 + y.rng() * 6;
      d.happyUntil = t + 5;
      d.task = { kind: "hi", until: t + 6 };
      break;
    default:
      halt(d);
      d.task = idleTask(y, d, 1.2, 3.4);
  }
}

function think(y: Yard, d: Dog, dt: number) {
  const t = y.t;
  const task = d.task;

  if (d.hopsQueued > 0 && d.entered && d.jump === "none" && d.h === 0 && !busyMouth(y, d)) {
    d.hopGap -= dt;
    if (d.hopGap <= 0) {
      hop(d, 230 + y.rng() * 70);
      d.hopsQueued--;
      d.hopGap = 0.16;
    }
  }

  switch (task.kind) {
    case "enter":
      if (!task.started) {
        task.delay -= dt;
        if (task.delay <= 0) {
          task.started = true;
          goTo(y, d, task.x, task.z, "run");
        }
      } else if (d.goalX === null) {
        d.entered = true;
        if (d.cfg.player) d.task = { kind: "game" };
        else {
          d.task = idleTask(y, d, 0.6, 1.6);
          d.wagBurstUntil = t + 1.2;
        }
      }
      return;

    case "game":
      return;

    case "idle":
      halt(d);
      if (t >= task.nextLook) {
        d.lookX = d.x + (y.rng() < 0.5 ? -1 : 1) * (40 + y.rng() * 160);
        task.nextLook = t + 0.8 + y.rng() * 1.6;
        if (y.rng() < 0.25) task.sniffUntil = t + 0.5 + y.rng() * 0.5;
        if (y.rng() < 0.2) d.wagBurstUntil = t + 0.8 + y.rng() * 1.2;
      }
      d.dipTarget = t < task.sniffUntil ? 0.7 : 0;
      if (t >= task.until) pickNext(y, d);
      break;

    case "sit":
    case "nap":
      if (t >= task.until) {
        d.pose = "stand";
        pickNext(y, d);
      }
      break;

    case "move":
      if (d.goalX === null) d.task = idleTask(y, d, 0.6, 2);
      break;

    case "zoom":
      if (t >= task.hopAt && d.h === 0) {
        hop(d, 270);
        task.hopAt = Infinity;
      }
      if (d.goalX === null) {
        if (task.legs > 0) {
          task.legs--;
          task.hopAt = t + 0.3 + y.rng() * 0.5;
          const back = d.x < y.stage.width / 2 ? d.x + 160 + y.rng() * 220 : d.x - 160 - y.rng() * 220;
          goTo(y, d, back, y.rng(), "run");
        } else {
          d.task = idleTask(y, d, 1, 2.2);
        }
      }
      break;

    case "bow": {
      const p = y.dogs[task.partner];
      d.lookX = p.x;
      d.dipTarget = 0.9;
      if (t >= task.until) {
        d.dipTarget = 0;
        const away = p.x < d.x ? xMax(y) - y.rng() * 50 : xMin(y) + y.rng() * 50;
        goTo(y, d, away, y.rng(), "run");
        d.task = { kind: "flee", until: t + 2.6 + y.rng() * 1.8, partner: p.id, jukes: 2 };
        p.task = { kind: "chase", partner: d.id };
      }
      break;
    }

    case "notice":
      halt(d);
      d.lookX = y.dogs[task.partner].x;
      if (y.dogs[task.partner].task.kind !== "bow") d.task = idleTask(y, d, 0.5, 1);
      break;

    case "flee": {
      const p = y.dogs[task.partner];
      const close = Math.abs(p.x - d.x) < 50;
      if (t >= task.until || p.task.kind !== "chase") {
        halt(d);
        d.hopsQueued = 1;
        d.task = idleTask(y, d, 1, 2);
        if (p.task.kind === "chase") {
          halt(p);
          p.hopsQueued = 1;
          p.task = idleTask(y, p, 1, 2);
        }
      } else if (d.goalX === null || (close && task.jukes > 0 && y.rng() < dt * 3)) {
        if (close) task.jukes--;
        const away = p.x < d.x ? xMax(y) - y.rng() * 80 : xMin(y) + y.rng() * 80;
        const target = Math.abs(away - d.x) < 60 ? (p.x < d.x ? xMin(y) + 40 : xMax(y) - 40) : away;
        goTo(y, d, target, y.rng(), "run");
      }
      break;
    }

    case "chase": {
      const p = y.dogs[task.partner];
      if (p.task.kind !== "flee") {
        d.task = idleTask(y, d, 0.5, 1.5);
        break;
      }
      const side = Math.sign(p.x - d.x) || 1;
      goTo(y, d, p.x - side * 34, p.z, "run");
      break;
    }

    case "hi": {
      const p = y.pointer;
      if (!p || !pointerNear(y) || Math.abs(p.x - d.x) > 260 || t >= task.until) {
        d.pose = "stand";
        d.task = idleTask(y, d, 0.8, 1.6);
        break;
      }
      d.lookX = p.x;
      d.happyUntil = t + 0.5;
      const side = Math.sign(p.x - d.x) || 1;
      const spot = p.x - side * 30;
      if (Math.abs(spot - d.x) > 24) goTo(y, d, spot, 1, "trot");
      else if (settled(d)) {
        halt(d);
        d.pose = "sit";
      }
      break;
    }
  }

  if (d.goalX === null && d.pose !== "sleep" && !d.cfg.player) {
    const b = y.ball;
    if (b.state === "air" || b.state === "roll") d.lookX = b.x;
    else if (y.pointer && pointerNear(y) && Math.abs(y.pointer.x - d.x) < 240) d.lookX = y.pointer.x;
  }
}

function busyMouth(y: Yard, d: Dog) {
  const g = y.game;
  if (!g || !d.cfg.player) return false;
  return (
    (g.phase === "windup" && d.id === g.holder) ||
    (g.phase === "pickup" && d.id === g.pickupBy) ||
    (g.phase === "drop" && d.id === g.holder)
  );
}

// ---- the fetch game ---------------------------------------------------------

function restDistance(vx: number, vh: number, h0: number) {
  const dt = SIM_STEP;
  let x = 0;
  let h = h0;
  let v = vx;
  let u = vh;
  let rolling = false;
  for (let i = 0; i < 20 / dt; i++) {
    if (!rolling) {
      u -= BALL_G * dt;
      h += u * dt;
      x += v * dt;
      if (h <= 0) {
        h = 0;
        if (-u > MIN_BOUNCE_VH) {
          u = -u * RESTITUTION;
          v *= BOUNCE_KEEP_VX;
        } else {
          rolling = true;
        }
      }
    } else {
      const f = (ROLL_C + ROLL_K * Math.abs(v)) * dt;
      if (Math.abs(v) <= f) return x;
      v -= Math.sign(v) * f;
      x += v * dt;
    }
  }
  return x;
}

// Aims a toss by forward-simulating the ball: picks where it should come to
// rest (always inside the yard) and an arc height, then bisects on horizontal
// speed until the simulated bounces-and-roll end there. Nothing ever has to
// catch it at a wall.
function planToss(y: Yard, d: Dog, dir: 1 | -1) {
  const x0 = mouthX(y, d);
  const h0 = mouthH(y, d);
  const lo = TOSS_MARGIN;
  const hi = y.stage.width - TOSS_MARGIN;
  const room = Math.max(dir > 0 ? hi - x0 : x0 - lo, 30);
  const dist = clamp(lerp(0.35, 0.9, y.rng()) * room, Math.min(60, room), 520);
  const apex = clamp(lerp(0.4, 1, y.rng()) * y.stage.apexMax, 36, dist * 0.75 + 40);
  const vh = Math.sqrt(2 * BALL_G * Math.max(apex - h0, 10));
  let a = 0;
  let b = 1400;
  for (let i = 0; i < 26; i++) {
    const m = (a + b) / 2;
    if (restDistance(m, vh, h0) < dist) a = m;
    else b = m;
  }
  return { vx: dir * a, vh };
}

function tossDir(y: Yard, d: Dog): 1 | -1 {
  const roomL = d.x - TOSS_MARGIN;
  const roomR = y.stage.width - TOSS_MARGIN - d.x;
  const best: 1 | -1 = roomR >= roomL ? 1 : -1;
  const other = Math.min(roomL, roomR);
  return other >= 200 && y.rng() < 0.3 ? (-best as 1 | -1) : best;
}

function canPick(y: Yard, d: Dog, slow: boolean) {
  const b = y.ball;
  return (
    d.h === 0 &&
    d.jump === "none" &&
    b.state !== "held" &&
    b.h < 5 &&
    Math.abs(b.vx) < (slow ? 60 : 150) &&
    Math.abs(mouthX(y, d) - b.x) < 9 &&
    Math.abs(d.z - b.z) < 0.22
  );
}

function approachBall(y: Yard, d: Dog, gait: Gait) {
  const b = y.ball;
  let side = Math.sign(b.x - d.x) || d.facing;
  // A ball tucked against a wall can only be reached from the open side.
  const spot = b.x - side * mouthDX(y, d);
  if (spot < xMin(y) || spot > xMax(y)) side = -side;
  goTo(y, d, b.x - side * mouthDX(y, d), b.z, gait);
  d.lookX = b.x;
}

function enterHold(y: Yard, g: Game) {
  const A = y.dogs[g.holder];
  const B = y.dogs[g.other];
  g.phase = "hold";
  g.t = 0;
  g.holdDur = 0.5 + y.rng() * 1.1;
  g.dir = tossDir(y, A);
  halt(A);
  const rx = A.x + g.dir * (60 + y.rng() * 50);
  const rz = clamp(A.z + (A.z > 0.5 ? -1 : 1) * (0.35 + y.rng() * 0.25), 0, 1);
  goTo(y, B, rx, rz, "trot");
}

function startPickup(y: Yard, g: Game, id: number, next: "carry" | "hold") {
  const d = y.dogs[id];
  g.phase = "pickup";
  g.t = 0;
  g.pickupBy = id;
  g.pickupNext = next;
  halt(d);
  d.vx *= 0.3;
  d.dipTarget = 1;
  const b = y.ball;
  b.state = "rest";
  b.vx = 0;
  b.vh = 0;
  b.h = 0;
  for (const c of g.chasers) {
    if (c === id) continue;
    const loser = y.dogs[c];
    halt(loser);
    loser.lookX = d.x;
    if (y.rng() < 0.5) loser.hopsQueued = 1;
  }
}

function stepGame(y: Yard, g: Game, dt: number) {
  g.t += dt;
  const t = y.t;
  const b = y.ball;
  const holder = y.dogs[g.holder];
  const other = y.dogs[g.other];
  for (const d of [holder, other]) if (d.entered && g.phase !== "break") d.happyUntil = Math.max(d.happyUntil, t + 0.4);

  switch (g.phase) {
    case "enter":
      if (holder.entered && other.entered) enterHold(y, g);
      break;

    case "hold":
      holder.lookX = other.x;
      if (settled(other)) {
        other.lookX = holder.x;
        other.dipTarget = 0.45;
      }
      if (g.t >= g.holdDur && (settled(other) || g.t > 3)) {
        halt(holder);
        holder.facing = g.dir;
        holder.lookX = holder.x + g.dir * 100;
        holder.dipTarget = 1;
        g.phase = "windup";
        g.t = 0;
      }
      break;

    case "windup":
      if (g.t >= 0.22) {
        holder.facing = g.dir;
        const plan = planToss(y, holder, g.dir);
        b.state = "air";
        b.holder = null;
        b.x = mouthX(y, holder);
        b.z = holder.z;
        b.h = mouthH(y, holder);
        b.vx = plan.vx;
        b.vh = plan.vh;
        b.bounces = 0;
        holder.carrying = false;
        holder.dip = -0.6;
        holder.dipTarget = 0;
        g.chasers = y.rng() < 0.22 ? [g.other, g.holder] : [g.other];
        g.phase = "flight";
        g.t = 0;
        y.stats.tosses++;
      }
      break;

    case "flight": {
      const landed = b.bounces > 0 || b.state !== "air";
      for (const d of [holder, other]) {
        const chasing = g.chasers.includes(d.id);
        if (!chasing || !landed || (d.id === g.holder && g.t < 0.35)) {
          halt(d);
          d.lookX = b.x;
          d.goalZ = chasing ? b.z : d.goalZ;
          d.dipTarget = chasing && d.id === g.other ? 0.35 : 0;
          continue;
        }
        d.dipTarget = 0;
        approachBall(y, d, "run");
        if (canPick(y, d, false)) {
          y.stats.rounds++;
          startPickup(y, g, d.id, "carry");
          return;
        }
      }
      if (g.t > 9 && b.state !== "rest") {
        b.state = "rest";
        b.vx = 0;
        b.vh = 0;
        b.h = 0;
      }
      if (g.t > 15) {
        const nearest = g.chasers
          .map((id) => y.dogs[id])
          .reduce((p, c) => (Math.abs(c.x - b.x) < Math.abs(p.x - b.x) ? c : p));
        b.x = clamp(mouthX(y, nearest), ballMin(), ballMax(y));
        b.z = nearest.z;
        y.stats.rounds++;
        startPickup(y, g, nearest.id, "carry");
      }
      break;
    }

    case "pickup": {
      const d = y.dogs[g.pickupBy];
      b.x = mouthX(y, d);
      b.z = d.z;
      if (g.t >= 0.2) {
        b.state = "held";
        b.holder = d.id;
        d.carrying = true;
        d.dipTarget = 0;
        d.dip = -0.25;
        const partner = y.dogs[d.id === g.holder ? g.other : g.holder];
        g.holder = d.id;
        g.other = partner.id;
        if (g.pickupNext === "hold") {
          enterHold(y, g);
          break;
        }
        const wonOwnToss = g.chasers.length > 1 && d.id !== g.chasers[0];
        g.carryMode = wonOwnToss || y.rng() < 0.38 ? "keep" : "return";
        g.phase = "carry";
        g.t = 0;
        if (g.carryMode === "return") {
          g.approachSide = (Math.sign(partner.x - d.x) || 1) as 1 | -1;
          halt(partner);
          if (y.rng() < 0.35) partner.pose = "sit";
        } else {
          const room = d.x < y.stage.width / 2 ? 1 : -1;
          goTo(y, d, d.x + room * (70 + y.rng() * 110), clamp(d.z + (y.rng() - 0.5) * 0.4, 0, 1), "trot");
          if (y.rng() < 0.45) d.hopsQueued = 1;
        }
      }
      break;
    }

    case "carry":
      if (g.carryMode === "return") {
        const w = dogW(y, holder);
        goTo(y, holder, other.x - g.approachSide * w * 1.05, other.z, "trot");
        holder.lookX = other.x;
        other.lookX = holder.x;
        if (Math.abs(holder.x - (other.x - g.approachSide * w * 1.05)) < 5 && Math.abs(holder.vx) < 25) {
          halt(holder);
          holder.facing = g.approachSide;
          holder.dipTarget = 1;
          g.phase = "drop";
          g.t = 0;
        } else if (g.t > 12) {
          g.phase = "drop";
          g.t = 0;
        }
      } else {
        const side = Math.sign(holder.x - other.x) || 1;
        if (Math.abs(other.x - (holder.x - side * 70)) > 30) goTo(y, other, holder.x - side * 70, holder.z, "trot");
        other.lookX = holder.x;
        if (holder.goalX === null || g.t > 6) enterHold(y, g);
      }
      break;

    case "drop":
      if (g.t >= 0.16) {
        b.state = "air";
        b.holder = null;
        b.x = mouthX(y, holder);
        b.z = holder.z;
        b.h = mouthH(y, holder);
        b.vx = holder.facing * 40;
        b.vh = 30;
        b.bounces = 0;
        holder.carrying = false;
        holder.dipTarget = 0;
        const receiver = other;
        g.holder = receiver.id;
        g.other = holder.id;
        g.rounds++;
        g.t = 0;
        if (g.rounds >= g.nextBreakAt) {
          g.phase = "break";
          g.breakUntil = t + 3 + y.rng() * 2.5;
          g.nextBreakAt = g.rounds + 3 + Math.floor(y.rng() * 3);
        } else {
          g.phase = "regrab";
          goTo(y, holder, holder.x - holder.facing * 45, holder.z, "walk");
        }
      }
      break;

    case "break":
      if (b.state === "rest") {
        for (const d of [holder, other]) {
          if (settled(d) && d.jump === "none") {
            halt(d);
            d.pose = "sit";
            d.lookX = d === holder ? other.x : holder.x;
            d.happyUntil = t + 0.5;
          }
        }
      }
      if (t >= g.breakUntil) {
        holder.pose = "stand";
        other.pose = "stand";
        g.phase = "regrab";
        g.t = 0;
      }
      break;

    case "regrab":
      if (b.state === "air") break;
      approachBall(y, holder, "walk");
      if (settled(other)) other.lookX = b.x;
      if (canPick(y, holder, true) || g.t > 10) {
        if (!canPick(y, holder, true)) {
          b.x = clamp(mouthX(y, holder), ballMin(), ballMax(y));
          b.z = holder.z;
        }
        g.chasers = [];
        startPickup(y, g, holder.id, "hold");
      }
      break;
  }
}

// ---- ball ---------------------------------------------------------------------

function stepBall(y: Yard, dt: number) {
  const b = y.ball;
  if (b.state === "held" && b.holder !== null) {
    const d = y.dogs[b.holder];
    b.x = mouthX(y, d);
    b.z = d.z;
    b.h = mouthH(y, d);
    b.vx = 0;
    return;
  }
  if (b.state === "air") {
    b.vh -= BALL_G * dt;
    b.h += b.vh * dt;
    b.x += b.vx * dt;
    if (b.h <= 0) {
      b.h = 0;
      b.bounces++;
      if (-b.vh > MIN_BOUNCE_VH) {
        b.squash = Math.min(1, -b.vh / 500 + 0.3);
        b.vh = -b.vh * RESTITUTION;
        b.vx *= BOUNCE_KEEP_VX;
      } else {
        b.vh = 0;
        b.state = "roll";
      }
    }
  } else if (b.state === "roll") {
    const f = (ROLL_C + ROLL_K * Math.abs(b.vx)) * dt;
    b.vx = Math.abs(b.vx) <= f ? 0 : b.vx - Math.sign(b.vx) * f;
    b.x += b.vx * dt;
    if (b.vx === 0) b.state = "rest";
  }
  if (b.x < ballMin() || b.x > ballMax(y)) {
    b.x = clamp(b.x, ballMin(), ballMax(y));
    b.vx = 0;
  }
  b.spin += ((b.vx * dt) / BALL_R) * (180 / Math.PI);
  b.squash = Math.max(0, b.squash - dt * 9);
}

// ---- personal space ----------------------------------------------------------

function pairedUp(y: Yard, a: Dog, b: Dog) {
  if (a.cfg.player && b.cfg.player) return true;
  const ta = a.task;
  const tb = b.task;
  const partnerOf = (t: Task) => ("partner" in t ? t.partner : -1);
  return partnerOf(ta) === b.id || partnerOf(tb) === a.id;
}

// Lowest priority of anything here: dogs that overlap at the same depth
// drift apart in depth (one steps behind the other), and a wanderer that
// keeps standing on top of another eventually wanders off.
function keepSpace(y: Yard, dt: number) {
  const w = y.stage.dogSize;
  for (const d of y.dogs) d.crowdT = Math.max(0, d.crowdT - dt * 0.5);
  for (let i = 0; i < y.dogs.length; i++) {
    for (let j = i + 1; j < y.dogs.length; j++) {
      const a = y.dogs[i];
      const b = y.dogs[j];
      if (!a.entered || !b.entered || pairedUp(y, a, b)) continue;
      if (Math.abs(a.x - b.x) > w * 0.8 || Math.abs(a.z - b.z) > 0.3) continue;
      const s = a.z >= b.z ? 1 : -1;
      if (a.pose !== "sleep") a.goalZ = clamp(a.goalZ + s * 0.8 * dt, 0, 1);
      if (b.pose !== "sleep") b.goalZ = clamp(b.goalZ - s * 0.8 * dt, 0, 1);
      for (const d of [a, b]) {
        if (!freeWanderer(y, d) || !settled(d)) continue;
        d.crowdT += dt * 1.5;
        if (d.crowdT > 1.2) {
          d.crowdT = 0;
          const s2 = pickSpot(y, d, 60, 160);
          goTo(y, d, s2.x, s2.z, "walk");
          d.task = { kind: "move" };
        }
      }
    }
  }
}

// ---- views --------------------------------------------------------------------

export interface DogView {
  x: number;
  footY: number;
  scale: number;
  zIndex: number;
  lift: number;
  tilt: number;
  sx: number;
  sy: number;
  shadowScale: number;
  shadowOpacity: number;
  legFrame: 0 | 1;
  tailFrame: 0 | 1 | 2 | 3 | 4 | 5;
  facing: 1 | -1;
  sitting: boolean;
  asleep: boolean;
  carrying: boolean;
  mood: Mood;
}

export function viewDog(y: Yard, d: Dog): DogView {
  const speed = Math.abs(d.vx);
  const moving = d.h === 0 && d.jump !== "air" && speed > 6 && d.pose === "stand";
  const bob = moving ? Math.abs(Math.sin(Math.PI * d.stride)) * (0.5 + 2.8 * Math.min(1, speed / (SPEED.run * y.speedScale))) : 0;
  const sq = Math.max(d.squash, d.jump === "crouch" ? 0.8 : 0);
  let sy = 1 - 0.13 * sq;
  let sx = 1 + 0.09 * sq;
  if (d.jump === "air" && d.vh > 0) {
    sy *= 1.06;
    sx *= 0.96;
  }
  return {
    x: d.x,
    footY: floorAt(y.stage, d.z),
    scale: scaleAt(d.z),
    zIndex: 10 + Math.round(d.z * 40),
    lift: d.h + bob,
    tilt: d.pose === "stand" ? d.facing * d.dip * 9 : 0,
    sx,
    sy,
    shadowScale: 1 - Math.min(d.h / 70, 0.45),
    shadowOpacity: 0.16 * (1 - Math.min(d.h / 90, 0.5)),
    legFrame: d.jump === "air" ? 1 : moving ? ((Math.floor(d.stride * 2) % 2) as 0 | 1) : 0,
    tailFrame: d.tailFrame as DogView["tailFrame"],
    facing: d.facing,
    sitting: d.pose === "sit",
    asleep: d.pose === "sleep",
    carrying: d.carrying,
    mood: y.t < d.happyUntil ? "happy" : d.mood,
  };
}

export interface BallView {
  visible: boolean;
  x: number;
  footY: number;
  h: number;
  scale: number;
  spin: number;
  squash: number;
  zIndex: number;
  shadowScale: number;
  shadowOpacity: number;
}

export function viewBall(y: Yard): BallView {
  const b = y.ball;
  return {
    visible: b.state !== "held",
    x: b.x,
    footY: floorAt(y.stage, b.z),
    h: b.h,
    scale: scaleAt(b.z),
    spin: b.spin,
    squash: b.squash,
    zIndex: 11 + Math.round(b.z * 40),
    shadowScale: 1 - Math.min(b.h / 120, 0.6),
    shadowOpacity: 0.2 * (1 - Math.min(b.h / 160, 0.75)),
  };
}
