"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PixelDog } from "./PixelDog";
import { SECOND_PET_NAME } from "@/lib/pet";
import { dedupedFetchJson } from "@/lib/dedupeFetch";

// Mochi: the second companion, earned at a long streak (see lib/pet.ts's
// SECOND_PET_UNLOCK_STREAK_DAYS) rather than mounted unconditionally like
// ScoutCompanion. Deliberately much simpler than Ozho: no dialogue, no
// speech bubble, no sleep state, no text-avoidance or cursor reflex --
// just a calm, always-awake companion that wanders the page on its own
// slower clock. That's a scope choice, not a placeholder: giving Mochi
// Ozho's full personality and AI would mean two voices talking over each
// other and a second wardrobe/mood/death system to maintain, none of
// which the "rarer reward" this is meant to be actually needs. What it
// keeps from ScoutCompanion is just the proven bits -- the direct-to-DOM
// position write for 60fps movement without 60 re-renders/sec, and the
// six-frame tail wag -- reimplemented at a fraction of the size because
// the rest of ScoutCompanion's complexity (bubble placement, page-aware
// dialogue, the walk-cycle text-collision system) simply doesn't apply
// here.
const HIDDEN_ON = new Set(["/login"]);

const SIDE_MARGIN = 30;
const TOP_MARGIN = 30;
const BOTTOM_MARGIN = 30;
// Slower than Ozho's 150px/s RUN_SPEED on purpose -- a visibly different
// gait is a big part of what makes two companions on screen at once read
// as two distinct animals rather than one sprite duplicated.
const WALK_SPEED = 90;
const SLOW_SPEED = 35;
const LEG_SWAP_MS = 130;
// Slightly slower than Ozho's 45ms tail cadence -- same reasoning as the
// walk speed above, a small consistent difference in timing rather than
// identical motion.
const TAIL_SWAP_MS = 60;
const PAUSE_MIN_MS = 1200;
const PAUSE_MAX_MS = 3200;
const WANDER_MIN = 80;
const WANDER_MAX = 220;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function SecondCompanion() {
  const pathname = usePathname();
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [legFrame, setLegFrame] = useState<0 | 1>(0);
  const [tailFrame, setTailFrame] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [isWalking, setIsWalking] = useState(false);
  const [perk, setPerk] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const walkingRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const legTimerRef = useRef(0);
  const tailTimerRef = useRef(0);
  const tailDirRef = useRef<1 | -1>(1);
  const lastFrameRef = useRef<number | null>(null);
  const perkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Checks the same endpoint ScoutCompanion already polls for Ozho's own
  // state -- dedupedFetchJson collapses the two into one request, so
  // mounting this alongside Ozho doesn't double the network traffic.
  useEffect(() => {
    let cancelled = false;
    dedupedFetchJson<{ mochiUnlocked?: boolean }>("/api/pet/state")
      .then((data) => {
        if (!cancelled && data) setUnlocked(!!data.mochiUnlocked);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The instant, reliable way Mochi actually appears the moment the
  // streak crosses the unlock threshold: this component is mounted once
  // at the root layout and only fetched its unlock state on that initial
  // mount above, so a mid-session unlock (SubskillClient's own
  // /api/progress response) needs a live nudge rather than waiting on a
  // fresh page load to refetch -- same "fire a plain window event, every
  // mounted instance applies it directly" pattern the "ozho:costume"
  // event already uses for costume changes (see AppShell, ScoutCompanion,
  // SettingsClient).
  useEffect(() => {
    function onUnlock() {
      setUnlocked(true);
    }
    window.addEventListener("ozho:mochi-unlocked", onUnlock);
    return () => window.removeEventListener("ozho:mochi-unlocked", onUnlock);
  }, []);

  useEffect(() => {
    if (!unlocked) return;

    const vw0 = window.innerWidth || 800;
    const vh0 = window.innerHeight || 600;
    // Starts on the opposite side of the screen from where Ozho starts
    // (see ScoutCompanion's own mount effect: center, mid-lower) so the
    // two don't spawn on top of each other on a fresh page load.
    const startX = vw0 * 0.25;
    const startY = window.scrollY + Math.min(vh0 - 160, vh0 * 0.4);
    posRef.current = { x: startX, y: startY };
    targetRef.current = { x: startX, y: startY };
    pauseUntilRef.current = Date.now() + 500 + Math.random() * 800;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const onMotionChange = () => {
      reducedMotionRef.current = mq.matches;
    };
    mq.addEventListener?.("change", onMotionChange);

    function pickNewTarget() {
      const vw = window.innerWidth || 800;
      const vh = window.innerHeight || 600;
      const anchor = posRef.current;
      const angle = Math.random() * Math.PI * 2;
      const radius = WANDER_MIN + Math.random() * (WANDER_MAX - WANDER_MIN);
      // Re-anchored to the *current* scroll position every time a target
      // is picked (rather than the full document height, the way Ozho's
      // page-space wander does) -- simpler, and since a new target gets
      // picked every couple of seconds anyway, it keeps Mochi near
      // whatever part of the page is actually visible right now without
      // needing Ozho's separate "dashed out of view, walk back" system.
      const minX = window.scrollX + SIDE_MARGIN;
      const maxX = Math.max(minX, window.scrollX + vw - SIDE_MARGIN);
      const minY = window.scrollY + TOP_MARGIN;
      const maxY = Math.max(minY, window.scrollY + vh - BOTTOM_MARGIN);
      targetRef.current = {
        x: clamp(anchor.x + Math.cos(angle) * radius, minX, maxX),
        y: clamp(anchor.y + Math.sin(angle) * radius, minY, maxY),
      };
      setFacing(targetRef.current.x >= anchor.x ? 1 : -1);
      walkingRef.current = true;
      setIsWalking(true);
    }

    const intervalId = setInterval(() => {
      const now = performance.now();
      const dt = lastFrameRef.current == null ? 16 : now - lastFrameRef.current;
      lastFrameRef.current = now;
      const nowMs = Date.now();

      // The wag runs on its own clock regardless of walking/standing,
      // same reasoning as Ozho's own tailFrame timer (see
      // ScoutCompanion.tsx and PixelDog's TAIL_WAG_FRAMES doc).
      tailTimerRef.current += dt;
      const swapMs = reducedMotionRef.current ? TAIL_SWAP_MS * 4 : TAIL_SWAP_MS;
      if (tailTimerRef.current > swapMs) {
        tailTimerRef.current = 0;
        setTailFrame((f) => {
          let next = f + tailDirRef.current;
          if (next >= 5) {
            next = 5;
            tailDirRef.current = -1;
          } else if (next <= 0) {
            next = 0;
            tailDirRef.current = 1;
          }
          return next as 0 | 1 | 2 | 3 | 4 | 5;
        });
      }

      if (!walkingRef.current && nowMs > pauseUntilRef.current) {
        pickNewTarget();
      }

      if (walkingRef.current) {
        legTimerRef.current += dt;
        if (legTimerRef.current > LEG_SWAP_MS) {
          legTimerRef.current = 0;
          setLegFrame((f) => (f === 0 ? 1 : 0));
        }

        const speed = reducedMotionRef.current ? SLOW_SPEED : WALK_SPEED;
        const pos = posRef.current;
        const target = targetRef.current;
        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        const dist = Math.hypot(dx, dy);
        const step = speed * (dt / 1000);
        if (dist <= step || dist < 1) {
          pos.x = target.x;
          pos.y = target.y;
          walkingRef.current = false;
          setIsWalking(false);
          pauseUntilRef.current = nowMs + PAUSE_MIN_MS + Math.random() * (PAUSE_MAX_MS - PAUSE_MIN_MS);
        } else {
          pos.x += (dx / dist) * step;
          pos.y += (dy / dist) * step;
        }
      }

      if (wrapperRef.current) {
        wrapperRef.current.style.left = `${posRef.current.x}px`;
        wrapperRef.current.style.top = `${posRef.current.y}px`;
      }
    }, 16);

    return () => {
      clearInterval(intervalId);
      mq.removeEventListener?.("change", onMotionChange);
    };
  }, [unlocked]);

  useEffect(() => {
    return () => {
      if (perkTimeoutRef.current) clearTimeout(perkTimeoutRef.current);
    };
  }, []);

  function onClick() {
    // No dialogue, no bubble -- just a small hop of acknowledgment (the
    // same .animate-perk Ozho uses when he speaks) so clicking Mochi
    // still feels responsive rather than inert.
    setPerk(true);
    if (perkTimeoutRef.current) clearTimeout(perkTimeoutRef.current);
    perkTimeoutRef.current = setTimeout(() => setPerk(false), 300);
  }

  const hidden = HIDDEN_ON.has(pathname ?? "");
  if (!ready || !unlocked || hidden) return null;

  return (
    <div
      ref={wrapperRef}
      className="absolute z-40 pointer-events-none"
      style={{
        left: posRef.current.x,
        top: posRef.current.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <button
        onClick={onClick}
        aria-label={`${SECOND_PET_NAME}, your second companion`}
        className={`pointer-events-auto block cursor-pointer bg-transparent border-none p-0 transition-transform duration-150 ease-out ${perk ? "animate-perk" : ""}`}
        style={{
          transform: isWalking
            ? `translateY(${legFrame === 1 ? -3 : 0}px) rotate(${legFrame === 1 ? (facing === 1 ? 2 : -2) : 0}deg)`
            : undefined,
        }}
      >
        <PixelDog size={44} mood="happy" variant="mochi" legFrame={isWalking ? legFrame : 0} tailFrame={tailFrame} facing={facing} />
      </button>
    </div>
  );
}
