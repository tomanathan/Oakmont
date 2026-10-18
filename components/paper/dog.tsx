"use client";

import { useEffect, useRef, useState } from "react";
import { PixelDog } from "@/components/PixelDog";

// Ozho in the paper world: his paw print (on stamps, in confetti, inked on
// a button you press), a little Ozho who runs along a progress bar as it
// fills, and one who trots back and forth while a page loads. Motion is
// transform-only (see app/paper.css); his legs are the sprite's own frames.

/** A paw print: one pad, four toes. Fills with currentColor. */
export function PawPrint({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} aria-hidden fill="currentColor">
      <ellipse cx="12" cy="16.2" rx="5.6" ry="4.6" />
      <ellipse cx="5.2" cy="10.4" rx="2.2" ry="2.8" transform="rotate(-18 5.2 10.4)" />
      <ellipse cx="9.4" cy="6.2" rx="2.3" ry="3" transform="rotate(-6 9.4 6.2)" />
      <ellipse cx="14.6" cy="6.2" rx="2.3" ry="3" transform="rotate(6 14.6 6.2)" />
      <ellipse cx="18.8" cy="10.4" rx="2.2" ry="2.8" transform="rotate(18 18.8 10.4)" />
    </svg>
  );
}

/** A dog bone, for confetti. */
export function Bone({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 24 12" className={className} aria-hidden fill="currentColor">
      <circle cx="3.6" cy="3.4" r="3" />
      <circle cx="3.6" cy="8.6" r="3" />
      <circle cx="20.4" cy="3.4" r="3" />
      <circle cx="20.4" cy="8.6" r="3" />
      <rect x="3.6" y="3.2" width="16.8" height="5.6" rx="2" />
    </svg>
  );
}

/**
 * Steps his legs while `moving`; once he stops, wags for a couple of
 * seconds and then settles (no timer left running on an idle page).
 */
function useGait(moving: boolean) {
  const [leg, setLeg] = useState<0 | 1>(0);
  const [tail, setTail] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  // Nothing to wag about until he's actually been somewhere (a dog that's
  // just appeared, mid page turn, should cost nothing).
  const ran = useRef(false);
  useEffect(() => {
    let i = 0;
    if (moving) ran.current = true;
    else {
      setLeg(0);
      if (!ran.current) return;
    }
    const t = window.setInterval(
      () => {
        i++;
        if (moving) setLeg((l) => (l ? 0 : 1));
        else if (i > 20) {
          setTail(0);
          window.clearInterval(t);
        } else setTail(([0, 1, 2, 3, 4, 5, 4, 3, 2, 1] as const)[i % 10]);
      },
      moving ? 120 : 110,
    );
    return () => window.clearInterval(t);
  }, [moving]);
  return { leg, tail };
}

/**
 * A little Ozho riding a progress bar: put it inside the bar's (relative)
 * wrapper. When `value` (0..1) goes up he runs to the new spot, then stands
 * there wagging. The run is a transform transition, so it costs nothing.
 */
export function DogRunner({ value, size = 22, costume = null }: { value: number; size?: number; costume?: string | null }) {
  const v = Math.max(0, Math.min(1, value));
  const [moving, setMoving] = useState(false);
  const last = useRef(v);
  useEffect(() => {
    if (v === last.current) return;
    last.current = v;
    setMoving(true);
    const t = window.setTimeout(() => setMoving(false), 650);
    return () => window.clearTimeout(t);
  }, [v]);
  const { leg, tail } = useGait(moving);
  return (
    <span className="dog-runner" style={{ transform: `translateX(${v * 100}%)` }} aria-hidden>
      <span className={`dog-runner-dog ${moving ? "is-running" : ""}`} style={{ marginLeft: -size * 0.62, width: size }}>
        <PixelDog size={size} mood="happy" legFrame={leg} tailFrame={moving ? 2 : tail} costume={costume} shadow={false} />
      </span>
    </span>
  );
}

/** Ozho trotting back and forth across a ruled line while a page loads. */
export function DogLoader({ label = "Fetching your page" }: { label?: string }) {
  const { leg } = useGait(true);
  return (
    <div className="dog-loader" role="status" aria-label={label}>
      <span className="dog-loader-track">
        <span className="dog-loader-dog">
          <span className="dog-loader-face">
            <PixelDog size={46} mood="happy" legFrame={leg} tailFrame={2} shadow={false} />
          </span>
        </span>
      </span>
      <span className="dog-loader-line" />
    </div>
  );
}
