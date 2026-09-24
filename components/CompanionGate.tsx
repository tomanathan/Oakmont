"use client";

import { usePathname } from "next/navigation";
import { ScoutCompanion } from "./ScoutCompanion";
import { SecondCompanion } from "./SecondCompanion";

// Ozho (and Mochi) are the student's own study companions -- they don't
// make sense on parent-facing pages (a parent's own dashboard, or the
// no-login public share view), where there's no student session for their
// ambient chatter ("your streak", "your next lesson") to actually be
// about. Also excluded from "/" -- the public landing page for logged-out
// visitors has its own purely decorative, CSS-animated pet cast (see
// components/landing/HeroPets.tsx), and the live, session-backed
// companions would have nothing real to wander/chatter about there anyway.
// Kept as its own small client component, rather than making the whole
// root layout a client component, just to read the current route.
export function CompanionGate() {
  const pathname = usePathname();
  if (pathname === "/" || pathname?.startsWith("/parent") || pathname?.startsWith("/share") || pathname?.startsWith("/link")) return null;
  return (
    <>
      <ScoutCompanion />
      <SecondCompanion />
    </>
  );
}
