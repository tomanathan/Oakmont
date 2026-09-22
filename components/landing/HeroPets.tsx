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
// own walk paths, not a reuse of that component) sampled at an eased
// progress, with a small randomized "wobble" control-point offset -- just
// enough organic waver to not look like a ruler-straight glide, not the
// dramatic swooping bow an earlier version used, which read as unnatural
// cornering. A vertical bounce riding on top of that (tied to the leg-swap
// timer) reads as an actual trot/sprint, and journeys randomly roll a
// "sprinting" burst at higher speed for real zoomies energy. Every pet
// pauses for a randomized beat after each leg before rolling the next one
// (see PAUSE_MS_MIN/MAX) so wandering reads as a dog actually deciding
// where to go next, not a metronome. Position is written straight to each
// pet's DOM node via a ref on a `setInterval` tick, never through React
// state -- the slower-changing *pose* props PixelDog actually needs as
// React props (legFrame, facing, carryingBall) update on their own, much
// coarser interval instead.
//
// A journey's start and target are always pre-vetted clear of the
// exclusion box around the hero's headline text, but the straight line
// between them isn't -- if it would cut through the box, the pet first
// routes via whichever box corner costs the least detour (see
// bestWaypoint) before continuing on to the real destination, rather than
// hoping a curved bow happens to swing wide enough. See journeyDone for
// how the rest of this file tells "reached a waypoint" apart from "truly
// arrived."
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
  targetX: number; // this LEG's endpoint -- may be an intermediate waypoint, see finalTargetX/Y
  targetY: number;
  finalTargetX: number; // the actual destination; equal to targetX/Y unless routing around the exclusion box
  finalTargetY: number;
  t: number;
  duration: number;
  sprinting: boolean;
  speedMult: number; // the multiplier the current journey started with, so a continuation/re-route can keep the same pace
  pauseMs: number; // -1 = not yet rolled for this arrival, >0 = idling before the next move, 0 = ready to go
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
  bouncesLeft: number; // secondary bounces still to play before the ball actually settles
  bounceDirX: number; // unit direction of the original throw, reused for every bounce's residual forward drift
  bounceDirY: number;
  landingPetX: number; // the pre-offset point the fetcher should path to once this ball settles (see BALL_OFFSET)
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
const BALL_OFFSET = PET_SIZE / 2 - BALL_SIZE / 2; // centers the ball within a pet's box, for both the throw and every bounce afterward
const BALL_BOUNCE_COUNT = 2; // secondary bounces after the main throw arc, before the ball actually settles
const BALL_BOUNCE_DECAY = 0.42; // each bounce's height, duration, and forward drift are this fraction of the previous one's
const EXCLUSION_PAD = 22;
const TOP_MARGIN = 20; // keeps pets clear of the very top edge (right below the sticky nav bar); already padded for the hop bounce below, which can lift the rendered position further up than a pet's own logical y
const WAYPOINT_MARGIN = 26; // clearance a routed-around waypoint keeps outside the exclusion box
const WOBBLE_FRAC_MIN = 0.04; // a small organic wave, not the old dramatic swooping bow -- reads as a real run, not cornering
const WOBBLE_FRAC_MAX = 0.12;
const PAUSE_MS_MIN = 300; // a beat between moves so wandering doesn't read as a metronome
const PAUSE_MS_MAX = 1600;
// Region weights for where a wander target lands: the open margins beside
// the text read much better than pets camping right under the nav bar, so
// side space is favored well above the top band (bottom is in between --
// nothing asked to change it, just kept less dominant than the sides).
const REGION_WEIGHT_SIDE = 0.6;
const REGION_WEIGHT_TOP = 0.12;
const REGION_WEIGHT_BOTTOM = 0.28;
const HOME_LEASH = 90; // how far the thrower is allowed to drift from its spawn point
const MIN_JOURNEY_FRAC = 0.25; // a fresh journey should cover at least this fraction of the hero's larger dimension -- kept modest since the exclusion box can leave only narrow margins to move through
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

  if (opts.near) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * opts.near.radius;
      const x = Math.min(Math.max(opts.near.x + Math.cos(angle) * r, 0), width - PET_SIZE);
      const y = Math.min(Math.max(opts.near.y + Math.sin(angle) * r, TOP_MARGIN), height - PET_SIZE);
      const cx = x + PET_SIZE / 2;
      const cy = y + PET_SIZE / 2;
      if (cx < excl.xMin || cx > excl.xMax || cy < excl.yMin || cy > excl.yMax) {
        return { x, y };
      }
    }
    return { x: opts.side === "right" ? width - PET_SIZE : 0, y: height - PET_SIZE };
  }

  // Three candidate regions within this side's x-range: the open margins
  // beside the text (outside its x-extent entirely, so any y is safe --
  // there can be one such margin on each edge of the hero, hence two
  // ranges), the band above the text, and the band below it. Weighted so
  // the sides dominate rather than pets camping right under the sticky
  // nav bar at the very top. TOP_MARGIN keeps the top band (and the side
  // margins' own y-range) from starting flush against that top edge.
  const sideRanges: { from: number; to: number }[] = [];
  const leftMarginTo = Math.min(xMax, excl.xMin);
  if (leftMarginTo - xMin > PET_SIZE) sideRanges.push({ from: xMin, to: leftMarginTo });
  const rightMarginFrom = Math.max(xMin, excl.xMax);
  if (xMax - rightMarginFrom > PET_SIZE) sideRanges.push({ from: rightMarginFrom, to: xMax });
  const sideWidth = sideRanges.reduce((sum, r) => sum + (r.to - r.from), 0);

  const topBand = Math.max(excl.yMin - TOP_MARGIN, 0);
  const bottomBand = Math.max(height - excl.yMax, 0);

  const canSide = sideWidth > PET_SIZE;
  const canTop = topBand > PET_SIZE;
  const canBottom = bottomBand > PET_SIZE;

  type Region = "side" | "top" | "bottom";
  const weighted: [Region, number][] = [];
  if (canSide) weighted.push(["side", REGION_WEIGHT_SIDE]);
  if (canTop) weighted.push(["top", REGION_WEIGHT_TOP]);
  if (canBottom) weighted.push(["bottom", REGION_WEIGHT_BOTTOM]);
  const totalWeight = weighted.reduce((sum, [, w]) => sum + w, 0);
  let region: Region = "bottom";
  if (weighted.length > 0) {
    let roll = Math.random() * totalWeight;
    region = weighted[weighted.length - 1][0];
    for (const [r, w] of weighted) {
      if (roll < w) {
        region = r;
        break;
      }
      roll -= w;
    }
  }

  for (let attempt = 0; attempt < 20; attempt++) {
    let x: number;
    let y: number;
    if (region === "side" && sideRanges.length > 0) {
      let pick = Math.random() * sideWidth;
      let chosen = sideRanges[0];
      for (const range of sideRanges) {
        const rangeWidth = range.to - range.from;
        if (pick < rangeWidth) {
          chosen = range;
          break;
        }
        pick -= rangeWidth;
      }
      x = chosen.from + Math.random() * Math.max(chosen.to - chosen.from - PET_SIZE, 1);
      y = TOP_MARGIN + Math.random() * Math.max(height - TOP_MARGIN - PET_SIZE, 1);
    } else if (region === "top") {
      x = xMin + Math.random() * Math.max(xMax - xMin - PET_SIZE, 1);
      y = TOP_MARGIN + Math.random() * Math.max(topBand - PET_SIZE, 1);
    } else {
      x = xMin + Math.random() * Math.max(xMax - xMin - PET_SIZE, 1);
      y = excl.yMax + Math.random() * Math.max(bottomBand - PET_SIZE, 1);
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
// hop -- gathers a handful of candidate samples rather than settling for
// the first "good enough" one. Dropping `side` here (used for the ball's
// throw target) is what lets a throw cross the full width, over to the
// other half of the hero, rather than always landing on the thrower's
// own side.
//
// `avoid` (other pets' current positions) is the lowest-priority factor
// here, deliberately: it only ever picks among candidates that already
// clear the text box and the minimum-distance bar above, choosing
// whichever of those keeps the most room from every other pet. It never
// relaxes or overrides those two -- personal space loses to both the
// text and (for the ball's own target selection) the throw itself.
function pickWanderTarget(
  bounds: Bounds,
  from: { x: number; y: number },
  opts: { side?: "left" | "right"; avoid?: { x: number; y: number }[] } = {}
) {
  const minDist = Math.max(bounds.width, bounds.height) * MIN_JOURNEY_FRAC;
  const candidates: { x: number; y: number }[] = [];
  for (let attempt = 0; attempt < 7; attempt++) {
    candidates.push(randomSafePoint(bounds, opts));
  }

  const longEnough = candidates.filter((c) => Math.hypot(c.x - from.x, c.y - from.y) >= minDist);
  const pool = longEnough.length > 0 ? longEnough : candidates;

  const avoid = opts.avoid;
  if (avoid && avoid.length > 0) {
    let best = pool[0];
    let bestSpacing = -Infinity;
    for (const c of pool) {
      const spacing = Math.min(...avoid.map((o) => Math.hypot(c.x - o.x, c.y - o.y)));
      if (spacing > bestSpacing) {
        bestSpacing = spacing;
        best = c;
      }
    }
    return best;
  }

  let best = pool[0];
  let bestDist = Math.hypot(best.x - from.x, best.y - from.y);
  for (const c of pool) {
    const dist = Math.hypot(c.x - from.x, c.y - from.y);
    if (dist > bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return best;
}

// True if any point along a quadratic Bezier (sampled, not solved exactly --
// plenty precise for a decorative background) falls inside the exclusion
// box. Endpoints are skipped since start/target are always pre-vetted safe
// by randomSafePoint; only the curve's middle is ever at risk.
//
// x0/y0/cx/cy/x1/y1 are all in the pet's top-left convention (same as
// pet.x/pet.y everywhere else), but collision is checked against the
// pet's *center* -- consistent with randomSafePoint's own rejection test
// and the mid-tick safety net below. Missing that PET_SIZE/2 offset here
// used to mean this function could wave a curve through as "safe" while
// the (correctly center-based) safety net immediately disagreed on the
// very next tick, re-triggering it and resetting the journey before it
// ever covered real ground -- the exact stuck-jittering bug this exists
// to prevent, just reintroduced by a units mismatch instead of a bad bow.
function curveHitsBox(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, excl: ExclusionBox) {
  const steps = 8;
  for (let i = 1; i < steps; i++) {
    const p = bezierPoint(x0, y0, cx, cy, x1, y1, i / steps);
    const px = p.x + PET_SIZE / 2;
    const py = p.y + PET_SIZE / 2;
    if (px >= excl.xMin && px <= excl.xMax && py >= excl.yMin && py <= excl.yMax) return true;
  }
  return false;
}

// Picks whichever corner of the exclusion box (pushed out by `margin` plus
// half a pet's width -- corners are in top-left convention but clearance
// is a center-to-box distance, same as curveHitsBox -- then clamped into
// the hero) costs the least combined detour for a trip from `from` to
// `target` that has to go around the box. Routing through an explicit,
// real waypoint like this -- rather than hoping a big curved bow happens
// to swing wide enough -- is what actually gets a pet fully clear of the
// box before it changes direction again. The old bow-only approach could
// leave a pet hugging the box's edge, re-clipping it on almost every
// attempt when start and target straddled it; that read as the pet
// getting stuck jittering in a "tunnel" right along the text.
function bestWaypoint(from: { x: number; y: number }, target: { x: number; y: number }, bounds: Bounds, margin: number) {
  const { excl, width, height } = bounds;
  const clear = margin + PET_SIZE / 2;
  const rawCorners = [
    { x: excl.xMin - clear, y: excl.yMin - clear },
    { x: excl.xMax + clear, y: excl.yMin - clear },
    { x: excl.xMin - clear, y: excl.yMax + clear },
    { x: excl.xMax + clear, y: excl.yMax + clear },
  ];
  const corners = rawCorners.map((c) => ({
    x: Math.min(Math.max(c.x, 0), width - PET_SIZE),
    y: Math.min(Math.max(c.y, TOP_MARGIN), height - PET_SIZE),
  }));

  // Prefer a corner whose OWN straight line onward to the final target is
  // clear -- picking purely by total distance can choose a corner that
  // still needs its own detour, and since the closest corner FROM there
  // can turn out to be the one we just left, two corners on opposite
  // sides of the box can each look cheapest from the other's position,
  // and the pet ping-pongs between them forever without ever reaching
  // the target. Falling back to plain distance only when no corner's
  // second leg is clear (rare enough not to be worth solving further).
  const viable = corners.filter(
    (c) => !curveHitsBox(c.x, c.y, (c.x + target.x) / 2, (c.y + target.y) / 2, target.x, target.y, excl)
  );
  const candidates = viable.length > 0 ? viable : corners;

  let best = candidates[0];
  let bestCost = Infinity;
  for (const c of candidates) {
    const cost = Math.hypot(from.x - c.x, from.y - c.y) + Math.hypot(target.x - c.x, target.y - c.y);
    if (cost < bestCost) {
      bestCost = cost;
      best = c;
    }
  }
  return best;
}

// True once a pet has actually reached its real destination -- as opposed
// to merely finishing the current leg, which might be an intermediate
// waypoint routed around the exclusion box. Everything outside this file's
// tick loop (the fetch state machine, the generic wander reroll) should
// only ever treat `journeyDone` as "arrived"; a bare `pet.t >= 1` can mean
// "just reached the waypoint, one more leg to go."
function journeyDone(pet: PetSim) {
  return pet.t >= 1 && pet.targetX === pet.finalTargetX && pet.targetY === pet.finalTargetY;
}

// Starts a fresh journey from wherever the pet currently is toward
// `finalTarget`. If the direct line between them would cut through the
// exclusion box, this first routes via whichever box corner costs the
// least detour (see bestWaypoint) -- the tick loop's continuation check
// automatically starts the second leg once the waypoint is reached, using
// the same speedMult so pace doesn't change mid-route.
//
// Each leg gets a small, randomized organic wobble (not the old dramatic
// swooping bow, which read as unnatural race-car cornering on what should
// look like a dog just running somewhere) via a quadratic Bezier control
// point offset perpendicular to the leg's straight line -- same idea
// ScoutCompanion.tsx uses for its own walk paths, just with a much
// subtler magnitude. On the rare chance even that small wobble clips the
// box, it flattens to a straight line for this leg rather than escalating
// -- a straight line between two already-safe points essentially never
// clips a box neither of them is inside.
function startJourney(pet: PetSim, finalTarget: { x: number; y: number }, bounds: Bounds, speedMult = 1) {
  const excl = bounds.excl;
  pet.finalTargetX = finalTarget.x;
  pet.finalTargetY = finalTarget.y;

  const straightHits = curveHitsBox(
    pet.x,
    pet.y,
    (pet.x + finalTarget.x) / 2,
    (pet.y + finalTarget.y) / 2,
    finalTarget.x,
    finalTarget.y,
    excl
  );
  const legTarget = straightHits ? bestWaypoint(pet, finalTarget, bounds, WAYPOINT_MARGIN) : finalTarget;

  const dx = legTarget.x - pet.x;
  const dy = legTarget.y - pet.y;
  const dist = Math.max(Math.hypot(dx, dy), 1);
  const px = -dy / dist;
  const py = dx / dist;

  let bow = dist * (WOBBLE_FRAC_MIN + Math.random() * (WOBBLE_FRAC_MAX - WOBBLE_FRAC_MIN)) * (Math.random() < 0.5 ? 1 : -1);
  let midX = (pet.x + legTarget.x) / 2 + px * bow;
  let midY = (pet.y + legTarget.y) / 2 + py * bow;
  if (curveHitsBox(pet.x, pet.y, midX, midY, legTarget.x, legTarget.y, excl)) {
    bow = 0;
    midX = (pet.x + legTarget.x) / 2;
    midY = (pet.y + legTarget.y) / 2;
  }

  pet.startX = pet.x;
  pet.startY = pet.y;
  pet.curveX = midX;
  pet.curveY = midY;
  pet.targetX = legTarget.x;
  pet.targetY = legTarget.y;
  pet.t = 0;
  pet.speedMult = speedMult;
  pet.sprinting = Math.random() < SPRINT_CHANCE;
  const speed = pet.baseSpeed * speedMult * (pet.sprinting ? SPRINT_MULT : 1);
  // Sampled arc length rather than a flat straight-distance fudge factor,
  // so speed stays consistent regardless of how much a leg's wobble (or a
  // waypoint detour) makes the actual curve longer than the straight line.
  let arcLength = 0;
  let prevPoint = { x: pet.x, y: pet.y };
  for (let i = 1; i <= 10; i++) {
    const p = bezierPoint(pet.startX, pet.startY, midX, midY, legTarget.x, legTarget.y, i / 10);
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
    bouncesLeft: 0,
    bounceDirX: 0,
    bounceDirY: 0,
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
        finalTargetX: start.x,
        finalTargetY: start.y,
        t: 1, // already "arrived" (journeyDone) so the tick loop rolls a real journey after one pause
        duration: 1,
        speedMult: 1,
        pauseMs: -1,
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

      // A pet whose current leg just finished but isn't actually at its
      // real destination yet has only reached an intermediate waypoint
      // (routed around the exclusion box) -- immediately continue on to
      // the final target, before anything below ever observes `t >= 1` as
      // "arrived." Without this, the fetch state machine's own arrival
      // checks further down could fire a leg early, off the waypoint
      // rather than the ball/thrower's actual position.
      for (const pet of pets) {
        if (pet.t >= 1 && !journeyDone(pet)) {
          startJourney(pet, { x: pet.finalTargetX, y: pet.finalTargetY }, bounds, pet.speedMult);
        }
      }

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
            // hero, not just land back on the thrower's own side. `avoid`
            // still only breaks ties among otherwise-valid landing spots,
            // so it can't steer the ball away from a legitimately good
            // throw just because another pet happens to be nearby.
            const t = pickWanderTarget(bounds, thrower, {
              avoid: pets.filter((p) => p !== thrower).map((p) => ({ x: p.x, y: p.y })),
            });
            // The recipient (fetcher) doesn't move yet -- it only gives
            // chase once the ball actually lands (see the "watching" ->
            // "out" transition below), so the throw reads as sender ->
            // ball flight -> recipient reacts, not two dogs already
            // running in parallel with the throw.
            fetchPhaseRef.current = "watching";
            ball.fromX = thrower.x + BALL_OFFSET;
            ball.fromY = thrower.y + BALL_OFFSET;
            ball.toX = t.x + BALL_OFFSET;
            ball.toY = t.y + BALL_OFFSET;
            ball.t = 0;
            // Flight time and arc height both scale with distance -- a
            // throw across the whole hero should visibly take longer and
            // climb higher than a short toss, instead of both covering
            // their distance in the same fixed blink.
            const throwDist = Math.hypot(ball.toX - ball.fromX, ball.toY - ball.fromY);
            ball.duration = Math.min(Math.max(throwDist / BALL_SPEED, BALL_MIN_FLIGHT_S), BALL_MAX_FLIGHT_S);
            ball.arcHeight = Math.min(throwDist * BALL_ARC_FRAC, BALL_MAX_ARC);
            // Direction is reused for every bounce's residual forward
            // drift after landing -- a real thrown ball doesn't stop dead
            // on impact, it keeps skidding forward a bit, decaying with
            // each bounce.
            ball.bounceDirX = (ball.toX - ball.fromX) / Math.max(throwDist, 1);
            ball.bounceDirY = (ball.toY - ball.fromY) / Math.max(throwDist, 1);
            ball.bouncesLeft = BALL_BOUNCE_COUNT;
            // landingPetX/Y (the fetcher's eventual target) starts as the
            // main arc's landing spot, but gets pushed forward again after
            // each bounce below to track wherever the ball actually ends
            // up once it fully settles.
            ball.landingPetX = t.x;
            ball.landingPetY = t.y;
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
          if (ball.bouncesLeft > 0) {
            // Reuses this same from/to/arc/duration flight machinery for
            // each bounce, just decaying every quantity -- height,
            // duration, and how far it skids forward -- by the same
            // factor each time, so the bounces quickly settle down
            // instead of repeating identically forever.
            const landX = ball.toX;
            const landY = ball.toY;
            const drift = Math.hypot(ball.toX - ball.fromX, ball.toY - ball.fromY) * BALL_BOUNCE_DECAY;
            ball.bouncesLeft -= 1;
            ball.arcHeight *= BALL_BOUNCE_DECAY;
            ball.duration = Math.max(ball.duration * BALL_BOUNCE_DECAY, 0.12);
            ball.fromX = landX;
            ball.fromY = landY;

            // A bounce's residual drift keeps skidding in the throw's own
            // direction, which can carry it past the hero's edge on a
            // throw that happened to land close to one side -- clamp it
            // back into bounds rather than letting it sail offscreen.
            const nextToX = landX + ball.bounceDirX * drift;
            const nextToY = landY + ball.bounceDirY * drift;
            ball.toX = Math.min(Math.max(nextToX, 0), bounds.width - BALL_SIZE);
            ball.toY = Math.min(Math.max(nextToY, 0), bounds.height - BALL_SIZE);
            ball.landingPetX = ball.toX - BALL_OFFSET;
            ball.landingPetY = ball.toY - BALL_OFFSET;
            ball.t = 0;
          } else {
            ball.phase = "ground";
            ball.x = ball.toX;
            ball.y = ball.toY;
            // The ball has fully settled -- only now does the recipient
            // start running toward its actual resting spot.
            if (fetcher && fetchPhaseRef.current === "watching") {
              fetchPhaseRef.current = "out";
              startJourney(fetcher, { x: ball.landingPetX, y: ball.landingPetY }, bounds, 1.3);
            }
          }
        }
      }

      for (const pet of pets) {
        // Roll a fresh journey once truly arrived (not just at a waypoint)
        // -- but only after a randomized pause, not the instant it stops.
        // Immediately launching the next leg is what made wandering read
        // as a metronome; a real dog pauses, sniffs, decides, then goes.
        // Wanderers pick anywhere safe on their side; the thrower stays on
        // a short leash around its own spawn point so it reads as "home
        // base," not frozen in place; the fetcher's journeys are driven
        // entirely by the state machine above instead.
        if (journeyDone(pet) && pet.role !== "fetcher") {
          if (pet.pauseMs < 0) {
            pet.pauseMs = PAUSE_MS_MIN + Math.random() * (PAUSE_MS_MAX - PAUSE_MS_MIN);
          } else if (pet.pauseMs > 0) {
            // Clamped at 0, not left to run negative -- otherwise the next
            // tick would read it as the -1 "not yet decided" sentinel and
            // re-roll a brand new pause forever instead of ever reaching
            // the "ready" branch below, leaving the pet stuck standing
            // still indefinitely.
            pet.pauseMs = Math.max(pet.pauseMs - dt * 1000, 0);
          } else {
            const next =
              pet.role === "thrower"
                ? randomSafePoint(bounds, { near: { x: pet.homeX, y: pet.homeY, radius: HOME_LEASH } })
                : pickWanderTarget(bounds, pet, {
                    side: pet.side,
                    avoid: pets.filter((p) => p !== pet).map((p) => ({ x: p.x, y: p.y })),
                  });
            startJourney(pet, next, bounds);
            pet.pauseMs = -1;
          }
        }

        pet.t = Math.min(pet.t + dt / pet.duration, 1);
        const eased = easeInOutCubic(pet.t);
        const sample = bezierPoint(pet.startX, pet.startY, pet.curveX, pet.curveY, pet.targetX, pet.targetY, eased);
        const prevX = pet.x;
        pet.x = sample.x;
        pet.y = sample.y;
        // Defensive clamp regardless of what the curve produced -- start/
        // target/waypoints are all pre-vetted safe, but a wobble offset
        // near an edge could still sample a few px past it. The top edge
        // matters most: it sits right against the sticky nav bar above
        // the hero, so keep a firm gap there rather than risk a pet
        // visually brushing up against it.
        pet.x = Math.min(Math.max(pet.x, 0), bounds.width - PET_SIZE);
        pet.y = Math.min(Math.max(pet.y, TOP_MARGIN), bounds.height - PET_SIZE);

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

        // Safety net, not the primary defense: startJourney now checks its
        // curve against the box up front and routes around it via a real
        // waypoint (see bestWaypoint), so this should rarely fire. It stays
        // as a backstop for anything that still slips through -- nudge back
        // out along the nearest edge, then re-plan the rest of the trip
        // from here toward the pet's real final target (not just its
        // current leg's endpoint, which could itself have been a waypoint).
        const excl = bounds.excl;
        const cx = pet.x + PET_SIZE / 2;
        const cy = pet.y + PET_SIZE / 2;
        if (cx >= excl.xMin && cx <= excl.xMax && cy >= excl.yMin && cy <= excl.yMax) {
          const distLeft = cx - excl.xMin;
          const distRight = excl.xMax - cx;
          const distTop = cy - excl.yMin;
          const distBottom = excl.yMax - cy;
          // A real gap, not just barely-technically-clear -- pushing out
          // by only a couple px left the very next tick's small wobble
          // free to tip straight back in, re-triggering this every frame
          // near the edge instead of actually resolving it.
          const min = Math.min(distLeft, distRight, distTop, distBottom);
          const clear = EXCLUSION_PAD / 2;
          if (min === distLeft) pet.x = excl.xMin - PET_SIZE / 2 - clear;
          else if (min === distRight) pet.x = excl.xMax - PET_SIZE / 2 + clear;
          else if (min === distTop) pet.y = excl.yMin - PET_SIZE / 2 - clear;
          else pet.y = excl.yMax - PET_SIZE / 2 + clear;
          startJourney(pet, { x: pet.finalTargetX, y: pet.finalTargetY }, bounds, pet.speedMult);
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
