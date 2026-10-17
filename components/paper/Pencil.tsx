"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cross, loop, rng, stroke, tick } from "./sketch";

// Pen and pencil marks drawn onto the page: a loop round a chosen answer, a
// teacher's tick or cross, a highlighter swipe. Each draws itself on (the
// stroke runs along its own path), and rubs out with eraser crumbs when it
// goes away. Styles are in app/paper.css (.pen-mark).

export type Ink = "pen" | "green" | "red" | "pencil" | "highlight";

/** "in" while shown, "out" while rubbing out, null once gone. */
export function useMark(show: boolean, outMs = 340): "in" | "out" | null {
  const [state, setState] = useState<"in" | "out" | null>(show ? "in" : null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (show) {
      setState("in");
      return;
    }
    setState((s) => (s ? "out" : null));
    const t = window.setTimeout(() => setState(null), outMs);
    return () => window.clearTimeout(t);
  }, [show, outMs]);
  return state;
}

function Crumbs({ seed }: { seed: number }) {
  const bits = useMemo(() => {
    const r = rng(seed + 99);
    return Array.from({ length: 6 }, () => ({
      left: `${12 + r() * 76}%`,
      top: `${40 + r() * 40}%`,
      dx: `${(r() - 0.5) * 26}px`,
      dy: `${14 + r() * 16}px`,
      rot: `${(r() - 0.5) * 240}deg`,
      delay: `${r() * 90}ms`,
      w: `${2 + r() * 2.5}px`,
    }));
  }, [seed]);
  return (
    <>
      {bits.map((b, i) => (
        <span
          key={i}
          className="paper-crumb"
          style={{ left: b.left, top: b.top, width: b.w, height: b.w, ["--dx" as string]: b.dx, ["--dy" as string]: b.dy, ["--rot" as string]: b.rot, animationDelay: b.delay }}
        />
      ))}
    </>
  );
}

interface MarkProps {
  show: boolean;
  seed?: number;
  ink?: Ink;
  className?: string;
  style?: React.CSSProperties;
  // Wait this long before drawing (to let another mark land first).
  delay?: number;
  // Rub out with crumbs (true) or just lift off (false).
  erase?: boolean;
}

function Mark({ show, seed = 1, ink = "pen", className = "", style, delay = 0, erase = true, view, paths, width }: MarkProps & { view: string; paths: string[]; width: number }) {
  const state = useMark(show);
  if (!state) return null;
  return (
    <span className={`pen-mark pen-${ink} is-${state} ${className}`} style={{ ...style, ["--pen-delay" as string]: `${delay}ms` }} aria-hidden>
      <svg viewBox={view} preserveAspectRatio="none" width="100%" height="100%" overflow="visible">
        {paths.map((d, i) => (
          <path key={i} d={d} pathLength={1} strokeWidth={width} vectorEffect="non-scaling-stroke" style={{ ["--pen-i" as string]: i }} />
        ))}
      </svg>
      {state === "out" && erase && <Crumbs seed={seed} />}
    </span>
  );
}

/** A loop drawn round whatever it's placed over (size it with className). */
export function PenLoop(p: MarkProps) {
  const d = useMemo(() => loop(50, 50, 44, 40, p.seed ?? 1), [p.seed]);
  return <Mark {...p} view="0 0 100 100" paths={[d]} width={2.2} />;
}

/** A teacher's tick. */
export function PenTick(p: MarkProps) {
  const d = useMemo(() => tick(40, 34, p.seed ?? 1), [p.seed]);
  return <Mark {...p} ink={p.ink ?? "green"} view="0 0 40 34" paths={[d]} width={3} erase={p.erase ?? false} />;
}

/** A teacher's cross: two strokes, one after the other. */
export function PenCross(p: MarkProps) {
  const ds = useMemo(() => cross(30, 30, p.seed ?? 1), [p.seed]);
  return <Mark {...p} ink={p.ink ?? "red"} view="0 0 30 30" paths={ds} width={2.6} erase={p.erase ?? false} />;
}

/** A highlighter swipe behind text (place it under the text). */
export function Highlight(p: MarkProps & { rise?: number }) {
  const d = useMemo(() => stroke(100, 20, p.seed ?? 1, p.rise ?? 0), [p.seed, p.rise]);
  return <Mark {...p} ink={p.ink ?? "highlight"} view="0 0 100 20" paths={[d]} width={14} erase={p.erase ?? false} />;
}

/** A pencil line through something (crossing it out). */
export function PencilStrike(p: MarkProps) {
  const d = useMemo(() => stroke(100, 10, p.seed ?? 1, 2), [p.seed]);
  return <Mark {...p} ink={p.ink ?? "pencil"} view="0 0 100 10" paths={[d]} width={1.8} />;
}

/** A tick for a check box. */
export function BoxTick(p: MarkProps) {
  const d = useMemo(() => tick(20, 18, p.seed ?? 1), [p.seed]);
  return <Mark {...p} ink={p.ink ?? "pen"} view="0 0 20 18" paths={[d]} width={2.4} erase={p.erase ?? false} />;
}

/** A small stable number from a string, for seeding marks. */
export function seedOf(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 100000;
}

/**
 * A little hand-ruled box that gets ticked in pen when it's on, and the
 * tick rubbed out when it's off. Drop-in for a switch or checkbox's look
 * (the control's own role/aria stays on the button or input around it).
 */
export function PaperCheck({ on, size = 20, seed = 3, className = "" }: { on: boolean; size?: number; seed?: number; className?: string }) {
  return (
    <span
      className={`relative inline-block flex-none rounded-[4px] border-2 border-[#3461c1] bg-white ${className}`}
      style={{ width: size, height: size, boxShadow: "1.5px 1.5px 0 rgba(52,97,193,0.25)" }}
      aria-hidden
    >
      <BoxTick show={on} seed={seed} erase className="-left-[2px] -top-[7px]" style={{ width: size * 1.15, height: size * 1.05 }} />
    </span>
  );
}
