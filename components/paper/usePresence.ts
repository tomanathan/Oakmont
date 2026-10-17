"use client";

import { useEffect, useState } from "react";

/**
 * Keeps something on screen long enough to leave properly: `mounted` stays
 * true for `ms` after `open` goes false, with `leaving` set meanwhile, so a
 * card can be picked back up instead of just disappearing.
 */
export function usePresence(open: boolean, ms: number): { mounted: boolean; leaving: boolean } {
  const [mounted, setMounted] = useState(open);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      setLeaving(false);
      return;
    }
    if (!mounted) return;
    setLeaving(true);
    const t = window.setTimeout(() => {
      setMounted(false);
      setLeaving(false);
    }, ms);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ms]);
  return { mounted, leaving };
}

/**
 * For things that close by unmounting themselves (a dialog's onClose): run
 * the leaving animation first, then call `done`.
 */
export function useLeave(ms: number): [boolean, (done: () => void) => void] {
  const [leaving, setLeaving] = useState(false);
  return [
    leaving,
    (done) => {
      if (leaving) return;
      setLeaving(true);
      window.setTimeout(() => {
        setLeaving(false);
        done();
      }, ms);
    },
  ];
}
