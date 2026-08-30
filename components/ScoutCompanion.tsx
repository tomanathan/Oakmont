"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PixelDog } from "./PixelDog";
import { MOOD_BY_STAGE } from "./PetAvatar";
import type { PetStage } from "@/lib/pet";

// Kept warm and low-pressure on purpose -- Ozho is a companion, not a
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
// What he says if you click him awake -- distinct from the normal
// click-to-greet pool so waking him up actually feels like waking him up.
const SLEEPY_WAKE_PHRASES = [
  "*yawn* ...oh, hi!",
  "Huh? Oh — welcome back!",
  "Mmm... must've dozed off. Hi!",
];
// What he says while doing his trick -- fired by a window "ozho:celebrate"
// event (mastering a subskill, a streak milestone, unlocking a wardrobe
// costume). A caller can pass its own message via the event detail instead;
// this is just the fallback when none is given.
const CELEBRATION_PHRASES = ["Woo! Nailed it!", "Watch this!", "Yes!! Let's go!", "That's how it's done!"];
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

// Pages without the logged-in app chrome -- Ozho doesn't belong there.
const HIDDEN_ON = new Set(["/login"]);

// All distances/positions are in PAGE coordinates (not viewport), so Ozho
// scrolls with the page like something actually standing on it.

// What "clear of text" requires of his actual BODY -- kept tight to his
// real sprite size (44x44, plus a small buffer), not padded out to the
// bubble's footprint. That distinction matters now that text detection is
// comprehensive (see refreshTextRects): a big chunk of most pages is text,
// so a landing/crossing check padded out to bubble size would reject
// almost everywhere and leave him constantly re-planning -- exactly the
// "spastic" repeated-correction feel we're avoiding. His body only ever
// needs to clear itself; the bubble is a separate, softer concern below.
const BODY_HALF_W = 26;
const BODY_ABOVE = 26;
const BODY_BELOW = 22;
// The zone a speech bubble renders in, above and to the sides of him --
// used only to keep his page-bounds margins generous enough that the
// bubble itself can never render past the page edge (see SIDE_MARGIN/
// TOP_MARGIN below). Deliberately NOT used for text-overlap: requiring
// this whole area to be clear of text before he's allowed to stand
// somewhere is what caused the over-rejection above. An occasional bubble
// edge brushing nearby text is a minor, momentary cosmetic thing; getting
// stuck unable to find anywhere to land is not.
const BUBBLE_HALF_W = 120;
const BUBBLE_ABOVE = 90;
const TEXT_REFRESH_MS = 1500;
// Defensive cap on how many text-bearing elements one refresh will collect
// -- keeps a pathologically text-dense page from turning a 1.5s interval
// into a long layout-thrashing scan.
const MAX_TEXT_RECTS = 1500;
// A momentary gap between two adjacent text elements (e.g. crossing from
// one list item's line into the next) shouldn't flip the behind-text
// fade/speed-up off and back on within the same stride -- that read as a
// flicker. Once he's counted as "on text," staying counted as such for a
// short grace period after the literal overlap ends smooths that out.
const TEXT_EXIT_GRACE_MS = 250;

const MIN_DIST = 100; // never sit closer than this to the live cursor
const WANDER_MIN = 90;
const WANDER_MAX = 260;
// Floored to the bubble's own footprint (not his body) so the bubble
// itself can never render past the page edge -- a target picked right at
// a tighter margin would leave the bubble's other side hanging off-screen.
const TOP_MARGIN = BUBBLE_ABOVE + 10;
const SIDE_MARGIN = BUBBLE_HALF_W;
const BOTTOM_MARGIN = 24;
const RUN_SPEED = 150; // px/sec, before per-walk random variation
const SLOW_SPEED = 60; // px/sec, used when the OS prefers reduced motion
const LEG_SWAP_MS = 110;
const MOUSE_CHECK_MS = 7000; // how often he reconsiders wandering toward the cursor
const ESCAPE_COOLDOWN_MS = 1500;
// Only used now for the "landed somewhere bad" recovery walk (e.g. right
// after a page change) -- crossing text mid-walk no longer triggers a
// redirect at all, so this doesn't need to be as trigger-happy as before.
const TEXT_ESCAPE_COOLDOWN_MS = 400;

// Crossing text while walking is fine -- he's passing by, not settling in
// -- but he fades out and quickens through it so a reader never mistakes
// him for staying put on top of what they're reading, and so he doesn't
// linger there either.
const BEHIND_TEXT_OPACITY = 0.4;
const BEHIND_TEXT_SPEED_MULT = 1.8;

// How far outside the visible viewport he has to drift before he notices
// and dashes back, and how much faster that dash is than his normal pace.
const OUT_OF_VIEW_MARGIN = 40;
const RETURN_SPEED_MULT = 2.1;
const RETURN_PHRASES = ["Wait up!", "Coming!", "Right behind you!", "Don't leave me behind!"];

// Talking is now mostly reactive (a new page = a new problem, or new
// results to react to) rather than on a chatty ambient timer. The ambient
// timer still exists as a rare fallback so he isn't completely silent
// during a long stretch on one page, but it's deliberately slow and only
// partly likely to actually fire even when it comes due, so it doesn't
// read as a metronome.
const AMBIENT_SPEAK_MIN_MS = 70000;
const AMBIENT_SPEAK_MAX_MS = 160000;
const AMBIENT_SPEAK_CHANCE = 0.55;
// Chance he actually says something after navigating to a new page, and
// how long he waits first so it reads as a reaction, not a trigger.
const NAV_SPEAK_CHANCE = 0.75;
const NAV_SPEAK_DELAY_MIN_MS = 600;
const NAV_SPEAK_DELAY_MAX_MS = 1300;

// No interaction anywhere on the page (mouse, scroll, keyboard, click, or
// a navigation) for this long and he settles down for a nap -- only from
// an already-resting state, never mid-stride. Anything that counts as
// interaction wakes him again immediately.
const IDLE_SLEEP_MS = 60000;
// How long the curl-up/stretch-awake transition plays (see globals.css)
// before the pose actually swaps between standing and curled -- he's
// frozen for the whole thing, same as full sleep.
const SLEEP_ANIM_MS = 450;
// A short extra "stirring" pause after the wake-up animation finishes,
// before he's willing to set off on a fresh walk -- the animation already
// reads as him coming to, this is just a beat to actually get his bearings
// rather than launching straight into a walk the instant it ends.
const WAKE_PAUSE_MIN_MS = 150;
const WAKE_PAUSE_MAX_MS = 400;

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
  const [behindText, setBehindText] = useState(false);
  const [asleep, setAsleep] = useState(false);
  const [sleepAnim, setSleepAnim] = useState<"none" | "falling" | "waking">("none");
  const [trick, setTrick] = useState(false);
  const [costume, setCostume] = useState<string | null>(null);

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
  const onTextRef = useRef(false);
  const lastOnTextAtRef = useRef(-Infinity);
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
  const hasMountedPathRef = useRef(false);
  const navSpeakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteractionAtRef = useRef(Date.now());
  const asleepRef = useRef(false);
  const sleepAnimRef = useRef<"none" | "falling" | "waking">("none");
  const sleepAnimTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // One-time setup: pick a starting spot in page coordinates and fetch
  // Ozho's mood. ScoutCompanion is mounted once at the root layout, so
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
    speakAtRef.current =
      Date.now() + AMBIENT_SPEAK_MIN_MS + Math.random() * (AMBIENT_SPEAK_MAX_MS - AMBIENT_SPEAK_MIN_MS);
    behaviorUntilRef.current = Date.now() + 900 + Math.random() * 900;
    lastInteractionAtRef.current = Date.now();
    setReady(true);

    fetch("/api/pet/state")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.stage) {
          stageRef.current = data.stage;
          streakRef.current = data.currentStreak ?? 0;
          setStage(data.stage);
          setCostume(data.costume && data.costume !== "none" ? data.costume : null);
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
      lastInteractionAtRef.current = Date.now();
    }
    window.addEventListener("pointermove", onMove);

    // Anything else that counts as "someone's here" for the idle-sleep
    // timer, even without the mouse moving -- scrolling to read, typing,
    // clicking anywhere on the page. Lightweight: these only stamp the
    // timestamp, they don't touch mouseRef.
    function onInteract() {
      lastInteractionAtRef.current = Date.now();
    }
    window.addEventListener("scroll", onInteract, { passive: true });
    window.addEventListener("keydown", onInteract);
    window.addEventListener("click", onInteract);

    // Dopamine hook: any page can fire this to have Ozho do a little
    // hop-and-spin trick and say something excited -- mastering a
    // subskill, a streak milestone, unlocking a wardrobe costume. Kept as
    // a window event rather than a prop/context because ScoutCompanion is
    // mounted once at the root layout, far from whatever page triggers it.
    function onCelebrate(e: Event) {
      lastInteractionAtRef.current = Date.now();
      beginWakeUp();
      const detail = (e as CustomEvent<{ message?: string }>).detail;
      speak(detail?.message || pick(CELEBRATION_PHRASES), 3200);
      if (trickTimeoutRef.current) clearTimeout(trickTimeoutRef.current);
      setTrick(true);
      trickTimeoutRef.current = setTimeout(() => setTrick(false), 700);
    }
    window.addEventListener("ozho:celebrate", onCelebrate);

    return () => {
      mq.removeEventListener?.("change", onMotionChange);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("click", onInteract);
      window.removeEventListener("ozho:celebrate", onCelebrate);
      if (trickTimeoutRef.current) clearTimeout(trickTimeoutRef.current);
    };
  }, []);

  // Keeps a snapshot of every visible text element's page-space bounding
  // box, so movement can steer clear of them -- refreshed on navigation,
  // on resize, and on an interval to catch content that changes without a
  // route change (quiz answers, saved results, etc.), rather than on every
  // tick, since it walks the whole DOM.
  //
  // Rather than a fixed list of "text-ish" tag names (which will always
  // miss something -- a raw <div> label, an <option>, a <pre>, whatever
  // the next page happens to use), this walks every element and keeps the
  // ones that directly contain their own non-whitespace text node. That
  // covers every real form of on-page text -- headings, passage copy,
  // answer choices, evidence quotes, captions, table cells, anything --
  // without needing to name it, and just as naturally skips pure layout
  // wrappers that only contain other elements (they have no direct text
  // child of their own). A single bounding rect per qualifying element
  // (not per text node) keeps this at block granularity rather than
  // fragmenting one paragraph into a dozen tiny slivers.
  function refreshTextRects() {
    const rects: { left: number; top: number; right: number; bottom: number }[] = [];
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const wrapper = wrapperRef.current;
    const all = document.body.querySelectorAll("*");
    for (let i = 0; i < all.length && rects.length < MAX_TEXT_RECTS; i++) {
      const el = all[i];
      const tag = el.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "TEMPLATE") continue;
      if (wrapper && wrapper.contains(el)) continue;
      let hasDirectText = false;
      const childNodes = el.childNodes;
      for (let j = 0; j < childNodes.length; j++) {
        const child = childNodes[j];
        if (child.nodeType === 3 && child.textContent && child.textContent.trim()) {
          hasDirectText = true;
          break;
        }
      }
      if (!hasDirectText) continue;
      const cr = el.getBoundingClientRect();
      if (cr.width < 2 || cr.height < 2) continue;
      rects.push({
        left: cr.left + scrollX,
        top: cr.top + scrollY,
        right: cr.right + scrollX,
        bottom: cr.bottom + scrollY,
      });
    }
    textRectsRef.current = rects;
  }

  useEffect(() => {
    // Navigating somewhere is as clear an "I'm here" signal as it gets --
    // wake him immediately (or cancel an in-progress doze) rather than
    // waiting for the render loop's next idle check to notice, so there's
    // no chance of a stray nav-triggered line appearing to come from a dog
    // who's still shown asleep.
    lastInteractionAtRef.current = Date.now();
    beginWakeUp();

    refreshTextRects();
    // A page change swaps the whole text layout out from under him. If
    // he's mid-walk, the target he's headed for was picked against the
    // OLD layout and could now land him at rest on top of new text --
    // replan that leg against the new page rather than letting him arrive
    // somewhere that's only valid on the page he just left. (If he's at
    // rest already, the render loop's own idle-on-text check handles it.)
    if (walkingRef.current && overlapsText(targetRef.current.x, targetRef.current.y)) {
      beginWalk();
    }

    // A new page is the main reason he actually talks now -- a new
    // problem, a fresh set of results, a different part of the plan all
    // read as "something new" worth a reaction. Skipped on the very first
    // run (that's just the initial mount, not a navigation -- the greet
    // effect covers that one), and not guaranteed every time so it doesn't
    // feel mechanical.
    if (hasMountedPathRef.current) {
      if (navSpeakTimeoutRef.current) clearTimeout(navSpeakTimeoutRef.current);
      if (Math.random() < NAV_SPEAK_CHANCE) {
        const delay = NAV_SPEAK_DELAY_MIN_MS + Math.random() * (NAV_SPEAK_DELAY_MAX_MS - NAV_SPEAK_DELAY_MIN_MS);
        navSpeakTimeoutRef.current = setTimeout(() => speak(pickMessage()), delay);
      }
    } else {
      hasMountedPathRef.current = true;
    }

    const interval = setInterval(refreshTextRects, TEXT_REFRESH_MS);
    window.addEventListener("resize", refreshTextRects);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", refreshTextRects);
      if (navSpeakTimeoutRef.current) clearTimeout(navSpeakTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Returns the first text box his actual body (centered on x,y) would
  // overlap, or null if that spot is clear. Deliberately just his body,
  // not the wider bubble-speaking zone -- see BODY_* vs BUBBLE_* above.
  function overlapsText(x: number, y: number) {
    const l = x - BODY_HALF_W;
    const r = x + BODY_HALF_W;
    const t = y - BODY_ABOVE;
    const b = y + BODY_BELOW;
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
    // Any time he actually says something -- whatever the reason -- push
    // the rare ambient fallback back out, so it never stacks a second,
    // unrelated line right on top of one that just showed.
    speakAtRef.current =
      Date.now() + AMBIENT_SPEAK_MIN_MS + Math.random() * (AMBIENT_SPEAK_MAX_MS - AMBIENT_SPEAK_MIN_MS);
  }

  // The standing and curled-up sprites are different art, not one shape
  // that can morph, so the "animation" is a CSS settle/stretch layered on
  // top of whichever pose is showing (see .animate-fall-asleep/-wake-up in
  // globals.css) while the underlying pose swap is held back until it
  // finishes -- these two are the only places that are allowed to touch
  // asleepRef/sleepAnimRef, so every caller (the idle timer, navigation,
  // a direct click) goes through them rather than flipping state directly.
  function clearSleepAnimTimeout() {
    if (sleepAnimTimeoutRef.current) {
      clearTimeout(sleepAnimTimeoutRef.current);
      sleepAnimTimeoutRef.current = null;
    }
  }

  function beginFallAsleep() {
    if (asleepRef.current || sleepAnimRef.current !== "none") return;
    clearSleepAnimTimeout();
    sleepAnimRef.current = "falling";
    setSleepAnim("falling");
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    setBubble(null);
    sleepAnimTimeoutRef.current = setTimeout(() => {
      asleepRef.current = true;
      setAsleep(true);
      sleepAnimRef.current = "none";
      setSleepAnim("none");
      sleepAnimTimeoutRef.current = null;
    }, SLEEP_ANIM_MS);
  }

  // Safe to call any time, including when he's already fully awake -- it's
  // a no-op then. Mid-fall (hasn't actually curled up yet), it just cancels
  // the fall, no stretch animation needed since he was never really under.
  // Already fully asleep, it plays the stretch-awake animation and only
  // flips the pose back to standing once that finishes.
  function beginWakeUp() {
    if (sleepAnimRef.current === "waking") return;
    clearSleepAnimTimeout();
    if (!asleepRef.current) {
      sleepAnimRef.current = "none";
      setSleepAnim("none");
      return;
    }
    sleepAnimRef.current = "waking";
    setSleepAnim("waking");
    sleepAnimTimeoutRef.current = setTimeout(() => {
      asleepRef.current = false;
      setAsleep(false);
      sleepAnimRef.current = "none";
      setSleepAnim("none");
      sleepAnimTimeoutRef.current = null;
      behaviorUntilRef.current = Date.now() + WAKE_PAUSE_MIN_MS + Math.random() * (WAKE_PAUSE_MAX_MS - WAKE_PAUSE_MIN_MS);
    }, SLEEP_ANIM_MS);
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

  // Say hello shortly after Ozho's mood is known (once, ever).
  useEffect(() => {
    if (stage === null || hasGreetedRef.current) return;
    hasGreetedRef.current = true;
    const t = setTimeout(() => speak(pick(GREETINGS), 4000), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // A pause between walks is usually a real rest, not a quick beat --
  // he's a companion sitting nearby, not a wind-up toy that's always
  // mid-stride. Longer, more varied pauses read as more natural (and
  // simply as less busy) than frequent short hops.
  function pickPauseMs(): number {
    const r = Math.random();
    if (r < 0.2) return 8000 + Math.random() * 8000; // a real rest
    if (r < 0.55) return 3500 + Math.random() * 3500; // a normal beat
    return 1500 + Math.random() * 2000; // a brief pause
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
  // deliberately settles on text -- only ever right up next to it. The
  // path there is free to cross text along the way (see the render loop),
  // just never the landing spot itself.
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

      // Idle sleep: no interaction anywhere on the page for a while and he
      // settles down for a nap (via a short curl-up animation), frozen in
      // place until something wakes him (via a short stretch-awake
      // animation). Checked before everything else so the rest of this
      // tick already knows whether he's out cold or mid-transition -- and
      // so a fresh interaction (which stamps lastInteractionAtRef the
      // moment it happens, not on the next tick) wakes him in the very
      // same tick it's noticed in, before any reactive check below gets a
      // chance to act on stale asleep state.
      const idleMs = nowMs - lastInteractionAtRef.current;
      const sleepy = asleepRef.current || sleepAnimRef.current !== "none";
      if (sleepy) {
        if (idleMs < IDLE_SLEEP_MS) beginWakeUp();
      } else if (idleMs > IDLE_SLEEP_MS && !walkingRef.current && stageRef.current !== "dead") {
        beginFallAsleep();
      }

      if (asleepRef.current || sleepAnimRef.current !== "none") {
        // Frozen through the whole sleep lifecycle -- falling asleep,
        // fully out (Zzz rendered off the `asleep` state), and waking back
        // up -- no wandering, no cursor/text reflexes, no ambient chatter.
        // Position doesn't change, so there's nothing else to do this tick.
        return;
      }

      if (nowMs > speakAtRef.current) {
        speakAtRef.current = nowMs + AMBIENT_SPEAK_MIN_MS + Math.random() * (AMBIENT_SPEAK_MAX_MS - AMBIENT_SPEAK_MIN_MS);
        if (Math.random() < AMBIENT_SPEAK_CHANCE) speak(pickMessage());
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

      // Crossing text while walking is allowed now -- he fades and speeds
      // up through it (handled below) rather than getting redirected away,
      // which is what used to make text-dense pages feel like he was
      // stuck fighting the layout. The only time text overlap still
      // triggers a fresh walk is while he's supposed to be at rest: he
      // never picks a resting spot on text in the first place (still
      // enforced in beginWalk), so finding himself on one at a standstill
      // only happens after something moved the goalposts out from under
      // him -- most commonly, landing on a new page whose text layout is
      // completely different from the one he last stood on. Walk out of
      // it, same as any other walk, just triggered immediately instead of
      // waiting for the pause timer.
      const hit = overlapsText(pos.x, pos.y);
      if (hit) lastOnTextAtRef.current = nowMs;
      // Debounced for the visual fade/speed-up only -- a momentary gap
      // between two adjacent text elements (crossing from one list item's
      // line into the next, say) shouldn't flip that off and back on
      // within the same stride. The idle-correction check just below
      // still uses the raw, undebounced hit -- that one's about whether
      // he's actually resting on text right now, not about smoothing a
      // visual.
      const onText = !!hit || nowMs - lastOnTextAtRef.current < TEXT_EXIT_GRACE_MS;
      if (onText !== onTextRef.current) {
        onTextRef.current = onText;
        setBehindText(onText);
      }
      if (hit && !walkingRef.current && nowMs > textEscapeUntilRef.current) {
        textEscapeUntilRef.current = nowMs + TEXT_ESCAPE_COOLDOWN_MS;
        beginWalk({ avoid: { x: (hit.left + hit.right) / 2, y: (hit.top + hit.bottom) / 2 } });
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
        const speed =
          (reducedMotionRef.current ? SLOW_SPEED : RUN_SPEED) *
          pathSpeedRef.current *
          (onText ? BEHIND_TEXT_SPEED_MULT : 1);
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
    // The window-level click listener (see the init effect) already stamps
    // lastInteractionAtRef for the generic idle timer; a direct click on
    // him specifically gets its own sleepy-specific reaction instead of the
    // silent wake the timer would otherwise give him. Captured before
    // beginWakeUp() runs, since that's what actually changes the state.
    const wasAsleep = asleepRef.current || sleepAnimRef.current !== "none";
    beginWakeUp();
    if (wasAsleep) {
      speak(pick(SLEEPY_WAKE_PHRASES), 3200);
      return;
    }
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
      className="absolute z-40 pointer-events-none transition-opacity duration-200"
      style={{
        left: posRef.current.x,
        top: posRef.current.y,
        transform: "translate(-50%, -50%)",
        opacity: behindText ? BEHIND_TEXT_OPACITY : 1,
      }}
    >
      {bubble && (
        // The bubble is out-of-flow (absolute) and always centers on the
        // wrapper's own width regardless of the bubble's own size, so it's
        // dead-center above the dog's head by construction. The one thing
        // that broke that: the pop-in keyframes (globals.css) set
        // `transform: scale(...)` on every step, which -- being the same
        // CSS property as -translate-x-1/2's translateX(-50%) -- silently
        // replaced it for the animation's whole duration (and, via
        // `forwards`, permanently after). The bubble was rendering
        // uncentered and shifted right by half its own width the entire
        // time a pop-in animation had ever run on it, which is also
        // exactly what let a long tip sail its right edge past the page
        // edge undetected by the position-picking margins (which assume
        // it's centered). Fixed at the keyframes, which now carry
        // translateX(-50%) through every step.
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[240px] pointer-events-none animate-pop-in">
          <div className="bg-white border border-[#ece9f7] shadow-[0_6px_20px_rgba(26,26,46,0.12)] rounded-xl px-3 py-2 text-xs text-ink leading-snug text-center">
            {bubble}
          </div>
          <div className="w-2.5 h-2.5 bg-white border-r border-b border-[#ece9f7] rotate-45 mx-auto -mt-[7px]" />
        </div>
      )}
      {asleep && sleepAnim !== "waking" && !bubble && (
        // Three "z"s of increasing size, staggered so they drift up and
        // fade out one after another in a loop rather than all at once --
        // the classic sleepy cue. Sits in the same spot a speech bubble
        // would (bubble is suppressed the instant he falls asleep, so
        // there's never a clash), but visually its own thing: small,
        // muted, and looping instead of a one-shot pop-in.
        <div className="absolute bottom-full left-1/2 mb-1 pointer-events-none" style={{ transform: "translateX(-50%)" }}>
          <div className="relative w-9 h-7">
            <span className="absolute bottom-0 left-0 text-[10px] font-bold text-[#9694b0] animate-zzz" style={{ animationDelay: "0s" }}>
              z
            </span>
            <span className="absolute bottom-0 left-2.5 text-xs font-bold text-[#9694b0] animate-zzz" style={{ animationDelay: "0.55s" }}>
              Z
            </span>
            <span className="absolute bottom-0 left-5 text-sm font-bold text-[#9694b0] animate-zzz" style={{ animationDelay: "1.1s" }}>
              Z
            </span>
          </div>
        </div>
      )}
      <button
        onClick={onClickDog}
        aria-label="Ozho, your study companion"
        className={`pointer-events-auto block cursor-pointer bg-transparent border-none p-0 transition-transform duration-150 ease-out ${
          sleepAnim === "falling"
            ? "animate-fall-asleep"
            : sleepAnim === "waking"
            ? "animate-wake-up"
            : trick
            ? "animate-trick"
            : ""
        }`}
        style={{
          transform:
            !trick && isWalking
              ? `translateY(${legFrame === 1 ? -3 : 0}px) rotate(${legFrame === 1 ? (facing === 1 ? 2 : -2) : 0}deg)`
              : undefined,
        }}
      >
        <PixelDog
          size={44}
          mood={mood}
          dead={stage === "dead"}
          asleep={asleep}
          legFrame={isWalking ? legFrame : 0}
          facing={facing}
          costume={costume}
        />
      </button>
    </div>
  );
}
