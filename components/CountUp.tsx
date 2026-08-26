"use client";

import { useEffect, useState } from "react";

/** Animates a number counting up from 0 to `value` over `durationMs`. */
export function useCountUp(value: number, durationMs = 700, startOnMount = true) {
  const [display, setDisplay] = useState(startOnMount ? 0 : value);

  useEffect(() => {
    if (!startOnMount) {
      setDisplay(value);
      return;
    }
    let raf: number;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return display;
}

const CONFETTI_COLORS = ["#2f6f4f", "#c9971b", "#1a1a2e", "#5a9c7a", "#e0b84a"];

/** A brief, tasteful CSS-only confetti burst — no libraries, auto-removes itself. */
export function ConfettiBurst() {
  const pieces = Array.from({ length: 18 }, (_, i) => {
    const left = 4 + Math.random() * 92;
    const delay = Math.random() * 0.15;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const rotate = 120 + Math.random() * 240;
    return (
      <span
        key={i}
        className="confetti-piece"
        style={{
          left: `${left}%`,
          backgroundColor: color,
          animationDelay: `${delay}s`,
          // @ts-expect-error -- custom property read by the confetti-fall keyframes
          "--confetti-rotate": `${rotate}deg`,
        }}
      />
    );
  });
  return <div className="absolute inset-x-0 top-0 h-0 pointer-events-none overflow-visible">{pieces}</div>;
}
