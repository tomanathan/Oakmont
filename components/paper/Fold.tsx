"use client";

import { Children, cloneElement, isValidElement } from "react";
import { usePresence } from "./usePresence";

// A strip of fan-folded paper: opening it unfolds the rows one after
// another from the top; closing folds them back up from the bottom.
// Each direct child is one fold. Styles: .paper-fan in app/paper.css.

const STEP = 38;

export function Fold({ open, className = "", children }: { open: boolean; className?: string; children: React.ReactNode }) {
  const { mounted, leaving } = usePresence(open, 240);
  if (!mounted) return null;
  const items = Children.toArray(children);
  const n = items.length;
  return (
    <div className={`paper-fan ${leaving ? "is-folding" : ""} ${className}`}>
      {items.map((child, i) => {
        if (!isValidElement<{ style?: React.CSSProperties }>(child)) return child;
        // Unfold top-down; fold back bottom-up, faster.
        const delay = leaving ? Math.min(n - 1 - i, 6) * 22 : Math.min(i, 10) * STEP;
        return cloneElement(child, { style: { ...child.props.style, animationDelay: `${delay}ms` } });
      })}
    </div>
  );
}
