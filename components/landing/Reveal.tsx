"use client";

import { motion, useReducedMotion } from "motion/react";

// The one motion wrapper used across the landing page's below-the-fold
// sections: a fade + slight slide-up the first time each section scrolls
// into view, then it stays put (no re-triggering on scroll back up/down).
//
// Uses the plain (non-lazy) `motion` import rather than LazyMotion +
// `m` -- tried LazyMotion first for the smaller deferred bundle, but its
// async feature-chunk load left a real window where the client's first
// hydration pass had no `initial` style applied yet while the server had
// already rendered one, a genuine (not cosmetic-only) hydration mismatch
// caught live in the console during verification. The plain import has
// everything available synchronously on both sides, so there's no gap.
export function Reveal({ children }: { children: React.ReactNode }) {
  // useReducedMotion() can only know the real answer once mounted in the
  // browser (SSR has no matchMedia); keeping `initial` identical between
  // server and client and varying only the transition *duration* avoids a
  // second, separate hydration mismatch that conditioning `initial` itself
  // would cause.
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.34, 0.56, 0.64, 1] }}
    >
      {children}
    </motion.div>
  );
}
