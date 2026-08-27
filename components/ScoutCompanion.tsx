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

// Order-independent on purpose: if a transient layout read ever makes
// max < min (e.g. clientWidth briefly smaller than the margin itself),
// this still returns a sensible value instead of collapsing to `max`
// (which a naive min(max, max(min, v)) would do whenever min > max).
function clamp(v: number, min: number, max: number): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.min(hi, Math.max(lo, v));
}

// Pages without the logged-in app chrome -- Scout doesn't belong there.
const HIDDEN_ON = new Set(["/login"]);

// All distances/positions are in PAGE coordinates (not viewport), so Scout
// scrolls with the page like something actually standing on it.

// The area kept clear of text -- not just his body, but the zone above him
// where a speech bubble renders too (he speaks often enough that this
// needs to be checked proactively, not just while a bubble happens to be
// showing). Sized to the bubble's own max-width/typical height plus its
// gap, so "clear of text" means clear of anything he could show, not just
// his sprite. Hovering just outside this box is still fine -- it isn't
// padded beyond what he can actually cover.
const FOOTPRINT_HALF_W = 120;
const FOOTPRINT_ABOVE = 90;
const FOOTPRINT_BELOW = 20;
const TEXT_SELECTOR =
  "h1,h2,h3,h4,h5,h6,p,span,li,td,th,label,a,button,strong,em,b,i,small,dt,dd,blockquote,figcaption,caption,legend,summary";
const TEXT_REFRESH_MS = 1500;

const MIN_DIST = 100; // never sit closer than this to the live cursor
const WANDER_MIN = 90;
const WANDER_MAX = 260;
// Floored to the bubble's own footprint (not just his body) so the bubble
// itself can never render past the page edge -- a target picked right at
// the old, tighter margin left the bubble's other side hanging off-screen.
const TOP_MARGIN = FOOTPRINT_ABOVE + 10;
const SIDE_MARGIN = FOOTPRINT_HALF_W;
const BOTTOM_MARGIN = 24;
const RUN_SPEED = 150; // px/sec, before per-walk random variation
const SLOW_SPEED = 60; // px/sec, used when the OS prefers reduced motion
const LEG_SWAP_MS = 110;
const MOUSE_CHECK_MS = 7000; // how often he reconsiders wandering toward the cursor
const ESCAPE_COOLDOWN_MS = 1500;
// Text doesn't move, so unlike the cursor reflex this doesn't need heavy
// damping to avoid fighting a moving target -- keep it short so a fresh
// overlap (crossing through a different block mid-transit, say) gets
// corrected almost immediately rather than sitting for up to 1.5s.
const TEXT_ESCAPE_COOLDOWN_MS = 200;

// How far outside the visible viewport he has to drift before he notices
// and dashes back, and how much faster that dash is than his normal pace.
const OUT_OF_VIEW_MARGIN = 40;
const RETURN_SPEED_MULT = 2.1;
const RETURN_PHRASES = ["Wait up!", "Coming!", "Right behind you!", "Don't leave me behind!"];

function rectsOverlap(
  al: number,
  at: number,
  ar: number,
  ab: number,
  bl: number,
  bt: number,
  br: number,
  bb: number
): boolean {
  return al < br && ar > bl && at < bb && ab > bt;
}

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
  const textEscapeUntilRef = useRef(0);
  const textRectsRef = useRef<{ left: number; top: number; right: number; bottom: number }[]>([]);
  const returningRef = useRef(false);
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
    // Fall back to a sane default if the viewport isn't actually laid out
    // yet (same zero-size edge case guarded against in the render loop).
    const vw0 = window.innerWidth || 800;
    const vh0 = window.innerHeight || 600;
    const startX = vw0 / 2;
    const startY = window.scrollY + Math.min(vh0 - 120, vh0 * 0.55);
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

  // Keeps a snapshot of every visible text element's page-space bounding
  // box, so movement can steer clear of them -- refreshed on navigation,
  // on resize, and on an interval to catch content that changes without a
  // route change (quiz answers, saved results, etc.), rather than on every
  // tick, since it walks the whole DOM.
  function refreshTextRects() {
    const els = document.querySelectorAll(TEXT_SELECTOR);
    const rects: { left: number; top: number; right: number; bottom: number }[] = [];
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const wrapper = wrapperRef.current;
    els.forEach((el) => {
      if (wrapper && wrapper.contains(el)) return;
      const text = el.textContent ? el.textContent.trim() : "";
      if (!text) return;
      const cr = el.getBoundingClientRect();
      if (cr.width < 2 || cr.height < 2) return;
      rects.push({
        left: cr.left + scrollX,
        top: cr.top + scrollY,
        right: cr.right + scrollX,
        bottom: cr.bottom + scrollY,
      });
    });
    textRectsRef.current = rects;
  }

  useEffect(() => {
    refreshTextRects();
    const interval = setInterval(refreshTextRects, TEXT_REFRESH_MS);
    window.addEventListener("resize", refreshTextRects);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", refreshTextRects);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Returns the first text box his footprint (body + likely speech-bubble
  // zone, centered on x,y) would overlap, or null if that spot is clear.
  function overlapsText(x: number, y: number) {
    const l = x - FOOTPRINT_HALF_W;
    const r = x + FOOTPRINT_HALF_W;
    const t = y - FOOTPRINT_ABOVE;
    const b = y + FOOTPRINT_BELOW;
    const rects = textRectsRef.current;
    for (let i = 0; i < rects.length; i++) {
      const rc = rects[i];
      if (rectsOverlap(l, t, r, b, rc.left, rc.top, rc.right, rc.bottom)) return rc;
    }
    return null;
  }

  // A point roughly in the middle of whatever's currently on screen, for
  // dashing back into view.
  function pickReturnTarget() {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      x: scrollX + vw * 0.2 + Math.random() * vw * 0.6,
      y: scrollY + vh * 0.25 + Math.random() * vh * 0.5,
    };
  }

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
  // the path reads as a natural arc instead of a straight beeline.
  //   - `avoid`: bias the target to the opposite side of this point (used
  //     for the cursor "too close" and "standing on text" reflexes).
  //   - `forceTarget`: use this point outright (used to dash back into
  //     view) instead of picking a random wander target.
  //   - `urgent`: move faster and straighter -- purposeful, not a stroll.
  // Whatever target comes out gets resampled (or re-picked, for a forced
  // one) up to a few times if it lands on top of a text box, so he never
  // deliberately walks onto text -- only ever right up next to it.
  function beginWalk(opts: { avoid?: { x: number; y: number } | null; urgent?: boolean; forceTarget?: { x: number; y: number } } = {}) {
    const { avoid, urgent = false, forceTarget } = opts;
    const start = { x: posRef.current.x, y: posRef.current.y };
    // Floored at the margin itself so a transient small clientWidth/
    // scrollHeight reading (e.g. mid-layout) can never push max below min.
    const maxX = Math.max(SIDE_MARGIN, document.documentElement.clientWidth - SIDE_MARGIN);
    const maxY = Math.max(TOP_MARGIN, document.documentElement.scrollHeight - BOTTOM_MARGIN);

    function randomCandidate() {
      let angle: number;
      let anchor = mouseAnchorRef.current ?? start;
      if (avoid) {
        const away = Math.atan2(start.y - avoid.y, start.x - avoid.x);
        angle = away + (Math.random() - 0.5) * (Math.PI / 2);
        anchor = start;
      } else {
        angle = Math.random() * Math.PI * 2;
      }
      const radius = WANDER_MIN + Math.random() * (WANDER_MAX - WANDER_MIN);
      return {
        x: clamp(anchor.x + Math.cos(angle) * radius, SIDE_MARGIN, maxX),
        y: clamp(anchor.y + Math.sin(angle) * radius, TOP_MARGIN, maxY),
      };
    }

    // Landing spot is fully validated up front -- text, and (unless this is
    // the urgent dash back into view, which takes priority over personal
    // space) the live cursor too -- rather than walking somewhere and only
    // finding out it doesn't work after arriving. That "arrive, immediately
    // discover it's bad, walk again" pattern is exactly what reads as
    // erratic; picking a target that's already known-good avoids it instead
    // of reacting to it after the fact.
    function isValidLanding(x: number, y: number): boolean {
      if (overlapsText(x, y)) return false;
      if (!forceTarget && mouseRef.current) {
        const d = Math.hypot(x - mouseRef.current.x, y - mouseRef.current.y);
        if (d < MIN_DIST) return false;
      }
      return true;
    }

    let end = forceTarget
      ? { x: clamp(forceTarget.x, SIDE_MARGIN, maxX), y: clamp(forceTarget.y, TOP_MARGIN, maxY) }
      : randomCandidate();
    for (let tries = 0; !isValidLanding(end.x, end.y) && tries < 12; tries++) {
      end = forceTarget ? pickReturnTarget() : randomCandidate();
    }

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.hypot(dx, dy) || 1;
    const perpX = -dy / dist;
    const perpY = dx / dist;
    const bend = (Math.random() - 0.5) * 2 * Math.min(80, dist * 0.5) * (urgent ? 0.35 : 1);
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
    pathSpeedRef.current = urgent ? RETURN_SPEED_MULT + Math.random() * 0.3 : 0.75 + Math.random() * 0.6;
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

      // A tab that isn't actually laid out right now (backgrounded,
      // mid-transition, not yet visible) can report a zero-size viewport,
      // which would otherwise corrupt every bounds/target calculation
      // below into a degenerate single point. Skip the tick entirely
      // rather than compute garbage from it -- position just holds until
      // a real viewport is back, no jump once it is (dt already got
      // reset above so the next real tick isn't inflated).
      if (window.innerWidth < 50 || window.innerHeight < 50) return;

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

      const pos = posRef.current;

      // Highest priority: scrolling him out of the visible viewport means
      // he'd otherwise just sit there off-screen, which undercuts the
      // whole point of anchoring him to the page. Dash back in -- once,
      // not re-triggered every tick while already on the way.
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const outOfView =
        pos.x < scrollX - OUT_OF_VIEW_MARGIN ||
        pos.x > scrollX + vw + OUT_OF_VIEW_MARGIN ||
        pos.y < scrollY - OUT_OF_VIEW_MARGIN ||
        pos.y > scrollY + vh + OUT_OF_VIEW_MARGIN;

      if (outOfView && !returningRef.current) {
        returningRef.current = true;
        beginWalk({ urgent: true, forceTarget: pickReturnTarget() });
        speak(pick(RETURN_PHRASES), 2400);
      }

      // Text-overlap reflex: unconditional, on purpose -- "never cover
      // text" has no exceptions for being mid-return or off in a corner.
      // While returning, redirect to a fresh clear spot in view rather
      // than the normal away-from-this-point wander (staying on-mission).
      if (nowMs > textEscapeUntilRef.current) {
        const hit = overlapsText(pos.x, pos.y);
        if (hit) {
          textEscapeUntilRef.current = nowMs + TEXT_ESCAPE_COOLDOWN_MS;
          if (returningRef.current) {
            beginWalk({ urgent: true, forceTarget: pickReturnTarget() });
          } else {
            beginWalk({ avoid: { x: (hit.left + hit.right) / 2, y: (hit.top + hit.bottom) / 2 } });
          }
        }
      }

      // Personal-space reflex only applies during genuinely normal
      // wandering -- not while out of view or mid-dash back into it.
      if (!outOfView && !returningRef.current && mouseRef.current && nowMs > escapeUntilRef.current) {
        const d = Math.hypot(pos.x - mouseRef.current.x, pos.y - mouseRef.current.y);
        if (d < MIN_DIST) {
          escapeUntilRef.current = nowMs + ESCAPE_COOLDOWN_MS;
          beginWalk({ avoid: mouseRef.current });
        }
      }

      if (walkingRef.current) {
        const speed = (reducedMotionRef.current ? SLOW_SPEED : RUN_SPEED) * pathSpeedRef.current;
        pathTRef.current += (speed * (dt / 1000)) / pathLenRef.current;

        if (pathTRef.current >= 1) {
          pos.x = targetRef.current.x;
          pos.y = targetRef.current.y;
          walkingRef.current = false;
          setIsWalking(false);
          returningRef.current = false;
          behaviorUntilRef.current = nowMs + pickPauseMs();
          // A brief settle window before the cursor reflex can fire again --
          // the landing spot was already validated against where the
          // cursor was, so this is just a moment to actually stand there
          // rather than risk an instant re-trigger off a coincidental
          // cursor move landing right as he arrives.
          escapeUntilRef.current = nowMs + 400;
        } else {
          const t = pathTRef.current;
          const mt = 1 - t;
          const s = pathStartRef.current;
          const c = pathControlRef.current;
          const e = targetRef.current;
          pos.x = clamp(
            mt * mt * s.x + 2 * mt * t * c.x + t * t * e.x,
            SIDE_MARGIN,
            Math.max(SIDE_MARGIN, document.documentElement.clientWidth - SIDE_MARGIN)
          );
          pos.y = clamp(
            mt * mt * s.y + 2 * mt * t * c.y + t * t * e.y,
            TOP_MARGIN,
            Math.max(TOP_MARGIN, document.documentElement.scrollHeight - BOTTOM_MARGIN)
          );
          const tangentX = 2 * mt * (c.x - s.x) + 2 * t * (e.x - c.x);
          if (Math.abs(tangentX) > 0.5) {
            facingRef.current = tangentX > 0 ? 1 : -1;
            setFacing(facingRef.current);
          }
        }

        // Faster movement gets faster leg-swaps too, so a return dash reads
        // as a run rather than a fast slide.
        legTimerRef.current += dt;
        const legSwapThreshold = LEG_SWAP_MS / Math.max(0.6, pathSpeedRef.current);
        if (legTimerRef.current > legSwapThreshold) {
          legTimerRef.current = 0;
          setLegFrame((f) => (f === 0 ? 1 : 0));
        }
      } else {
        if (nowMs > behaviorUntilRef.current) {
          beginWalk();
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
