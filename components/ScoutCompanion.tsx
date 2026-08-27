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

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

// Pages without the logged-in app chrome -- Scout doesn't belong there.
const HIDDEN_ON = new Set(["/login"]);

// All distances/positions are in PAGE coordinates (not viewport), so Scout
// scrolls with the page like something actually standing on it.
const MIN_DIST = 100; // never sit closer than this to the live cursor
const WANDER_MIN = 90;
const WANDER_MAX = 260;
const TOP_MARGIN = 100;
const SIDE_MARGIN = 24;
const BOTTOM_MARGIN = 24;
const RUN_SPEED = 150; // px/sec, before per-walk random variation
const SLOW_SPEED = 60; // px/sec, used when the OS prefers reduced motion
const LEG_SWAP_MS = 110;
const MOUSE_CHECK_MS = 7000; // how often he reconsiders wandering toward the cursor
const ESCAPE_COOLDOWN_MS = 1500;

export function ScoutCompanion() {
  const pathname = usePathname();
  const [stage, setStage] = useState<PetStage | null>(null);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [legFrame, setLegFrame] = useState<0 | 1>(0);
  const [isWalking, setIsWalking] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 80, y: 400 });
  const targetRef = useRef({ x: 80, y: 400 });
  const pathStartRef = useRef({ x: 80, y: 400 });
  const pathControlRef = useRef({ x: 80, y: 400 });
  const pathTRef = useRef(1);
  const pathLenRef = useRef(1);
  const pathSpeedRef = useRef(1);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const mouseAnchorRef = useRef<{ x: number; y: number } | null>(null);
  const nextMouseCheckRef = useRef(0);
  const escapeUntilRef = useRef(0);
  const walkingRef = useRef(false);
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
    pathTRef.current = 1;
    speakAtRef.current = Date.now() + 5000;
    behaviorUntilRef.current = Date.now() + 900 + Math.random() * 900;
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

  // A pause between walks is usually short, but sometimes he really does
  // just sit and stay a while -- that variety is what keeps it from
  // reading as a metronome.
  function pickPauseMs(): number {
    const r = Math.random();
    if (r < 0.15) return 5000 + Math.random() * 6000; // a real rest
    if (r < 0.45) return 2000 + Math.random() * 2200; // a normal beat
    return 600 + Math.random() * 1300; // barely a pause
  }

  // Lays out a new curved leg of the walk: a quadratic Bezier from the
  // current spot to a fresh target, bowed sideways by a random amount so
  // the path reads as a natural arc instead of a straight beeline. When
  // `awayFromCursor`, the target is biased to the opposite side of wherever
  // the pointer currently is (used only for the rare "too close" nudge --
  // everyday wandering never chases the live cursor).
  function beginWalk(awayFromCursor = false) {
    const start = { x: posRef.current.x, y: posRef.current.y };
    const maxX = document.documentElement.clientWidth - SIDE_MARGIN;
    const maxY = document.documentElement.scrollHeight - BOTTOM_MARGIN;

    let angle: number;
    let anchor = mouseAnchorRef.current ?? start;
    if (awayFromCursor && mouseRef.current) {
      const away = Math.atan2(start.y - mouseRef.current.y, start.x - mouseRef.current.x);
      angle = away + (Math.random() - 0.5) * (Math.PI / 2);
      anchor = start;
    } else {
      angle = Math.random() * Math.PI * 2;
    }
    const radius = WANDER_MIN + Math.random() * (WANDER_MAX - WANDER_MIN);
    const end = {
      x: clamp(anchor.x + Math.cos(angle) * radius, SIDE_MARGIN, maxX),
      y: clamp(anchor.y + Math.sin(angle) * radius, TOP_MARGIN, maxY),
    };

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.hypot(dx, dy) || 1;
    const perpX = -dy / dist;
    const perpY = dx / dist;
    const bend = (Math.random() - 0.5) * 2 * Math.min(80, dist * 0.5);
    // A quadratic Bezier always stays within the convex hull of its three
    // control points, so clamping this one to the same bounds as start/end
    // guarantees the whole curve does too -- otherwise a bend near a page
    // edge can bow the path off-page even though both endpoints are valid.
    const control = {
      x: clamp((start.x + end.x) / 2 + perpX * bend, SIDE_MARGIN, maxX),
      y: clamp((start.y + end.y) / 2 + perpY * bend, TOP_MARGIN, maxY),
    };

    pathStartRef.current = start;
    pathControlRef.current = control;
    targetRef.current = end;
    pathLenRef.current = Math.max(30, dist);
    pathTRef.current = 0;
    pathSpeedRef.current = 0.75 + Math.random() * 0.6;
    walkingRef.current = true;
    setIsWalking(true);
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

      // Only reconsider "where's the mouse" every few seconds -- he keeps
      // you company in the general area, he doesn't track your cursor.
      if (nowMs > nextMouseCheckRef.current) {
        nextMouseCheckRef.current = nowMs + MOUSE_CHECK_MS;
        if (mouseRef.current) mouseAnchorRef.current = { ...mouseRef.current };
      }

      // Personal-space reflex: this one DOES use the live cursor (not the
      // throttled anchor) and can interrupt whatever he's doing, but it's
      // cooldown-gated so it reacts once and then leaves it alone rather
      // than fighting the cursor every tick.
      if (mouseRef.current && nowMs > escapeUntilRef.current) {
        const d = Math.hypot(posRef.current.x - mouseRef.current.x, posRef.current.y - mouseRef.current.y);
        if (d < MIN_DIST) {
          escapeUntilRef.current = nowMs + ESCAPE_COOLDOWN_MS;
          beginWalk(true);
        }
      }

      const pos = posRef.current;

      if (walkingRef.current) {
        const speed = (reducedMotionRef.current ? SLOW_SPEED : RUN_SPEED) * pathSpeedRef.current;
        pathTRef.current += (speed * (dt / 1000)) / pathLenRef.current;

        if (pathTRef.current >= 1) {
          pos.x = targetRef.current.x;
          pos.y = targetRef.current.y;
          walkingRef.current = false;
          setIsWalking(false);
          behaviorUntilRef.current = nowMs + pickPauseMs();
        } else {
          const t = pathTRef.current;
          const mt = 1 - t;
          const s = pathStartRef.current;
          const c = pathControlRef.current;
          const e = targetRef.current;
          pos.x = clamp(
            mt * mt * s.x + 2 * mt * t * c.x + t * t * e.x,
            SIDE_MARGIN,
            document.documentElement.clientWidth - SIDE_MARGIN
          );
          pos.y = clamp(
            mt * mt * s.y + 2 * mt * t * c.y + t * t * e.y,
            TOP_MARGIN,
            document.documentElement.scrollHeight - BOTTOM_MARGIN
          );
          const tangentX = 2 * mt * (c.x - s.x) + 2 * t * (e.x - c.x);
          if (Math.abs(tangentX) > 0.5) {
            facingRef.current = tangentX > 0 ? 1 : -1;
            setFacing(facingRef.current);
          }
        }

        legTimerRef.current += dt;
        if (legTimerRef.current > LEG_SWAP_MS) {
          legTimerRef.current = 0;
          setLegFrame((f) => (f === 0 ? 1 : 0));
        }
      } else {
        if (nowMs > behaviorUntilRef.current) {
          beginWalk(false);
        } else if (Math.random() < 0.003) {
          // An idle glance side to side -- small, infrequent, alive.
          facingRef.current = facingRef.current === 1 ? -1 : 1;
          setFacing(facingRef.current);
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
        className="pointer-events-auto block cursor-pointer bg-transparent border-none p-0 transition-transform duration-150 ease-out"
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
