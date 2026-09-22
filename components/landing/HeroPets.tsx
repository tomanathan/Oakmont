"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PixelDog } from "@/components/PixelDog";

// Purely decorative: a small cast of PixelDog instances that dash, curve,
// bounce, and (two of them) play fetch with each other around the hero.
// These are NOT the live ScoutCompanion/SecondCompanion -- no pet-state
// fetch, no session needed, which is exactly right for a visitor who
// hasn't signed up yet.
//
// Movement is journey-based, not simple point-seeking: each leg of travel
// is a quadratic Bezier curve (same idea ScoutCompanion.tsx uses for its
// own walk paths -- randomized "bow" control point, not a reuse of that
// component) sampled at an eased progress, so pets swing along natural
// arcs and ease in/out of a stop instead of gliding in perfectly straight
// lines at constant speed. A vertical bounce riding on top of that (tied
// to the leg-swap timer) reads as an actual trot/sprint, and journeys
// randomly roll a "sprinting" burst at higher speed for real zoomies
// energy. Position is written straight to each pet's DOM node via a ref on
// a `setInterval` tick, never through React state -- the slower-changing
// *pose* props PixelDog actually needs as React props (legFrame, facing,
// carryingBall) update on their own, much coarser interval instead.
//
// Mood switches to "happy" for a beat when the sample question below is
// answered correctly (see SampleQuestion.tsx's "landing:correct" dispatch).
//
// Deliberately does NOT respect prefers-reduced-motion -- an explicit,
// informed choice for this specific decorative cast (not an oversight):
// continuously-moving animation is a real trigger for some users' motion
// sensitivity, and that tradeoff was raised directly, but the product call
// here is that these pets should always be lively regardless of that
// OS/browser setting.

type Variant = "ozho" | "mochi";
type Role = "wander" | "thrower" | "fetcher";

interface ExclusionBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}
interface Bounds {
  width: number;
  height: number;
  excl: ExclusionBox;
}

interface PetSim {
  variant: Variant;
  costume: string | null;
  role: Role;
  side: "left" | "right"; // which half of the hero this pet mostly stays on
  homeX: number;
  homeY: number; // the thrower's anchor point; unused by other roles
  baseSpeed: number; // this pet's own personality -- some are just zoomier
  // Current journey: a quadratic Bezier from (startX,startY) through
  // (curveX,curveY) to (targetX,targetY), progress `t` 0..1 over `duration`
  // seconds. Re-rolled every time a journey completes.
  startX: number;
  startY: number;
  curveX: number;
  curveY: number;
  targetX: number;
  targetY: number;
  t: number;
  duration: number;
  sprinting: boolean;
  speedMult: number; // the multiplier the current journey started with, so an exclusion re-route can keep the same pace
  x: number; // last-sampled render position (ground truth for exclusion checks)
  y: number;
  facing: 1 | -1;
  legFrame: 0 | 1;
  legTimerMs: number;
  legIntervalMs: number;
  tailFrame: number;
  tailDir: 1 | -1;
  bouncePhaseMs: number;
  carryingBall: boolean;
}

interface Pose {
  facing: 1 | -1;
  legFrame: 0 | 1;
  tailFrame: number;
  carryingBall: boolean;
}

// The thrown ball itself, tracked separately from any one pet so it can be
// visibly mid-air (or waiting on the ground) during the "out" leg of a
// fetch, instead of only ever existing invisibly in whichever dog's mouth
// currently has carryingBall set.
interface BallSim {
  phase: "hidden" | "flying" | "ground";
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  x: number;
  y: number;
  t: number;
  duration: number; // scaled to this throw's distance -- a cross-hero throw takes longer than a short toss
  arcHeight: number; // scaled to distance too, so long throws visibly arc higher than short ones
  landingPetX: number; // the pre-offset point the fetcher should path to once this ball lands (see ballOffset below)
  landingPetY: number;
}

const CAST_CONFIG: { variant: Variant; costume: string | null; role: Role; side: "left" | "right" }[] = [
  { variant: "ozho", costume: "sunglasses", role: "wander", side: "left" },
  { variant: "mochi", costume: "scarf", role: "wander", side: "right" },
  { variant: "ozho", costume: null, role: "wander", side: "right" },
  { variant: "ozho", costume: "bowtie", role: "thrower", side: "left" },
  { variant: "mochi", costume: null, role: "fetcher", side: "left" },
];

const POSITION_TICK_MS = 33; // ~30fps -- smooth enough for curves+bounce, still cheap for 5 elements
const POSE_TICK_MS = 110;
const PET_SIZE = 44;
const BALL_SIZE = 16;
const BALL_SPEED = 620; // px/s -- flight duration scales with distance instead of being fixed, so a cross-hero throw takes visibly longer than a short toss
const BALL_MIN_FLIGHT_S = 0.6;
const BALL_MAX_FLIGHT_S = 1.5;
const BALL_ARC_FRAC = 0.3; // arc height as a fraction of throw distance
const BALL_MAX_ARC = 140;
const EXCLUSION_PAD = 22;
const HOME_LEASH = 90; // how far the thrower is allowed to drift from its spawn point
const MIN_JOURNEY_FRAC = 0.45; // a fresh journey should cover at least this fraction of the hero's larger dimension
const SPRINT_CHANCE = 0.35;
const SPRINT_MULT = 2.1;
const BOUNCE_AMP = 6;
const BOUNCE_FREQ = 0.017; // rad per ms while trotting; scales with sprint below

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function bezierPoint(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, t: number) {
  const mt = 1 - t;
  return {
    x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
    y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
  };
}

// Measures the *real* rendered text block (Hero.tsx's `data-hero-content`
// div) rather than guessing a percentage box -- so the exclusion zone
// tracks whatever the headline/subhead/CTA actually take up at the current
// viewport width, not a fixed fraction that would be wrong on some sizes.
function measureBounds(container: HTMLDivElement): Bounds | null {
  const rect = container.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return null;
  const textEl = container.parentElement?.querySelector<HTMLElement>("[data-hero-content]");
  let excl: ExclusionBox = {
    xMin: rect.width * 0.3,
    xMax: rect.width * 0.7,
    yMin: rect.height * 0.3,
    yMax: rect.height * 0.7,
  };
  if (textEl) {
    const t = textEl.getBoundingClientRect();
    excl = {
      xMin: t.left - rect.left - EXCLUSION_PAD,
      xMax: t.right - rect.left + EXCLUSION_PAD,
      yMin: t.top - rect.top - EXCLUSION_PAD,
      yMax: t.bottom - rect.top + EXCLUSION_PAD,
    };
  }
  return { width: rect.width, height: rect.height, excl };
}

// Rejection-samples a point anywhere in the hero (optionally restricted to
// one horizontal half, or a tight radius around a "home" point for the
// thrower's short leash) that doesn't fall inside the exclusion box.
function randomSafePoint(
  bounds: Bounds,
  opts: { side?: "left" | "right"; near?: { x: number; y: number; radius: number } } = {}
) {
  const { width, height, excl } = bounds;
  const xMin = opts.side === "right" ? width / 2 : 0;
  const xMax = opts.side === "left" ? width / 2 : width;

  // The band above the text and the band below it are almost never the
  // same size (the hero's top/bottom padding differ), so sampling y
  // uniformly across the full height quietly under-visits whichever band
  // is smaller -- in practice the shorter band below the text, which reads
  // as "the pets never run down the page." Picking the band itself first,
  // an even coin flip, is what actually keeps both in play.
  const topBand = Math.max(excl.yMin, 0);
  const bottomBand = Math.max(height - excl.yMax, 0);
  const useBottomBand = bottomBand > PET_SIZE && (topBand <= PET_SIZE || Math.random() < 0.5);

  for (let attempt = 0; attempt < 20; attempt++) {
    let x: number;
    let y: number;
    if (opts.near) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * opts.near.radius;
      x = Math.min(Math.max(opts.near.x + Math.cos(angle) * r, 0), width - PET_SIZE);
      y = Math.min(Math.max(opts.near.y + Math.sin(angle) * r, 0), height - PET_SIZE);
    } else {
      x = xMin + Math.random() * Math.max(xMax - xMin - PET_SIZE, 1);
      y = useBottomBand
        ? excl.yMax + Math.random() * Math.max(bottomBand - PET_SIZE, 1)
        : Math.random() * Math.max(topBand - PET_SIZE, 1);
    }
    const cx = x + PET_SIZE / 2;
    const cy = y + PET_SIZE / 2;
    if (cx < excl.xMin || cx > excl.xMax || cy < excl.yMin || cy > excl.yMax) {
      return { x, y };
    }
  }
  return { x: opts.side === "right" ? width - PET_SIZE : 0, y: height - PET_SIZE }; // safe fallback: a corner
}

// Wraps randomSafePoint with a minimum-distance requirement so a fresh
// journey reads as a real run across the hero rather than a short local
// hop -- takes the longest of a few candidate samples instead of the first
// "good enough" one. Dropping `side` here (used for the ball's throw
// target) is what lets a throw cross the full width, over to the other
// half of the hero, rather than always landing on the thrower's own side.
function pickWanderTarget(bounds: Bounds, from: { x: number; y: number }, opts: { side?: "left" | "right" } = {}) {
  const minDist = Math.max(bounds.width, bounds.height) * MIN_JOURNEY_FRAC;
  let best = randomSafePoint(bounds, opts);
  let bestDist = Math.hypot(best.x - from.x, best.y - from.y);
  for (let attempt = 0; attempt < 6 && bestDist < minDist; attempt++) {
    const candidate = randomSafePoint(bounds, opts);
    const dist = Math.hypot(candidate.x - from.x, candidate.y - from.y);
    if (dist > bestDist) {
      best = candidate;
      bestDist = dist;
    }
  }
  return best;
}

// True if any point along a quadratic Bezier (sampled, not solved exactly --
// plenty precise for a decorative background) falls inside the exclusion
// box. Endpoints are skipped since start/target are always pre-vetted safe
// by randomSafePoint; only the curve's middle is ever at risk.
function curveHitsBox(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, excl: ExclusionBox) {
  const steps = 8;
  for (let i = 1; i < steps; i++) {
    const p = bezierPoint(x0, y0, cx, cy, x1, y1, i / steps);
    if (p.x >= excl.xMin && p.x <= excl.xMax && p.y >= excl.yMin && p.y <= excl.yMax) return true;
  }
  return false;
}

// Starts a fresh curved journey from wherever the pet currently is toward
// `target`. The control point is offset perpendicular to the straight line
// between start and target by a randomized "bow," same idea as
// ScoutCompanion's own quadratic-Bezier walk paths -- this alone is most of
// why the movement reads as a natural running arc instead of a robotic
// straight-line glide.
//
// When start and target straddle the exclusion box, though, a small random
// bow will often still clip it -- and re-trying with another small random
// bow after the fact (the old approach: nudge position, then re-route) was
// no better, since almost any modest bow between two points on opposite
// sides of a big central box still crosses it. That's what caused a stuck
// pet to reset its journey every single tick, reading as a jittering
// teleport rather than actually going anywhere. So this checks the curve
// up front and, if it clips, swings the bow wide enough on whichever side
// clears the box -- widening further on each retry -- before ever handing
// back a journey to run.
function startJourney(pet: PetSim, target: { x: number; y: number }, bounds: Bounds, speedMult = 1) {
  const dx = target.x - pet.x;
  const dy = target.y - pet.y;
  const dist = Math.max(Math.hypot(dx, dy), 1);
  // perpendicular unit vector
  const px = -dy / dist;
  const py = dx / dist;
  const excl = bounds.excl;

  let midX = 0;
  let midY = 0;
  for (let attempt = 0; attempt < 5; attempt++) {
    let bow: number;
    if (attempt === 0) {
      bow = dist * (0.18 + Math.random() * 0.4) * (Math.random() < 0.5 ? 1 : -1);
    } else {
      // Widen on each retry, and pick the side that actually points away
      // from the box's center rather than guessing randomly again. Capped
      // relative to this journey's own distance -- otherwise a short hop
      // near the box (the thrower's tight home leash, in particular) could
      // get a detour sized off the box itself rather than the hop, curving
      // wildly far out of proportion to how far it's actually going.
      const clearance = Math.min(
        Math.max(excl.xMax - excl.xMin, excl.yMax - excl.yMin) / 2 + EXCLUSION_PAD + 20 * attempt,
        dist * 1.8
      );
      const boxCx = (excl.xMin + excl.xMax) / 2;
      const boxCy = (excl.yMin + excl.yMax) / 2;
      const midXStraight = (pet.x + target.x) / 2;
      const midYStraight = (pet.y + target.y) / 2;
      const towardBoxSign = px * (boxCx - midXStraight) + py * (boxCy - midYStraight);
      bow = towardBoxSign > 0 ? -clearance : clearance;
    }
    midX = (pet.x + target.x) / 2 + px * bow;
    midY = (pet.y + target.y) / 2 + py * bow;
    if (!curveHitsBox(pet.x, pet.y, midX, midY, target.x, target.y, excl)) break;
  }

  pet.startX = pet.x;
  pet.startY = pet.y;
  pet.curveX = midX;
  pet.curveY = midY;
  pet.targetX = target.x;
  pet.targetY = target.y;
  pet.t = 0;
  pet.speedMult = speedMult;
  pet.sprinting = Math.random() < SPRINT_CHANCE;
  const speed = pet.baseSpeed * speedMult * (pet.sprinting ? SPRINT_MULT : 1);
  // Sampled rather than a flat "1.2x the straight distance" fudge factor --
  // that approximation quietly broke once box-avoidance could pick a bow
  // much bigger than the straight distance (a short hop detouring around
  // the text box): the pet would then have far more actual curve to cover
  // than the duration accounted for, and had to race through it, reading
  // as a jump rather than a run.
  let arcLength = 0;
  let prevPoint = { x: pet.x, y: pet.y };
  for (let i = 1; i <= 10; i++) {
    const p = bezierPoint(pet.startX, pet.startY, midX, midY, target.x, target.y, i / 10);
    arcLength += Math.hypot(p.x - prevPoint.x, p.y - prevPoint.y);
    prevPoint = p;
  }
  pet.duration = Math.max(arcLength / speed, 0.25);
  pet.legIntervalMs = pet.sprinting ? 85 : 150;
}

export function HeroPets() {
  const [happy, setHappy] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const petRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ballElRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<PetSim[]>([]);
  const ballRef = useRef<BallSim>({
    phase: "hidden",
    fromX: 0,
    fromY: 0,
    toX: 0,
    toY: 0,
    x: 0,
    y: 0,
    t: 1,
    duration: 1,
    arcHeight: 0,
    landingPetX: 0,
    landingPetY: 0,
  });
  const fetchPhaseRef = useRef<"watching" | "out" | "back" | "pause">("out");
  const pauseMsRef = useRef(0);
  const [poses, setPoses] = useState<Pose[] | null>(null);

  useEffect(() => {
    function onCorrect() {
      setHappy(true);
      window.setTimeout(() => setHappy(false), 2400);
    }
    window.addEventListener("landing:correct", onCorrect);
    return () => window.removeEventListener("landing:correct", onCorrect);
  }, []);

  useLayoutEffect(() => {
    // Layout effect (not a plain effect) so initial positions are written
    // before the browser paints -- otherwise the pets would flash stacked
    // at the container's origin for one frame before their real spots land.
    const container = containerRef.current;
    if (!container) return;
    const bounds = measureBounds(container);
    if (!bounds) return;

    simRef.current = CAST_CONFIG.map((cfg) => {
      const start = randomSafePoint(bounds, { side: cfg.side });
      return {
        ...cfg,
        homeX: start.x,
        homeY: start.y,
        baseSpeed: 90 + Math.random() * 60,
        startX: start.x,
        startY: start.y,
        curveX: start.x,
        curveY: start.y,
        targetX: start.x,
        targetY: start.y,
        t: 1, // already "arrived" so the tick loop immediately rolls a real journey
        duration: 1,
        speedMult: 1,
        sprinting: false,
        x: start.x,
        y: start.y,
        facing: 1,
        legFrame: 0,
        legTimerMs: 0,
        legIntervalMs: 150,
        tailFrame: 0,
        tailDir: 1,
        bouncePhaseMs: Math.random() * 1000,
        carryingBall: cfg.role === "thrower",
      };
    });

    // The fetcher is excluded from the generic "roll a new journey on
    // arrival" loop below (its journeys are driven entirely by the fetch
    // state machine instead), so unlike every other pet it needs an actual
    // first journey seeded here -- otherwise, since it spawns already
    // "arrived" (t=1), the state machine's first tick would immediately
    // treat it as having reached a throw point it never actually ran to.
    const seedFetcher = simRef.current.find((p) => p.role === "fetcher");
    if (seedFetcher) {
      startJourney(seedFetcher, pickWanderTarget(bounds, seedFetcher, { side: seedFetcher.side }), bounds, 1.3);
    }
    fetchPhaseRef.current = "out";

    // Write the freshly-computed starting positions immediately, before the
    // first interval tick, so there's no one-frame flash of every pet
    // stacked at the container's origin.
    simRef.current.forEach((pet, i) => {
      const el = petRefs.current[i];
      if (el) el.style.transform = `translate(${pet.x}px, ${pet.y}px)`;
    });
    if (ballElRef.current) ballElRef.current.style.opacity = "0";

    let lastTime = performance.now();
    const positionInterval = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const pets = simRef.current;
      const thrower = pets.find((p) => p.role === "thrower");
      const fetcher = pets.find((p) => p.role === "fetcher");

      // Fetch state machine: the fetcher runs out to a thrown point, grabs
      // the ball, sprints it back to wherever the thrower currently is
      // (the thrower keeps drifting on its own short leash below, so this
      // is a real moving target, not a fixed spot), a quick handoff pause,
      // then goes again -- kept snappy (short pause, higher speed) so the
      // whole loop reads as eager rather than a slow errand.
      const ball = ballRef.current;
      if (thrower && fetcher) {
        if (fetchPhaseRef.current === "out" && fetcher.t >= 1) {
          fetcher.carryingBall = true;
          fetchPhaseRef.current = "back";
          startJourney(fetcher, { x: thrower.x, y: thrower.y }, bounds, 1.3);
          ball.phase = "hidden"; // picked up -- now lives invisibly in the fetcher's mouth again
        } else if (fetchPhaseRef.current === "back") {
          const dist = Math.hypot(fetcher.x - thrower.x, fetcher.y - thrower.y);
          if (dist < PET_SIZE * 0.7) {
            fetcher.carryingBall = false;
            thrower.carryingBall = true;
            fetchPhaseRef.current = "pause";
            pauseMsRef.current = 250 + Math.random() * 250;
          } else if (fetcher.t >= 1) {
            // The thrower keeps drifting on its own leash while the
            // fetcher runs the handoff leg, so the target set when "back"
            // began is a stale snapshot. Without this, a fetcher that
            // "arrives" just short of a thrower that has since wandered
            // off stalls there forever -- fetcher.t>=1 with role
            // "fetcher" is deliberately excluded from the generic
            // reroll-on-arrival loop below, since its journeys are meant
            // to be driven entirely from here. Re-aim at wherever the
            // thrower actually is now instead.
            startJourney(fetcher, { x: thrower.x, y: thrower.y }, bounds, 1.3);
          }
        } else if (fetchPhaseRef.current === "pause") {
          pauseMsRef.current -= dt * 1000;
          if (pauseMsRef.current <= 0) {
            thrower.carryingBall = false;
            // No `side` here -- unlike a wanderer's own roaming, a thrown
            // ball should be able to sail across to the other half of the
            // hero, not just land back on the thrower's own side.
            const t = pickWanderTarget(bounds, thrower);
            // The recipient (fetcher) doesn't move yet -- it only gives
            // chase once the ball actually lands (see the "watching" ->
            // "out" transition below), so the throw reads as sender ->
            // ball flight -> recipient reacts, not two dogs already
            // running in parallel with the throw.
            fetchPhaseRef.current = "watching";
            const ballOffset = PET_SIZE / 2 - BALL_SIZE / 2;
            ball.fromX = thrower.x + ballOffset;
            ball.fromY = thrower.y + ballOffset;
            ball.toX = t.x + ballOffset;
            ball.toY = t.y + ballOffset;
            ball.landingPetX = t.x;
            ball.landingPetY = t.y;
            ball.t = 0;
            // Flight time and arc height both scale with distance -- a
            // throw across the whole hero should visibly take longer and
            // climb higher than a short toss, instead of both covering
            // their distance in the same fixed blink.
            const throwDist = Math.hypot(ball.toX - ball.fromX, ball.toY - ball.fromY);
            ball.duration = Math.min(Math.max(throwDist / BALL_SPEED, BALL_MIN_FLIGHT_S), BALL_MAX_FLIGHT_S);
            ball.arcHeight = Math.min(throwDist * BALL_ARC_FRAC, BALL_MAX_ARC);
            ball.phase = "flying";
          }
        }
      }

      if (ball.phase === "flying") {
        ball.t = Math.min(ball.t + dt / ball.duration, 1);
        const arc = Math.sin(ball.t * Math.PI) * ball.arcHeight;
        ball.x = ball.fromX + (ball.toX - ball.fromX) * ball.t;
        ball.y = ball.fromY + (ball.toY - ball.fromY) * ball.t - arc;
        if (ball.t >= 1) {
          ball.phase = "ground";
          ball.x = ball.toX;
          ball.y = ball.toY;
          // The ball has landed -- only now does the recipient start
          // running toward its actual resting spot.
          if (fetcher && fetchPhaseRef.current === "watching") {
            fetchPhaseRef.current = "out";
            startJourney(fetcher, { x: ball.landingPetX, y: ball.landingPetY }, bounds, 1.3);
          }
        }
      }

      for (const pet of pets) {
        // Roll a fresh journey on arrival. Wanderers pick anywhere safe on
        // their side; the thrower stays on a short leash around its own
        // spawn point so it reads as "home base," not frozen in place, and
        // the fetcher's journeys are driven entirely by the state machine
        // above instead.
        if (pet.t >= 1 && pet.role !== "fetcher") {
          const next =
            pet.role === "thrower"
              ? randomSafePoint(bounds, { near: { x: pet.homeX, y: pet.homeY, radius: HOME_LEASH } })
              : pickWanderTarget(bounds, pet, { side: pet.side });
          startJourney(pet, next, bounds);
        }

        pet.t = Math.min(pet.t + dt / pet.duration, 1);
        const eased = easeInOutCubic(pet.t);
        const sample = bezierPoint(pet.startX, pet.startY, pet.curveX, pet.curveY, pet.targetX, pet.targetY, eased);
        const prevX = pet.x;
        pet.x = sample.x;
        pet.y = sample.y;

        const moving = pet.t < 1;
        if (moving) {
          if (Math.abs(pet.x - prevX) > 0.3) pet.facing = pet.x > prevX ? 1 : -1;
          pet.legTimerMs += dt * 1000;
          if (pet.legTimerMs > pet.legIntervalMs) {
            pet.legTimerMs = 0;
            pet.legFrame = pet.legFrame === 0 ? 1 : 0;
          }
          // Clamp (not just detect-and-reverse) since a sprinting +2 step
          // can overshoot the valid 0-5 range in one tick -- an unclamped
          // out-of-range value crashes PixelDog's tail-frame lookup.
          pet.tailFrame += pet.tailDir * (pet.sprinting ? 2 : 1);
          if (pet.tailFrame >= 5) {
            pet.tailFrame = 5;
            pet.tailDir = -1;
          } else if (pet.tailFrame <= 0) {
            pet.tailFrame = 0;
            pet.tailDir = 1;
          }
          pet.bouncePhaseMs += dt * 1000 * (pet.sprinting ? 1.6 : 1);
        } else {
          pet.legFrame = 0;
        }

        // A pet's curved path can still clip the exclusion box on an
        // unlucky bow. Nudging x/y alone isn't enough: next tick's sample
        // comes straight back from the untouched Bezier curve (startX/
        // curveX/targetX), so the pet would snap right back onto the old
        // path -- a visible teleport-in-place every frame it's inside the
        // box. Forcing the journey to "arrived" (t=1) instead -- the
        // previous fix -- traded that for a worse bug: for the fetcher/
        // thrower, arrival is what the fetch state machine watches to
        // decide "caught the ball" / "back home," so an exclusion nudge
        // could fire that a tick early from an unrelated edge position,
        // hijacking the state machine (ball vanishing before the fetcher
        // visibly reached it, fetcher lurching off toward the thrower from
        // wherever the nudge happened to land it) -- which itself reads as
        // teleporting. Re-curving toward the *same* target instead keeps
        // the state machine's notion of "arrived" meaningful: the pet just
        // takes a fresh, differently-bowed path the rest of the way there.
        const excl = bounds.excl;
        const cx = pet.x + PET_SIZE / 2;
        const cy = pet.y + PET_SIZE / 2;
        if (cx >= excl.xMin && cx <= excl.xMax && cy >= excl.yMin && cy <= excl.yMax) {
          const distLeft = cx - excl.xMin;
          const distRight = excl.xMax - cx;
          const distTop = cy - excl.yMin;
          const distBottom = excl.yMax - cy;
          const min = Math.min(distLeft, distRight, distTop, distBottom);
          if (min === distLeft) pet.x = excl.xMin - PET_SIZE / 2 - 2;
          else if (min === distRight) pet.x = excl.xMax - PET_SIZE / 2 + 2;
          else if (min === distTop) pet.y = excl.yMin - PET_SIZE / 2 - 2;
          else pet.y = excl.yMax - PET_SIZE / 2 + 2;
          startJourney(pet, { x: pet.targetX, y: pet.targetY }, bounds, pet.speedMult);
        }
      }

      pets.forEach((pet, i) => {
        const el = petRefs.current[i];
        if (!el) return;
        const bounceY = pet.t < 1 ? -Math.abs(Math.sin(pet.bouncePhaseMs * BOUNCE_FREQ)) * BOUNCE_AMP : 0;
        el.style.transform = `translate(${pet.x}px, ${pet.y + bounceY}px)`;
      });

      const ballEl = ballElRef.current;
      if (ballEl) {
        if (ball.phase === "hidden") {
          ballEl.style.opacity = "0";
        } else {
          ballEl.style.opacity = "1";
          ballEl.style.transform = `translate(${ball.x}px, ${ball.y}px)`;
        }
      }
    }, POSITION_TICK_MS);

    const poseInterval = window.setInterval(() => {
      setPoses(
        simRef.current.map((p) => ({
          facing: p.facing,
          legFrame: p.legFrame,
          tailFrame: p.tailFrame,
          carryingBall: p.carryingBall,
        }))
      );
    }, POSE_TICK_MS);

    return () => {
      window.clearInterval(positionInterval);
      window.clearInterval(poseInterval);
    };
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {CAST_CONFIG.map((cfg, i) => {
        const pose = poses?.[i];
        return (
          <div
            key={i}
            ref={(el) => {
              petRefs.current[i] = el;
            }}
            className="absolute top-0 left-0 will-change-transform"
          >
            <PixelDog
              size={PET_SIZE}
              variant={cfg.variant}
              costume={cfg.costume}
              facing={pose?.facing ?? 1}
              legFrame={pose?.legFrame ?? 0}
              tailFrame={(pose?.tailFrame ?? 0) as 0 | 1 | 2 | 3 | 4 | 5}
              carryingBall={pose?.carryingBall ?? cfg.role === "thrower"}
              mood={happy ? "happy" : "neutral"}
            />
          </div>
        );
      })}
      {/* the loose ball itself -- visible only mid-air on the throw and
          while it waits on the ground for the fetcher; hidden the rest of
          the time since it's otherwise drawn in whichever dog's mouth has
          it (PixelDog's own carryingBall rendering). Same tennis-ball
          colors/seam as that mouth-held version for visual continuity. */}
      <div ref={ballElRef} className="absolute top-0 left-0 will-change-transform" style={{ opacity: 0 }}>
        <svg width={BALL_SIZE} height={BALL_SIZE} viewBox="0 0 16 16">
          <circle cx={8} cy={8} r={6.5} fill="#cddc39" />
          <path d="M 2 8 Q 8 3 14 8" stroke="#eef5c0" strokeWidth={1.1} fill="none" strokeLinecap="round" />
          <path d="M 2 8 Q 8 13 14 8" stroke="#eef5c0" strokeWidth={1.1} fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
