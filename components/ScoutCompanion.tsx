"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PixelDog } from "./PixelDog";
import { MOOD_BY_STAGE } from "./PetAvatar";
import type { PetStage } from "@/lib/pet";

// Kept warm and low-pressure on purpose -- Scout is a companion, not a
// nag. Even the "hungry"/"critical" pool below invites rather than
// guilt-trips, regardless of how urgent the pet-death countdown actually is.
const GREETINGS = [
  "Woof! Good to see you.",
  "Hey there — ready when you are.",
  "I'm rooting for you today.",
  "Happy to see you back.",
];
const ENCOURAGEMENTS = [
  "Every problem you solve makes test day easier.",
  "Small steps count — even one quiz helps.",
  "Proud of you for showing up today.",
  "Take a breather if you need one, I'll be here.",
  "You've got this, one question at a time.",
];
const NUDGES = [
  "I'd love a little study time together today.",
  "No pressure — even five minutes helps.",
  "Whenever you're ready, I'll come along.",
];
const TIPS = [
  "You can retake any quiz from its subskill page to reinforce it.",
  "Set your target test date in Settings and your whole plan resizes to fit.",
  "Missed a question? Read the explanation before moving on — it sticks better.",
  "All 8 practice tests are spaced through your plan, not just at the end.",
  "Check Practice exam analysis to see your score trend by subject.",
  "A few minutes a day beats one long cram session.",
  "Click a week on the 6-month plan to see it broken down day by day.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Pages without the logged-in app chrome -- Scout doesn't belong there.
const HIDDEN_ON = new Set(["/login"]);

// Stays roughly within this ring of wherever the mouse has been, but never
// closer than MIN_DIST to the live cursor -- near enough to feel like it's
// keeping you company, far enough to never sit on top of what you're doing.
// All distances/positions are in PAGE coordinates (not viewport), so Scout
// scrolls with the page like something actually standing on it rather than
// floating over it.
const MIN_DIST = 100;
const WANDER_MIN = 130;
const WANDER_MAX = 280;
const TOP_MARGIN = 100;
const SIDE_MARGIN = 24;
const BOTTOM_MARGIN = 24;
const RUN_SPEED = 150; // px/sec
const SLOW_SPEED = 60; // px/sec, used when the OS prefers reduced motion
const LEG_SWAP_MS = 110;

export function ScoutCompanion() {
  const pathname = usePathname();
  const [stage, setStage] = useState<PetStage | null>(null);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [legFrame, setLegFrame] = useState<0 | 1>(0);
  const [isWalking, setIsWalking] = useState(true);
  const [bubble, setBubble] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 80, y: 400 });
  const targetRef = useRef({ x: 80, y: 400 });
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const walkingRef = useRef(true);
  const facingRef = useRef<1 | -1>(1);
  const reducedMotionRef = useRef(false);
  const behaviorUntilRef = useRef(0);
  const speakAtRef = useRef(0);
  const legTimerRef = useRef(0);
  const lastFrameRef = useRef<number | null>(null);
  const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef = useRef<PetStage | null>(null);
  const streakRef = useRef(0);
  const hasGreetedRef = useRef(false);

  // One-time setup: pick a starting spot in page coordinates and fetch
  // Scout's mood. ScoutCompanion is mounted once at the root layout, so
  // this survives client-side navigation between pages instead of
  // resetting every time the route changes (it only truly remounts on a
  // full page load). Deliberately has no "already ran" guard: React 18
  // Strict Mode double-invokes effects in dev (setup -> cleanup -> setup)
  // specifically to catch listeners that don't get cleaned up properly --
  // guarding this with a ref that's never reset would leave the second
  // setup a no-op and the pointermove listener permanently unattached.
  useEffect(() => {
    const startX = window.innerWidth / 2;
    const startY = window.scrollY + Math.min(window.innerHeight - 120, window.innerHeight * 0.55);
    posRef.current = { x: startX, y: startY };
    targetRef.current = { x: startX, y: startY };
    speakAtRef.current = Date.now() + 5000;
    setReady(true);

    fetch("/api/pet/state")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.stage) {
          stageRef.current = data.stage;
          streakRef.current = data.currentStreak ?? 0;
          setStage(data.stage);
        }
      })
      .catch(() => {});

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const onMotionChange = () => {
      reducedMotionRef.current = mq.matches;
    };
    mq.addEventListener?.("change", onMotionChange);

    function onMove(e: PointerEvent) {
      mouseRef.current = { x: e.clientX + window.scrollX, y: e.clientY + window.scrollY };
    }
    window.addEventListener("pointermove", onMove);

    return () => {
      mq.removeEventListener?.("change", onMotionChange);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  function speak(text: string, ms = 4500) {
    setBubble(text);
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    bubbleTimeoutRef.current = setTimeout(() => setBubble(null), ms);
  }

  function pickMessage(): string {
    const s = stageRef.current;
    const roll = Math.random();
    if ((s === "hungry" || s === "critical") && roll < 0.3) return pick(NUDGES);
    if (streakRef.current >= 2 && (s === "thriving" || s === "content") && roll < 0.25) {
      return pick([
        `${streakRef.current}-day streak! Keep it going.`,
        `Loving this ${streakRef.current}-day streak.`,
      ]);
    }
    if (roll < 0.6) return pick(TIPS);
    return pick(ENCOURAGEMENTS);
  }

  // Say hello shortly after Scout's mood is known (once, ever).
  useEffect(() => {
    if (stage === null || hasGreetedRef.current) return;
    hasGreetedRef.current = true;
    const t = setTimeout(() => speak(pick(GREETINGS), 4000), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function pickNewTarget() {
    const anchor = mouseRef.current ?? posRef.current;
    const angle = Math.random() * Math.PI * 2;
    const radius = WANDER_MIN + Math.random() * (WANDER_MAX - WANDER_MIN);
    const maxX = document.documentElement.clientWidth - SIDE_MARGIN;
    const maxY = document.documentElement.scrollHeight - BOTTOM_MARGIN;
    targetRef.current = {
      x: Math.min(maxX, Math.max(SIDE_MARGIN, anchor.x + Math.cos(angle) * radius)),
      y: Math.min(maxY, Math.max(TOP_MARGIN, anchor.y + Math.sin(angle) * radius)),
    };
  }

  // The render loop. Uses setInterval rather than requestAnimationFrame:
  // rAF is throttled to zero in a background/hidden tab by design (correct
  // -- no point animating what nobody can see), but that also makes it
  // unusable for embedded/automated preview panes that never report as
  // foreground. setInterval at ~60fps plus real delta-time physics (dt
  // below, measured from actual elapsed time rather than assumed) gives
  // the same frame-rate-independent smoothness in every environment.
  // Position is written straight to the DOM node via a ref rather than
  // React state, so 60fps movement doesn't mean 60 re-renders/sec -- only
  // the occasional pose/mood/bubble change goes through React.
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = performance.now();
      const dt = lastFrameRef.current === null ? 16 : Math.min(64, now - lastFrameRef.current);
      lastFrameRef.current = now;
      const nowMs = Date.now();

      if (nowMs > speakAtRef.current) {
        speakAtRef.current = nowMs + 4500 + Math.random() * 4500;
        speak(pickMessage());
      }

      if (nowMs > behaviorUntilRef.current) {
        const goWalk = Math.random() < 0.8;
        walkingRef.current = goWalk;
        setIsWalking(goWalk);
        behaviorUntilRef.current =
          nowMs + (goWalk ? 1800 + Math.random() * 2200 : 1000 + Math.random() * 1800);
        if (goWalk) pickNewTarget();
      }

      const pos = posRef.current;

      if (mouseRef.current) {
        const dx = pos.x - mouseRef.current.x;
        const dy = pos.y - mouseRef.current.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < MIN_DIST) {
          const push = (MIN_DIST - dist) * 0.12 * (dt / 16);
          pos.x += (dx / dist) * push;
          pos.y += (dy / dist) * push;
          if (Math.abs(dx) > 1) {
            facingRef.current = dx > 0 ? 1 : -1;
            setFacing(facingRef.current);
          }
          if (!walkingRef.current) {
            walkingRef.current = true;
            setIsWalking(true);
          }
          pickNewTarget();
          behaviorUntilRef.current = nowMs + 1800 + Math.random() * 2200;
        }
      }

      if (walkingRef.current) {
        const dx = targetRef.current.x - pos.x;
        const dy = targetRef.current.y - pos.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 2) {
          const speed = reducedMotionRef.current ? SLOW_SPEED : RUN_SPEED;
          const ease = dist < 50 ? Math.max(0.35, dist / 50) : 1;
          const step = Math.min(dist, speed * ease * (dt / 1000));
          pos.x += (dx / dist) * step;
          pos.y += (dy / dist) * step;
          if (Math.abs(dx) > 0.5) {
            facingRef.current = dx > 0 ? 1 : -1;
            setFacing(facingRef.current);
          }
        }
        const maxX = document.documentElement.clientWidth - SIDE_MARGIN;
        const maxY = document.documentElement.scrollHeight - BOTTOM_MARGIN;
        pos.x = Math.min(maxX, Math.max(SIDE_MARGIN, pos.x));
        pos.y = Math.min(maxY, Math.max(TOP_MARGIN, pos.y));

        legTimerRef.current += dt;
        if (legTimerRef.current > LEG_SWAP_MS) {
          legTimerRef.current = 0;
          setLegFrame((f) => (f === 0 ? 1 : 0));
        }
      }

      if (wrapperRef.current) {
        wrapperRef.current.style.left = `${pos.x}px`;
        wrapperRef.current.style.top = `${pos.y}px`;
      }
    }, 16);
    return () => clearInterval(intervalId);
  }, []);

  function onClickDog() {
    speak(pick(GREETINGS), 3200);
  }

  const mood = stage ? MOOD_BY_STAGE[stage] : "neutral";
  const hidden = HIDDEN_ON.has(pathname ?? "");

  if (!ready || hidden) return null;

  // Deliberately just one absolutely-positioned element with no positioned
  // wrapper around it: with nothing between it and the document root, its
  // top/left resolve in PAGE space, so it scrolls with the content like
  // something that actually lives there instead of floating over it.
  return (
    <div
      ref={wrapperRef}
      className="absolute z-40 pointer-events-none"
      style={{ left: posRef.current.x, top: posRef.current.y, transform: "translate(-50%, -50%)" }}
    >
      {bubble && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[240px] pointer-events-none animate-pop-in">
          <div className="bg-white border border-[#ece9f7] shadow-[0_6px_20px_rgba(26,26,46,0.12)] rounded-xl px-3 py-2 text-xs text-ink leading-snug text-center">
            {bubble}
          </div>
          <div className="w-2.5 h-2.5 bg-white border-r border-b border-[#ece9f7] rotate-45 mx-auto -mt-[7px]" />
        </div>
      )}
      <button
        onClick={onClickDog}
        aria-label="Scout, your study companion"
        className="pointer-events-auto block cursor-pointer bg-transparent border-none p-0"
        style={{
          transform: isWalking
            ? `translateY(${legFrame === 1 ? -3 : 0}px) rotate(${legFrame === 1 ? (facing === 1 ? 2 : -2) : 0}deg)`
            : undefined,
        }}
      >
        <PixelDog size={44} mood={mood} dead={stage === "dead"} legFrame={isWalking ? legFrame : 0} facing={facing} />
      </button>
    </div>
  );
}
