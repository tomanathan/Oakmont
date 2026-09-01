"use client";

import { useEffect, useState } from "react";

// Same idea as ScoutCompanion: mounted once at the root layout so it can
// react to a celebration fired from *any* page (a subskill quiz, logging a
// practice test, equipping a new costume, hitting a streak milestone)
// without each of those needing to render their own confetti locally.
// Every "ozho:celebrate" event -- Ozho's existing trick-and-bubble hook --
// now also bursts confetti across the whole viewport, sized by how big a
// deal the moment is.

const CONFETTI_COLORS = ["#2f6f4f", "#c9971b", "#1a1a2e", "#5a9c7a", "#e0b84a", "#6d7fd6", "#c0524f"];

interface ConfettiPiece {
  left: number;
  delay: number;
  color: string;
  rotate: number;
  drift: number;
}

interface Burst {
  id: number;
  big: boolean;
  pieces: ConfettiPiece[];
}

let nextBurstId = 0;

export function GlobalConfetti() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    function onCelebrate(e: Event) {
      const detail = (e as CustomEvent<{ tier?: "small" | "big" }>).detail;
      const big = detail?.tier === "big";
      const count = big ? 70 : 30;
      const id = nextBurstId++;
      const pieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * (big ? 0.5 : 0.25),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: 140 + Math.random() * 360,
        drift: (Math.random() - 0.5) * (big ? 220 : 120),
      }));
      setBursts((prev) => [...prev, { id, big, pieces }]);
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, big ? 2800 : 1900);
    }
    window.addEventListener("ozho:celebrate", onCelebrate);
    return () => window.removeEventListener("ozho:celebrate", onCelebrate);
  }, []);

  if (bursts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none overflow-hidden" aria-hidden>
      {bursts.map((burst) => (
        <div key={burst.id} className="absolute inset-x-0 top-0 h-0">
          {burst.pieces.map((p, i) => (
            <span
              key={i}
              className={burst.big ? "confetti-piece-viewport confetti-piece-viewport-big" : "confetti-piece-viewport"}
              style={{
                left: `${p.left}%`,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                // @ts-expect-error -- custom properties read by the confetti-fall-viewport keyframes
                "--confetti-rotate": `${p.rotate}deg`,
                "--confetti-drift": `${p.drift}px`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
