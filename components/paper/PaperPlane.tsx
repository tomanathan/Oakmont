"use client";

import { useId } from "react";

// A note folded into a paper airplane and thrown: it skims along under the
// button, swoops up the right-hand edge (clear of the words), loops once,
// and sails off into the distance, leaving a dashed pencil line behind it.
// Styles: .paper-flight in app/paper.css.

const W = 420;
const H = 260;
// The flight, in the wrapper's own pixels (the plane follows this exact
// path with offset-path, and the trail is drawn along it).
const D = "M40 250 C 150 266, 300 262, 388 232 C 452 210, 466 146, 444 104 C 426 70, 470 38, 494 66 C 512 88, 482 112, 462 86 C 440 56, 540 -40, 820 -300";

export function PaperPlane() {
  const id = useId().replace(/:/g, "");
  return (
    <span className="paper-flight" style={{ width: W, height: H, marginLeft: -W / 2 }} aria-hidden>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} overflow="visible" className="paper-flight-trail">
        <defs>
          <mask id={`trail-${id}`} maskUnits="userSpaceOnUse" x="-100" y="-100" width={W + 200} height={H + 200}>
            <path d={D} pathLength={1} className="paper-flight-reveal" />
          </mask>
        </defs>
        <path d={D} mask={`url(#trail-${id})`} className="paper-flight-line" />
      </svg>
      <span className="paper-plane" style={{ offsetPath: `path("${D}")` }}>
        <svg width="44" height="30" viewBox="0 0 44 30">
          {/* far wing, body, near wing, and the fold down the middle */}
          <path d="M2 14 L42 2 L20 18 Z" fill="#dde7f7" stroke="#3461c1" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M20 18 L42 2 L26 28 Z" fill="#fffdf7" stroke="#3461c1" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M2 14 L20 18 L17 24 Z" fill="#b9c9ea" stroke="#3461c1" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M20 18 L42 2" stroke="#3461c1" strokeWidth="1" opacity=".6" />
        </svg>
      </span>
    </span>
  );
}
