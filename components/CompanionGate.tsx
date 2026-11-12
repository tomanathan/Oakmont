"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Loaded on demand rather than imported: this gate sits in the root layout,
// so a plain import put both companions' code (a couple of hundred KB of
// source) on every route, including the ones below where they never
// appear. Neither draws anything until it has mounted in the browser, so
// skipping the server render changes nothing on the page.
const ScoutCompanion = dynamic(() => import("./ScoutCompanion").then((m) => m.ScoutCompanion), { ssr: false });
const SecondCompanion = dynamic(() => import("./SecondCompanion").then((m) => m.SecondCompanion), { ssr: false });

// Ozho (and Mochi) are the student's own study companions -- they don't
// make sense on parent-facing pages (a parent's own dashboard, or the
// no-login public share view), where there's no student session for their
// ambient chatter ("your streak", "your next lesson") to actually be
// about. Also excluded from "/" -- the public landing page for logged-out
// visitors has its own purely decorative, CSS-animated pet cast (see
// components/landing/HeroPets.tsx), and the live, session-backed
// companions would have nothing real to wander/chatter about there anyway.
// The legal pages wear the landing page's top bar and are read on the way
// in, so they're left out too. Kept as its own small client component, rather than making the whole
// root layout a client component, just to read the current route.
export function CompanionGate() {
  const pathname = usePathname();
  if (pathname === "/" || pathname?.startsWith("/parent") || pathname?.startsWith("/share") || pathname?.startsWith("/link") || pathname === "/privacy" || pathname === "/terms") return null;
  return (
    <>
      <ScoutCompanion />
      <SecondCompanion />
    </>
  );
}
