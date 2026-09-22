"use client";

import { useEffect, useState } from "react";
import { PixelDog } from "@/components/PixelDog";

// Purely decorative: a small cast of PixelDog instances that hop in around
// the headline on load, then settle into a gentle idle bob (see
// .animate-landing-pet in globals.css). These are NOT the live
// ScoutCompanion/SecondCompanion -- no pet-state fetch, no session needed,
// which is exactly right for a visitor who hasn't signed up yet.
//
// Mood switches to "happy" for a beat when the sample question below is
// answered correctly (see SampleQuestion.tsx's "landing:correct" dispatch)
// -- the one place the hero reacts to something the visitor actually did.
const CAST: {
  variant: "ozho" | "mochi";
  costume: string | null;
  facing: 1 | -1;
  className: string;
  delay: string;
}[] = [
  { variant: "ozho", costume: "sunglasses", facing: 1, className: "left-[2%] top-[8%]", delay: "0s" },
  { variant: "mochi", costume: null, facing: -1, className: "right-[4%] top-[2%]", delay: "0.15s" },
  { variant: "ozho", costume: null, facing: -1, className: "right-[0%] bottom-[4%] hidden sm:block", delay: "0.3s" },
  { variant: "mochi", costume: "bowtie", facing: 1, className: "left-[0%] bottom-[0%] hidden sm:block", delay: "0.45s" },
  { variant: "ozho", costume: "scarf", facing: 1, className: "left-[44%] top-[-4%] hidden md:block", delay: "0.6s" },
];

export function HeroPets() {
  const [happy, setHappy] = useState(false);

  useEffect(() => {
    function onCorrect() {
      setHappy(true);
      window.setTimeout(() => setHappy(false), 2400);
    }
    window.addEventListener("landing:correct", onCorrect);
    return () => window.removeEventListener("landing:correct", onCorrect);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {CAST.map((pet, i) => (
        <div
          key={i}
          className={`absolute animate-landing-pet ${pet.className}`}
          style={{ "--pet-delay": pet.delay } as React.CSSProperties}
        >
          <PixelDog size={44} variant={pet.variant} costume={pet.costume} facing={pet.facing} mood={happy ? "happy" : "neutral"} />
        </div>
      ))}
    </div>
  );
}
