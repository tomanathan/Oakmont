"use client";

import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PixelDog } from "@/components/PixelDog";
import {
  BALL_R,
  SIM_STEP,
  celebrate,
  createYard,
  mulberry32,
  resizeYard,
  setPointer,
  stepYard,
  viewBall,
  viewDog,
  type DogConfig,
  type DogView,
  type Stage,
  type Yard,
} from "./yardSim";

// Decorative dogs playing in a little side-view yard under the hero's call to
// action. yardSim.ts owns all the behavior; this component measures the
// stage, steps the simulation each animation frame, and writes positions
// straight to the DOM. Pose changes (legs, tail, sitting) go through React,
// but only for the dog whose pose actually changed.

const CAST: DogConfig[] = [
  { variant: "ozho", costume: "bowtie", player: true, energy: 0.8, calm: 0.3 },
  { variant: "mochi", costume: null, player: true, energy: 0.9, calm: 0.2 },
  { variant: "ozho", costume: "sunglasses", player: false, energy: 0.8, calm: 0.35 },
  { variant: "mochi", costume: "scarf", player: false, energy: 0.3, calm: 0.85 },
  { variant: "ozho", costume: null, player: false, energy: 0.55, calm: 0.5 },
];

const castSizeFor = (width: number) => (width < 520 ? 3 : width < 900 ? 4 : 5);

// Client rects are in visual pixels, which differ from the layout pixels the
// transforms are written in whenever CSS zoom or a scaled ancestor is in play.
const visualScale = (el: HTMLElement) => el.getBoundingClientRect().width / (el.offsetWidth || 1) || 1;

function measureStage(container: HTMLElement): Stage | null {
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  if (width < 40 || height < 40) return null;
  const small = width < 640;
  const floorY = height - (small ? 10 : 14);
  const actions = container.parentElement?.querySelector("[data-hero-actions]");
  const top = container.getBoundingClientRect().top;
  const actionsTop = actions ? (actions.getBoundingClientRect().top - top) / visualScale(container) : height * 0.7;
  return {
    width,
    floorY,
    depth: small ? 14 : 22,
    apexMax: Math.min(Math.max(floorY - actionsTop + 24, 60), 190),
    dogSize: small ? 36 : 44,
  };
}

type Pose = Pick<DogView, "legFrame" | "tailFrame" | "facing" | "sitting" | "asleep" | "carrying" | "mood">;

const poseKey = (p: Pose) =>
  `${p.legFrame}${p.tailFrame}${p.facing}${+p.sitting}${+p.asleep}${+p.carrying}${p.mood}`;

const INITIAL_POSE: Pose = {
  legFrame: 0,
  tailFrame: 0,
  facing: 1,
  sitting: false,
  asleep: false,
  carrying: false,
  mood: "neutral",
};

// Constant (not measured) so server and client markup match; the first
// layout effect moves every dog to its real spot before paint.
const OFFSTAGE = "translate3d(-200px, 0, 0)";

interface Slot {
  wrapper: HTMLDivElement | null;
  body: HTMLDivElement | null;
  shadow: HTMLDivElement | null;
  setPose: ((p: Pose) => void) | null;
  key: string;
}

const newSlot = (): Slot => ({ wrapper: null, body: null, shadow: null, setPose: null, key: poseKey(INITIAL_POSE) });

const boxHeight = (size: number) => (size * 58) / 64; // the sitting pose, the tallest

const DogSprite = memo(function DogSprite({ cfg, size, slot }: { cfg: DogConfig; size: number; slot: Slot }) {
  const [pose, setPose] = useState<Pose>(INITIAL_POSE);
  useLayoutEffect(() => {
    slot.setPose = setPose;
    return () => {
      slot.setPose = null;
    };
  }, [slot]);

  return (
    <div
      ref={(el) => {
        slot.wrapper = el;
      }}
      className="absolute left-0 top-0 will-change-transform"
      style={{ width: size, height: boxHeight(size), transform: OFFSTAGE, transformOrigin: "50% 100%" }}
    >
      <div
        ref={(el) => {
          slot.shadow = el;
        }}
        className="absolute bottom-0 rounded-[50%] bg-black"
        style={{ left: size * 0.19, width: size * 0.62, height: size * 0.07, opacity: 0.16 }}
      />
      <div
        ref={(el) => {
          slot.body = el;
        }}
        className="absolute inset-0 flex items-end justify-center"
        style={{ transformOrigin: "50% 100%" }}
      >
        <PixelDog
          size={size}
          variant={cfg.variant}
          costume={cfg.costume}
          shadow={false}
          legFrame={pose.legFrame}
          tailFrame={pose.tailFrame}
          facing={pose.facing}
          sitting={pose.sitting}
          asleep={pose.asleep}
          carryingBall={pose.carrying}
          mood={pose.mood}
        />
      </div>
      {pose.asleep && (
        // Same drifting z's as the in-app companion, over the resting head.
        <div
          className="absolute"
          style={{ bottom: size * 0.4, left: pose.facing === 1 ? size * 0.6 : size * 0.1, width: size * 0.4, height: size * 0.4 }}
        >
          <span className="absolute bottom-0 left-0 text-[7px] font-bold text-[#9694b0] animate-zzz">z</span>
          <span className="absolute bottom-0 left-[6px] text-[9px] font-bold text-[#9694b0] animate-zzz" style={{ animationDelay: "0.7s" }}>
            z
          </span>
        </div>
      )}
    </div>
  );
});

const BALL_D = BALL_R * 2;

// `children` is scenery (the title page's trees and ground) rendered inside
// the same stacking context as the dogs, so a tree planted at a given depth
// can sit in front of the dogs behind it and behind the dogs in front of it.
// Dogs stack at zIndex 10 + z*40 (z = depth, 0 back to 1 front; see
// yardSim's viewDog), on a floor 14px above the bottom (22px higher for the
// back row) -- see yardFloor.ts for planting things on it.
export function HeroPets({ children }: { children?: React.ReactNode } = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const ballSquashRef = useRef<HTMLDivElement>(null);
  const ballSpinRef = useRef<SVGSVGElement>(null);
  const ballShadowRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<Slot[]>(CAST.map(newSlot));
  const yardRef = useRef<Yard | null>(null);
  const [layout, setLayout] = useState({ castSize: CAST.length, dogSize: 44 });

  useEffect(() => {
    function onCorrect() {
      if (yardRef.current) celebrate(yardRef.current);
    }
    window.addEventListener("landing:correct", onCorrect);
    return () => window.removeEventListener("landing:correct", onCorrect);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const initial = measureStage(container);
    if (!initial) return;
    if (castSizeFor(initial.width) !== layout.castSize || initial.dogSize !== layout.dogSize) {
      setLayout({ castSize: castSizeFor(initial.width), dogSize: initial.dogSize });
      return;
    }

    const yard = createYard(initial, CAST.slice(0, layout.castSize), mulberry32((Math.random() * 2 ** 32) >>> 0));
    yardRef.current = yard;
    const slots = slotsRef.current;
    const size = layout.dogSize;
    const height = boxHeight(size);
    const dpr = window.devicePixelRatio || 1;
    const snap = (v: number) => Math.round(v * dpr) / dpr;

    function paint() {
      yard.dogs.forEach((d, i) => {
        const slot = slots[i];
        if (!slot.wrapper || !slot.body || !slot.shadow) return;
        const v = viewDog(yard, d);
        slot.wrapper.style.transform = `translate3d(${snap(v.x - size / 2)}px, ${snap(v.footY - height)}px, 0) scale(${v.scale.toFixed(3)})`;
        slot.wrapper.style.zIndex = String(v.zIndex);
        slot.body.style.transform = `translate3d(0, ${snap(-v.lift)}px, 0) rotate(${v.tilt.toFixed(2)}deg) scale(${v.sx.toFixed(3)}, ${v.sy.toFixed(3)})`;
        slot.shadow.style.transform = `scale(${v.shadowScale.toFixed(3)})`;
        slot.shadow.style.opacity = v.shadowOpacity.toFixed(3);
        const pose: Pose = {
          legFrame: v.legFrame,
          tailFrame: v.tailFrame,
          facing: v.facing,
          sitting: v.sitting,
          asleep: v.asleep,
          carrying: v.carrying,
          mood: v.mood,
        };
        const key = poseKey(pose);
        if (key !== slot.key && slot.setPose) {
          slot.key = key;
          slot.setPose(pose);
        }
      });

      const b = viewBall(yard);
      const ball = ballRef.current;
      const shadow = ballShadowRef.current;
      if (ball && shadow && ballSquashRef.current && ballSpinRef.current) {
        const opacity = b.visible ? "1" : "0";
        ball.style.opacity = opacity;
        shadow.style.opacity = b.visible ? b.shadowOpacity.toFixed(3) : "0";
        if (b.visible) {
          ball.style.transform = `translate3d(${snap(b.x - BALL_R)}px, ${snap(b.footY - BALL_D - b.h)}px, 0) scale(${b.scale.toFixed(3)})`;
          ball.style.zIndex = String(b.zIndex);
          ballSquashRef.current.style.transform = `scale(${(1 + 0.25 * b.squash).toFixed(3)}, ${(1 - 0.3 * b.squash).toFixed(3)})`;
          ballSpinRef.current.style.transform = `rotate(${b.spin.toFixed(1)}deg)`;
          shadow.style.transform = `translate3d(${snap(b.x - BALL_R * 1.2)}px, ${snap(b.footY - 2)}px, 0) scale(${(b.shadowScale * b.scale).toFixed(3)})`;
        }
      }
    }

    paint();

    let last = performance.now();
    let acc = 0;
    let onScreen = true;
    let rafId = 0;

    const frame = (now: number) => {
      const elapsed = Math.min(Math.max((now - last) / 1000, 0), 0.25);
      last = Math.max(last, now);
      if (!onScreen) return;
      acc += elapsed;
      while (acc >= SIM_STEP) {
        stepYard(yard, SIM_STEP);
        acc -= SIM_STEP;
      }
      paint();
    };
    const tick = (now: number) => {
      frame(now);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    // requestAnimationFrame stalls or slows to ~1fps in some embedded contexts
    // that still show the page. Keyed on the last frame of either kind, so a
    // lone late rAF can't pause this and leave a gap before the next one.
    const fallback = window.setInterval(() => {
      const now = performance.now();
      if (now - last > 45) frame(now);
    }, 40);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    io.observe(container);

    const ro = new ResizeObserver(() => {
      const s = measureStage(container);
      if (!s) return;
      if (castSizeFor(s.width) !== layout.castSize || s.dogSize !== layout.dogSize) {
        setLayout({ castSize: castSizeFor(s.width), dogSize: s.dogSize });
        return;
      }
      resizeYard(yard, s);
    });
    ro.observe(container);

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const onPointerMove = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      const k = visualScale(container);
      const x = (e.clientX - r.left) / k;
      const y = (e.clientY - r.top) / k;
      setPointer(yard, x >= 0 && x <= yard.stage.width && y >= 0 && y <= r.height / k ? { x, y } : null);
    };
    const onPointerGone = () => setPointer(yard, null);
    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerGone);
      window.addEventListener("blur", onPointerGone);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.clearInterval(fallback);
      io.disconnect();
      ro.disconnect();
      if (finePointer) {
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener("pointerleave", onPointerGone);
        window.removeEventListener("blur", onPointerGone);
      }
      yardRef.current = null;
    };
  }, [layout]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {children}
      {CAST.slice(0, layout.castSize).map((cfg, i) => (
        <DogSprite key={i} cfg={cfg} size={layout.dogSize} slot={slotsRef.current[i]} />
      ))}
      <div
        ref={ballShadowRef}
        className="absolute left-0 top-0 rounded-[50%] bg-black"
        style={{ width: BALL_D * 1.2, height: 3, opacity: 0, zIndex: 1, transformOrigin: "50% 50%" }}
      />
      <div
        ref={ballRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{ width: BALL_D, height: BALL_D, opacity: 0, transformOrigin: "50% 100%" }}
      >
        <div ref={ballSquashRef} className="h-full w-full" style={{ transformOrigin: "50% 100%" }}>
          <svg ref={ballSpinRef} viewBox="0 0 16 16" width={BALL_D} height={BALL_D} style={{ display: "block" }}>
            <circle cx={8} cy={8} r={7.2} fill="#cddc39" stroke="#aebb28" strokeWidth={1} />
            <path d="M 2.5 5 Q 8 9 13.5 5" stroke="#f3f8cf" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            <path d="M 2.5 11 Q 8 7 13.5 11" stroke="#f3f8cf" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
