// Shared, per-tab scratch state between the two roaming companions.
// ScoutCompanion (Ozho) already scans the page for text and tracks where
// he is every frame; SecondCompanion (Mochi) reads both from here instead
// of duplicating the scan, so she can trot after him and fade behind text
// the same way he does. Plain module state, not React context: both are
// mounted once at the root layout and read this from their own
// setInterval loops, where a re-render per update would be pure waste.

export interface PageRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const companionBus: {
  // Ozho's position in page coordinates, stamped every frame he's
  // free-roaming. `at` lets a reader tell a live position from a stale
  // one (he's unmounted, or docked on mobile and not writing it).
  // `resting`: sat down (on his own or told to) -- Mochi sits with him.
  ozho: { x: number; y: number; at: number; resting: boolean } | null;
  // Every element with its own visible text, in page coordinates --
  // refreshed by Ozho on scroll/resize/DOM change.
  textRects: PageRect[];
} = {
  ozho: null,
  textRects: [],
};

export function pointInText(x: number, y: number, halfW: number, above: number, below: number): boolean {
  const l = x - halfW;
  const r = x + halfW;
  const t = y - above;
  const b = y + below;
  const rects = companionBus.textRects;
  for (let i = 0; i < rects.length; i++) {
    const rc = rects[i];
    if (l < rc.right && r > rc.left && t < rc.bottom && b > rc.top) return true;
  }
  return false;
}
