"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PixelDog } from "@/components/PixelDog";

// Purely decorative: a small cast of PixelDog instances that wander,
// run, and (two of them) play fetch with each other around the hero. These
// are NOT the live ScoutCompanion/SecondCompanion -- no pet-state fetch, no
// session needed, which is exactly right for a visitor who hasn't signed
// up yet.
//
// Movement technique borrowed from ScoutCompanion.tsx's own proven
// approach (not a reuse of that component itself -- no cursor-avoidance or
// text-overlap detection needed here, just the core idea): position is
// written straight to each pet's DOM node via a ref on a `setInterval` tick,
// never through React state, so 20fps wandering for five pets doesn't mean
// five re-renders a frame. The slower-changing *pose* props that PixelDog
// actually needs as React props (legFrame, facing, carryingBall) update on
// their own, much coarser interval instead.
//
// Mood switches to "happy" for a beat when the sample question below is
// answered correctly (see SampleQuestion.tsx's "landing:correct" dispatch).
//
// Deliberately does NOT respect prefers-reduced-motion -- an explicit,
// informed choice for this specific decorative cast (not an oversight):
// continuously-wandering animation is a real trigger for some users'
// motion sensitivity, and that tradeoff was raised directly, but the
// product call here is that these pets should always be lively regardless
// of that OS/browser setting.

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
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  facing: 1 | -1;
  legFrame: 0 | 1;
  legTimerMs: number;
  tailFrame: number;
  tailDir: 1 | -1;
  carryingBall: boolean;
}

interface Pose {
  facing: 1 | -1;
  legFrame: 0 | 1;
  tailFrame: number;
  carryingBall: boolean;
}

const CAST_CONFIG: { variant: Variant; costume: string | null; role: Role; side: "left" | "right" }[] = [
  { variant: "ozho", costume: "sunglasses", role: "wander", side: "left" },
  { variant: "mochi", costume: "scarf", role: "wander", side: "right" },
  { variant: "ozho", costume: null, role: "wander", side: "right" },
  { variant: "ozho", costume: "bowtie", role: "thrower", side: "left" },
  { variant: "mochi", costume: null, role: "fetcher", side: "left" },
];

const POSITION_TICK_MS = 50;
const POSE_TICK_MS = 160;
const ARRIVE_DIST = 8;
const PET_SIZE = 44;
const EXCLUSION_PAD = 22;

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
// one horizontal half, so a fetch run stays a confined back-and-forth
// rather than a diagonal sprint across the whole hero) that doesn't fall
// inside the exclusion box.
function randomSafePoint(bounds: Bounds, side?: "left" | "right") {
  const { width, height, excl } = bounds;
  const xMin = side === "right" ? width / 2 : 0;
  const xMax = side === "left" ? width / 2 : width;
  const spanX = Math.max(xMax - xMin - PET_SIZE, 1);
  const spanY = Math.max(height - PET_SIZE, 1);
  for (let attempt = 0; attempt < 20; attempt++) {
    const x = xMin + Math.random() * spanX;
    const y = Math.random() * spanY;
    const cx = x + PET_SIZE / 2;
    const cy = y + PET_SIZE / 2;
    if (cx < excl.xMin || cx > excl.xMax || cy < excl.yMin || cy > excl.yMax) {
      return { x, y };
    }
  }
  return { x: side === "right" ? width - PET_SIZE : 0, y: height - PET_SIZE }; // safe fallback: a corner
}

// A pet's straight-line path between two safe points can still clip the
// exclusion box (e.g. top-to-bottom on the same side). Rather than route
// around it, just nudge anyone caught inside it back out along whichever
// edge is closest -- cheap, and invisible at 20fps since it's a small
// correction, not a teleport.
function deflectFromExclusion(pet: PetSim, excl: ExclusionBox) {
  const cx = pet.x + PET_SIZE / 2;
  const cy = pet.y + PET_SIZE / 2;
  if (cx < excl.xMin || cx > excl.xMax || cy < excl.yMin || cy > excl.yMax) return;
  const distLeft = cx - excl.xMin;
  const distRight = excl.xMax - cx;
  const distTop = cy - excl.yMin;
  const distBottom = excl.yMax - cy;
  const min = Math.min(distLeft, distRight, distTop, distBottom);
  if (min === distLeft) pet.x = excl.xMin - PET_SIZE / 2 - 2;
  else if (min === distRight) pet.x = excl.xMax - PET_SIZE / 2 + 2;
  else if (min === distTop) pet.y = excl.yMin - PET_SIZE / 2 - 2;
  else pet.y = excl.yMax - PET_SIZE / 2 + 2;
}

export function HeroPets() {
  const [happy, setHappy] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const petRefs = useRef<(HTMLDivElement | null)[]>([]);
  const simRef = useRef<PetSim[]>([]);
  const fetchPhaseRef = useRef<"out" | "back" | "pause">("out");
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
      const start = randomSafePoint(bounds, cfg.side);
      return {
        ...cfg,
        x: start.x,
        y: start.y,
        targetX: start.x,
        targetY: start.y,
        speed: 50 + Math.random() * 30,
        facing: 1,
        legFrame: 0,
        legTimerMs: 0,
        tailFrame: 0,
        tailDir: 1,
        carryingBall: cfg.role === "thrower",
      };
    });
    // Give the wanderers (and the fetcher) a real first destination -- the
    // thrower deliberately keeps its spawn point as "home" and never
    // wanders off it.
    for (const pet of simRef.current) {
      if (pet.role === "wander") {
        const t = randomSafePoint(bounds, pet.side);
        pet.targetX = t.x;
        pet.targetY = t.y;
      }
    }
    const initialFetcher = simRef.current.find((p) => p.role === "fetcher");
    const initialThrower = simRef.current.find((p) => p.role === "thrower");
    if (initialFetcher && initialThrower) {
      const t = randomSafePoint(bounds, initialThrower.side);
      initialFetcher.targetX = t.x;
      initialFetcher.targetY = t.y;
    }

    // Write the freshly-computed starting positions immediately, before
    // the first interval tick, so there's no one-frame flash of every pet
    // stacked at the container's origin.
    simRef.current.forEach((pet, i) => {
      const el = petRefs.current[i];
      if (el) el.style.transform = `translate(${pet.x}px, ${pet.y}px)`;
    });

    let lastTime = performance.now();
    const positionInterval = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const pets = simRef.current;
      const thrower = pets.find((p) => p.role === "thrower");
      const fetcher = pets.find((p) => p.role === "fetcher");

      if (thrower && fetcher) {
        if (fetchPhaseRef.current === "out") {
          const dist = Math.hypot(fetcher.x - fetcher.targetX, fetcher.y - fetcher.targetY);
          if (dist < ARRIVE_DIST) {
            fetcher.carryingBall = true;
            fetchPhaseRef.current = "back";
          }
        } else if (fetchPhaseRef.current === "back") {
          fetcher.targetX = thrower.x;
          fetcher.targetY = thrower.y;
          const dist = Math.hypot(fetcher.x - thrower.x, fetcher.y - thrower.y);
          if (dist < ARRIVE_DIST + PET_SIZE * 0.6) {
            fetcher.carryingBall = false;
            thrower.carryingBall = true;
            fetchPhaseRef.current = "pause";
            pauseMsRef.current = 700 + Math.random() * 500;
          }
        } else {
          pauseMsRef.current -= dt * 1000;
          if (pauseMsRef.current <= 0) {
            thrower.carryingBall = false;
            const t = randomSafePoint(bounds, thrower.side);
            fetcher.targetX = t.x;
            fetcher.targetY = t.y;
            fetchPhaseRef.current = "out";
          }
        }
      }

      for (const pet of pets) {
        const dx = pet.targetX - pet.x;
        const dy = pet.targetY - pet.y;
        const dist = Math.hypot(dx, dy);

        if (pet.role === "wander" && dist < ARRIVE_DIST) {
          const t = randomSafePoint(bounds, pet.side);
          pet.targetX = t.x;
          pet.targetY = t.y;
        }

        const moving = dist > 1;
        if (moving) {
          const step = Math.min(pet.speed * dt, dist);
          pet.x += (dx / dist) * step;
          pet.y += (dy / dist) * step;
          if (Math.abs(dx) > 2) pet.facing = dx > 0 ? 1 : -1;
          pet.legTimerMs += dt * 1000;
          if (pet.legTimerMs > 160) {
            pet.legTimerMs = 0;
            pet.legFrame = pet.legFrame === 0 ? 1 : 0;
          }
          pet.tailFrame += pet.tailDir;
          if (pet.tailFrame >= 5 || pet.tailFrame <= 0) pet.tailDir = (pet.tailDir * -1) as 1 | -1;
        } else {
          pet.legFrame = 0;
        }

        deflectFromExclusion(pet, bounds.excl);
      }

      pets.forEach((pet, i) => {
        const el = petRefs.current[i];
        if (el) el.style.transform = `translate(${pet.x}px, ${pet.y}px)`;
      });
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
    </div>
  );
}
