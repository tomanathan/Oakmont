"use client";

import { useEffect, useRef } from "react";
import { track } from "@vercel/analytics";

// Fires a Vercel Analytics event the first time this (invisible) marker
// scrolls into view -- used for "pricing_viewed," which isn't a click
// anyone makes, just a section someone scrolled to. Fires once per page
// load, not once per scroll back into view.
export function ViewTracker({ event }: { event: string }) {
  const fired = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fired.current) {
          fired.current = true;
          track(event);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [event]);

  return <div ref={ref} aria-hidden="true" />;
}
