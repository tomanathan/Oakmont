"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PixelDog } from "./PixelDog";
import { MOOD_BY_STAGE } from "./PetAvatar";
import type { PetStage } from "@/lib/pet";
import { dedupedFetchJson } from "@/lib/dedupeFetch";

// Ozho's whole voice, in one place. The character: an enthusiastic,
// slightly goofy study buddy who treats prep like something the two of you
// are doing together, not a chore he's supervising -- warm and a little
// funny rather than a flat "good job" narrator, but never so jokey it
// drowns out the actual encouragement. Kept warm and low-pressure on
// purpose -- Ozho is a companion, not a nag. Even the "hungry"/"critical"
// pool below invites rather than guilt-trips, regardless of how urgent the
// pet-death countdown actually is.
//
// Kept free of anything presupposing a *return* visit (no "good to see you
// back," "welcome back," etc.) -- this same pool is what plays on a brand
// new account's very first session, seconds after signing up, so nothing
// here can be wrong the first time it's ever said. It's also what plays
// every time you click him while he's awake, so it has to hold up as a
// repeatable "you got my attention" line, not just a first hello.
const GREETINGS = [
  "Woof! Tail's already wagging.",
  "Hey there — ready when you are.",
  "Oh, hi! Perfect timing.",
  "I'm rooting for you today.",
  "You rang? Let's do this.",
  "Hi! Nudge me anytime, I don't mind.",
];
// The general-purpose ambient pool -- fires when there's no page-specific
// line to reach for (see PAGE_LINES below) or the roll just lands here.
// Genuine encouragement first, personality second.
const ENCOURAGEMENTS = [
  "Every problem you crack makes test day a little less scary.",
  "Small steps still count — one quiz is still a win.",
  "Proud of you for showing up today. That's most of the battle.",
  "Take a breather if you need one — I'm not going anywhere.",
  "One question at a time. That's the whole trick.",
  "You don't have to be perfect today. Just a little better than yesterday.",
  "I believe in you more than I believe in squirrels being fast.",
];
const NUDGES = [
  "I'd love a little study time with you today, if you've got a minute.",
  "No pressure at all — even five minutes counts.",
  "Whenever you're ready, I'll come along for the ride.",
  "A quick quiz would make my tail very happy.",
];
// What he says if you click him awake -- distinct from the normal
// click-to-greet pool so waking him up actually feels like waking him up.
const SLEEPY_WAKE_PHRASES = [
  "*yawn* ...oh, hi!",
  "Huh? Oh — welcome back!",
  "Mmm... must've dozed off. Hi!",
  "*stretch* Okay, okay, I'm up!",
  "Wha— oh, it's you! Perfect timing.",
];
// What he says while doing his trick -- fired by a window "ozho:celebrate"
// event (mastering a subskill, a streak milestone, unlocking a wardrobe
// costume). A caller can pass its own message via the event detail instead
// (most do, and are written in this same voice -- see SubskillClient.tsx,
// AnalysisClient.tsx, SettingsClient.tsx); this is just the fallback when
// none is given.
const CELEBRATION_PHRASES = [
  "Woo! Nailed it!",
  "Watch this!",
  "Yes!! Let's go!",
  "That's how it's done!",
  "Okay, THAT deserved a spin.",
  "Did you see that?! I mean — did YOU see what you just did?",
];
// Cross-cutting reminders that hold up no matter where he says them.
// Anything specific enough to only make sense on one page lives in
// PAGE_LINES instead, below.
const TIPS = [
  "You can retake any quiz to lock in what you learned.",
  "Missed one? Read the explanation before moving on — it really does stick better.",
  "A few minutes today beats one big cram session later.",
  "Every practice test earns a real spot in your plan — none of it's just for show.",
];

// One line-pool per page, so what he says while nav-speak fires (see the
// pathname effect below) is actually ABOUT where the student just landed --
// "let's dig into this one" on a lesson, "click a week to see what's
// coming" on the plan -- instead of the same wherever-you-are filler on
// every screen. pickMessage() below also folds these into its ambient rolls
// while sitting on that page, not just on arrival.
type PageKind = "dashboard" | "plan" | "analysis" | "subskill" | "settings";

const PAGE_LINES: Record<PageKind, string[]> = {
  dashboard: [
    "Your plan's lined up for today — let's knock it out.",
    "One quiz at a time. I'll be right here.",
    "Today's a good day to get a little better than yesterday.",
    "Curious how your practice tests are trending? Analysis has the full story.",
  ],
  plan: [
    "This is the whole road to test day — one week at a time.",
    "Click into any week to see it broken down day by day.",
    "All your practice tests are already scheduled in here, spaced out on purpose.",
    "Every week you finish here is one less thing to worry about later.",
  ],
  analysis: [
    "Let's see how you're trending.",
    "Every test you log here is a clue about where to focus next.",
    "Numbers don't lie — and yours are worth a look.",
    "A rough practice test just means we now know exactly what to fix.",
  ],
  subskill: [
    "Alright, let's dig into this one.",
    "Read close — the trick's usually hiding in the details.",
    "Take your time. I'm not timing you, promise.",
    "You've got this. I'll be cheering from right here.",
  ],
  settings: [
    "Set a target date here and your whole plan resizes to fit it.",
    "Go on, dress me up. I really don't mind.",
    "A clear goal makes the whole plan make more sense.",
  ],
};

function pageKindFor(pathname: string | null): PageKind | null {
  if (!pathname) return null;
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/plan")) return "plan";
  if (pathname.startsWith("/analysis")) return "analysis";
  if (pathname.startsWith("/subskill")) return "subskill";
  if (pathname.startsWith("/settings")) return "settings";
  return null;
}

function streakLines(n: number): string[] {
  return [
    `${n}-day streak?! Look at you go.`,
    `${n} days in a row — I'm impressed.`,
    `Still going strong at ${n} days. Love it.`,
  ];
}

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
// Bold, reasonably large text reads as a heading/label in this app's own
// styling (headings here are styled divs like "text-[15px] font-bold", not
// semantic <h1>-<h3> tags, so this is a font-weight/size heuristic rather
// than a tag list). Landing with the *bubble* on top of one of these is a
// real problem -- it was caught hiding page titles like "What is the SAT?"
// and "Study goals" outright -- unlike an occasional bubble edge brushing
// ordinary body copy, which stays a minor, momentary cosmetic thing (see
// BUBBLE_HALF_W's own comment above). Deliberately much narrower than "all
// text" so it doesn't reproduce the over-rejection problem that comment
// describes: most on-page text is regular weight and won't match this.
const HEADING_MIN_WEIGHT = 600;
const HEADING_MIN_SIZE_PX = 15;
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
// The tail wag's own cadence -- deliberately independent of the leg swap
// (and of walking at all): see the tailFrame prop's doc in PixelDog.tsx
// for why this is a drawn-position swap rather than a CSS animation, and
// the render loop below for why it runs on almost every tick regardless
// of what else he's doing. Per-frame, not per-cycle -- with six frames
// ping-ponged 0..5..0, a full back-and-forth swing takes 10 steps
// (~700ms at this value), which is what actually reads as a fast, lively
// wag rather than a slow one; a 160ms figure here would drag the same
// swing out to 1.6s if read as a whole-cycle number instead.
const TAIL_SWAP_MS = 70;
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
const RETURN_PHRASES = ["Wait up!", "Coming!", "Right behind you!", "Don't leave me behind!", "Hold on, I'm coming!"];

// Talking is now mostly reactive (a new page = a new problem, or new
// results to react to) rather than on a chatty ambient timer. The ambient
// timer still exists as a rare fallback so he isn't completely silent
// during a long stretch on one page, but it's deliberately slow and only
// partly likely to actually fire even when it comes due, so it doesn't
// read as a metronome.
const AMBIENT_SPEAK_MIN_MS = 55000;
const AMBIENT_SPEAK_MAX_MS = 140000;
const AMBIENT_SPEAK_CHANCE = 0.6;
// Chance he actually says something after navigating to a new page, and
// how long he waits first so it reads as a reaction, not a trigger. Now
// that nav-speak reaches for a line about the page he actually landed on
// (see PAGE_LINES above) rather than generic filler, a higher chance still
// reads as purposeful company instead of noise.
const NAV_SPEAK_CHANCE = 0.85;
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
  // The tail wag: stepped through PixelDog's six drawn positions on its
  // own timer below, independent of walking/idle/page -- see
  // TAIL_SWAP_MS and PixelDog's tailFrame prop for why this is a
  // drawn-position swap rather than a CSS animation.
  const [tailFrame, setTailFrame] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [isWalking, setIsWalking] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [behindText, setBehindText] = useState(false);
  const [asleep, setAsleep] = useState(false);
  const [sleepAnim, setSleepAnim] = useState<"none" | "falling" | "waking">("none");
  const [trick, setTrick] = useState(false);
  // A small hop played whenever he speaks while standing still -- see
  // speak() below. Deliberately never triggered mid-walk (matches the
  // existing isWalking-gated inline transform just below in the render
  // return): stacking a second transform-changing animation on top of the
  // walk-cycle's own inline transform is exactly the kind of silent
  // clobbering the bubble's centering bug (see its own comment lower down)
  // already burned this component on once.
  const [perk, setPerk] = useState(false);
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
  // Subset of textRectsRef that also looks heading-like -- see
  // HEADING_MIN_WEIGHT/HEADING_MIN_SIZE_PX above. Only consulted when
  // picking a spot to rest (isValidLanding), never for the body's own
  // text-avoidance or the mid-walk fade-through.
  const headingRectsRef = useRef<{ left: number; top: number; right: number; bottom: number }[]>([]);
  const returningRef = useRef(false);
  const walkingRef = useRef(false);
  const facingRef = useRef<1 | -1>(1);
  const reducedMotionRef = useRef(false);
  const behaviorUntilRef = useRef(0);
  const speakAtRef = useRef(0);
  const legTimerRef = useRef(0);
  const tailTimerRef = useRef(0);
  // Which way tailFrame is currently stepping (see the ping-pong logic
  // below) -- mirrored in a ref, not just derived from tailFrame state,
  // because it needs to persist across ticks inside the setInterval
  // callback the same way every other timer-driven value here does.
  const tailDirRef = useRef<1 | -1>(1);
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
  const perkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    dedupedFetchJson<{ stage: PetStage; currentStreak?: number; costume?: string | null }>("/api/pet/state")
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

    // Keeps the costume he's actually wearing current after an equip in
    // Settings. ScoutCompanion only ever fetches /api/pet/state once, on
    // this very first mount at the root layout -- it never remounts on
    // client-side navigation, so without this it would just keep showing
    // whatever costume was equipped when the tab was first opened. Applying
    // the new costume directly from the event, rather than re-fetching, is
    // instant and doesn't depend on any refetch actually firing.
    function onCostumeChange(e: Event) {
      const detail = (e as CustomEvent<{ costume: string | null }>).detail;
      if (detail) setCostume(detail.costume);
    }
    window.addEventListener("ozho:costume", onCostumeChange);

    return () => {
      mq.removeEventListener?.("change", onMotionChange);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("click", onInteract);
      window.removeEventListener("ozho:celebrate", onCelebrate);
      window.removeEventListener("ozho:costume", onCostumeChange);
      if (trickTimeoutRef.current) clearTimeout(trickTimeoutRef.current);
      if (perkTimeoutRef.current) clearTimeout(perkTimeoutRef.current);
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
    const headingRects: { left: number; top: number; right: number; bottom: number }[] = [];
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
      const rect = { left: cr.left + scrollX, top: cr.top + scrollY, right: cr.right + scrollX, bottom: cr.bottom + scrollY };
      rects.push(rect);
      // Computed style is only read for elements that already cleared the
      // checks above, so this stays bounded by the same MAX_TEXT_RECTS cap
      // rather than adding an unbounded second pass over the DOM.
      const cs = getComputedStyle(el);
      if (parseFloat(cs.fontWeight) >= HEADING_MIN_WEIGHT && parseFloat(cs.fontSize) >= HEADING_MIN_SIZE_PX) {
        headingRects.push(rect);
      }
    }
    textRectsRef.current = rects;
    headingRectsRef.current = headingRects;
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

  // Would a speech bubble popped up from (x,y) land on a heading-like
  // element? Only checked when picking a spot to REST (isValidLanding) --
  // deliberately not part of overlapsText/the mid-walk fade, so this can't
  // reproduce the "nowhere valid to land" over-rejection that came from
  // once checking the wider bubble zone against *all* text.
  function overlapsHeadingBubbleZone(x: number, y: number) {
    const l = x - BUBBLE_HALF_W;
    const r = x + BUBBLE_HALF_W;
    const t = y - BUBBLE_ABOVE;
    const b = y;
    const rects = headingRectsRef.current;
    for (let i = 0; i < rects.length; i++) {
      const rc = rects[i];
      if (rectsOverlap(l, t, r, b, rc.left, rc.top, rc.right, rc.bottom)) return true;
    }
    return false;
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
    // A little hop of delight to go with the line -- only while he's
    // actually standing still (see the `perk` state's own comment). A
    // celebration's own bigger trick+spin plays on top of this via
    // className priority in the render return, so this never needs to
    // check for that case itself.
    if (!walkingRef.current) {
      if (perkTimeoutRef.current) clearTimeout(perkTimeoutRef.current);
      setPerk(true);
      perkTimeoutRef.current = setTimeout(() => setPerk(false), 260);
    }
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
    if (streakRef.current >= 2 && (s === "thriving" || s === "content") && roll < 0.22) {
      return pick(streakLines(streakRef.current));
    }
    // Whatever page he's actually standing on gets first crack at a line --
    // see PAGE_LINES above. Falls through to the general pools on pages
    // with no dedicated lines (e.g. /welcome) or when the roll misses.
    const kind = pageKindFor(pathname);
    if (kind && roll < 0.55) return pick(PAGE_LINES[kind]);
    if (roll < 0.8) return pick(TIPS);
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
      if (overlapsHeadingBubbleZone(x, y)) return false;
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

      // The tail wag: alternates on its own clock every tick, on top of
      // (not gated by) whatever else this tick does -- walking, standing
      // still, talking, wandering off text, all of it. That's the point:
      // wagging almost regardless of what he's otherwise up to, rather
      // than only in specific states. Skipped only when actually dead
      // (PixelDog ignores tailFrame then anyway, so this is just not
      // wasting the tick). Reduced motion slows this down a lot rather
      // than turning it off outright -- same "slow down, don't eliminate"
      // choice walking itself already makes for that preference (see
      // SLOW_SPEED vs RUN_SPEED below) -- so it's never fully invisible.
      if (stageRef.current !== "dead") {
        tailTimerRef.current += dt;
        const swapMs = reducedMotionRef.current ? TAIL_SWAP_MS * 4 : TAIL_SWAP_MS;
        if (tailTimerRef.current > swapMs) {
          tailTimerRef.current = 0;
          // Ping-pong through the six frames (0..5..0) rather than
          // looping 5 straight back to 0 -- this is a back-and-forth
          // swing, not a spin, so it reverses direction at each end
          // instead of snapping backward.
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
            : perk
            ? "animate-perk"
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
          tailFrame={tailFrame}
          facing={facing}
          costume={costume}
        />
      </button>
    </div>
  );
}
