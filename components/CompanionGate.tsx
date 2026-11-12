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
// in, so they're left out too, as are the public SAT skill pages (/sat),
// which are reading pages for visitors. The same goes for the other public
// pages: the daily question (/daily), the embeddable widget (/embed), the
// study plans (/sat-study-plan), test dates (/sat-test-dates) and the short
// links (/go). Kept as its own small client component, rather than making the whole
// root layout a client component, just to read the current route.
export function CompanionGate() {
  const pathname = usePathname();
  if (
    pathname === "/" ||
    pathname?.startsWith("/parent") ||
    pathname?.startsWith("/share") ||
    pathname?.startsWith("/link") ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/sat" ||
    pathname?.startsWith("/sat/") ||
    pathname === "/daily" ||
    pathname?.startsWith("/daily/") ||
    pathname === "/embed" ||
    pathname?.startsWith("/embed/") ||
    pathname === "/sat-study-plan" ||
    pathname?.startsWith("/sat-study-plan/") ||
    pathname === "/sat-test-dates" ||
    pathname === "/go" ||
    pathname?.startsWith("/go/")
  )
    return null;
  return (
    <>
      <ScoutCompanion />
      <SecondCompanion />
    </>
  );
}
