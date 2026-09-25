"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PixelDog } from "./PixelDog";
import { MOOD_BY_STAGE } from "./PetAvatar";
import { PET_NAME, type PetStage } from "@/lib/pet";
import { dedupedFetchJson } from "@/lib/dedupeFetch";
import { companionBus } from "@/lib/companionBus";
import { OzhoPanel, type OzhoAction } from "./OzhoPanel";
import { PixelBall, planToss, stepBall, ballGround, setBallTurn, type BallSim } from "./ozhoBall";

// Ozho's whole voice, in one place. The character: a real dog -- ball-
// obsessed, easily delighted, a little smug about his own tricks -- who
// applies dog logic to SAT prep (sniffing out traps, quizzes are meals,
// mistakes are just things to dig up) and genuinely believes in you. Short
// lines, one idea each, funny where it's natural, never at the expense of
// being encouraging. Warm and low-pressure on purpose: he's a companion,
// not a nag, so even the hungry/critical pools invite rather than
// guilt-trip, however close the pet-death countdown actually is. Study
// tips he gives are real SAT strategy, never made-up claims.
//
// Kept free of anything presupposing a *return* visit (no "welcome back")
// -- this same pool plays on a brand-new account's very first session,
// seconds after signing up, so nothing here can be wrong the first time
// it's ever said.
const GREETINGS = [
  "Hi! I saved you a spot.",
  "Oh good, you're here. I was running out of tail to chase.",
  "Hey! Want to get something done together?",
  "Ready when you are. I'm always ready. It's a dog thing.",
  "Hi hi. Click me if you need anything.",
];
// Swapped in for the greeting at the edges of the day.
const MORNING_GREETINGS = ["Morning! Best time of day for a quick quiz.", "Good morning! I've been up for hours. Mostly sniffing."];
const LATE_GREETINGS = [
  "Up late? A short session, then sleep. Sleep is studying too.",
  "Night owl, huh? Me too. Let's keep it quick.",
];
// The general-purpose ambient pool -- fires when there's no page-specific
// line to reach for (see PAGE_LINES below) or the roll just lands here.
const ENCOURAGEMENTS = [
  "One good quiz a day adds up faster than you'd think.",
  "Stuck? Walk away for a minute. Works for me every time.",
  "You don't need a perfect day. A decent one is plenty.",
  "I can't read, and I still believe in you.",
  "Every mistake you make here is one you won't make on test day.",
  "Deep breath. The SAT is just a lot of small questions.",
  "Showing up is the hard part, and you already did it.",
];
const NUDGES = [
  "Tummy's rumbling a little. One quiz would fix that.",
  "No pressure, but a quiz would really make my day.",
  "Even a five-minute quiz counts as dinner for me.",
  "I'll be right here. Quiz whenever you're ready.",
];
// What he says if you click him awake -- distinct from the normal
// click-to-greet pool so waking him up actually feels like waking him up.
const SLEEPY_WAKE_PHRASES = [
  "*yawn* I wasn't asleep. I was resting my eyes.",
  "Mm? Oh! Hi. I was dreaming about tennis balls.",
  "*big stretch* Okay. Awake. Mostly.",
  "Huh? Oh, it's you. Best way to wake up.",
];
// What he says while doing his trick -- fired by a window "ozho:celebrate"
// event (mastering a subskill, a streak milestone, unlocking a wardrobe
// costume). A caller can pass its own message via the event detail instead
// (most do, and are written in this same voice -- see SubskillClient.tsx,
// AnalysisClient.tsx, SettingsClient.tsx); this is just the fallback when
// none is given.
const CELEBRATION_PHRASES = [
  "Yes! Spin time!",
  "Did you SEE that? That was all you.",
  "That's the stuff. Tail at max speed.",
  "Okay, that earned a victory lap.",
  "Woo! Do that again!",
];
// Real SAT strategy, true on any page.
const TIPS = [
  "Read the question's last line twice. That's where traps hide.",
  "On reading questions, the passage always proves the answer.",
  "Math question looks scary? Try plugging in the answer choices.",
  "Desmos is built into the test. It can graph you out of a lot of algebra.",
  "Cross off the choices you know are wrong first. Then sniff the rest.",
  "Missed one? The explanation is where the learning actually happens.",
  "Retakes are free. Take a quiz again once the pattern clicks.",
];

// One line-pool per page, so what he says while nav-speak fires (see the
// pathname effect below) is actually ABOUT where the student just landed --
// "let's dig into this one" on a lesson, "click a week to see what's
// coming" on the plan -- instead of the same wherever-you-are filler on
// every screen. pickMessage() below also folds these into its ambient rolls
// while sitting on that page, not just on arrival.
type PageKind = "dashboard" | "plan" | "subskill" | "settings" | "review";

const PAGE_LINES: Record<PageKind, string[]> = {
  dashboard: [
    "Today's plan is right there. Want to knock out the first one?",
    "The dark button is your next step. I'd press it. If I had thumbs.",
    "Little by little. That's how the whole plan gets done.",
    "My card's over there, if you want to see how I'm doing.",
  ],
  // The plan page also holds practice-test logging (see app/plan/page.tsx),
  // so both halves' lines live here.
  plan: [
    "This is the whole road to test day. We're taking it a week at a time.",
    "Open any week to see it day by day.",
    "Practice tests are spread out on purpose. No scary pile at the end.",
    "Log a practice test up top and the plan leans toward your weak spots.",
    "A rough practice test is useful. It tells us exactly where to dig.",
  ],
  subskill: [
    "New pattern? Sniff out the worked examples first.",
    "Read slowly. Traps love a rushed reader.",
    "No timer on this one. Take all the time you want.",
    "Got one wrong? Perfect. Now we know what to practice.",
  ],
  review: [
    "No labels here. Sniff out what each question wants first.",
    "Not sure? Say so. That's how I know what to bring back.",
    "Old skills, new order. This is how they stick.",
  ],
  settings: [
    "Set your test date and the whole plan resizes around it.",
    "The wardrobe's in here. I have opinions about the scarf.",
    "Change anything you like. I'll keep up.",
  ],
};

function pageKindFor(pathname: string | null): PageKind | null {
  if (!pathname) return null;
  if (pathname.startsWith("/dashboard")) return "dashboard";
  // /analysis itself now only ever redirects to /plan (see
  // app/analysis/page.tsx) and never actually renders, but a pathname
  // check costs nothing and means a stale client-side reference to the
  // old route still resolves to the right dialogue pool instead of none.
  if (pathname.startsWith("/plan") || pathname.startsWith("/analysis")) return "plan";
  if (pathname.startsWith("/subskill")) return "subskill";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/review")) return "review";
  return null;
}

function streakLines(n: number): string[] {
  return [
    `${n} days in a row! My tail can't keep up.`,
    `${n}-day streak. That's a real habit now.`,
    `Streak's at ${n}. I'm very proud and a little smug.`,
  ];
}

// Three more progression-aware pools, same idea as streakLines above: real
// numbers pulled from the student's own account (see the /api/pet/state
// fetch in the mount effect below), not generic filler. Each one is only
// ever reached from pickMessage() when the backing data actually exists
// and means something -- no "0 of 40 mastered", no countdown for a test
// date nobody set, no "weakest domain" pointed at a domain with zero data
// (untouched isn't the same as weak).
function masteryLines(mastered: number, total: number): string[] {
  return [
    `${mastered} of ${total} subskills mastered. I'm keeping count.`,
    `${mastered} down, ${total - mastered} to go. We're getting there.`,
    `You've mastered ${mastered} subskill${mastered === 1 ? "" : "s"}. That's ${mastered === 1 ? "one less thing" : `${mastered} fewer things`} to worry about.`,
  ];
}

// Deliberately does NOT name the domain itself as a source of dread --
// "lagging behind" and "could use some love" both frame it as unfinished
// business, not a weakness to feel bad about, same low-pressure spirit as
// the rest of Ozho's voice (see the top-of-file note on that).
function weakDomainLines(domain: string): string[] {
  return [
    `${domain} could use some love. Want to dig in there next?`,
    `A few more reps in ${domain} and it'll catch up with the rest.`,
    `My nose says ${domain} is the spot to practice next.`,
  ];
}

// Tiered by urgency -- the tone shifts from relaxed ("plenty of runway")
// to focused ("let's make each one count") to a calmer, deliberately
// non-cram-inducing note right before the test itself, rather than one
// generic "N days left" line reused at every distance.
function testCountdownLines(days: number): string[] {
  if (days === 0) {
    return ["It's test day. You've done the work. Go get 'em.", "Today's the day! Breathe, read carefully, trust your prep."];
  }
  if (days === 1) {
    return [
      "Test's tomorrow. Tonight's job: real sleep, no cramming.",
      "One more sleep. Charge your device, pack your stuff, rest up.",
    ];
  }
  if (days <= 7) {
    return [
      `${days} days to go. Short, steady sessions from here.`,
      `${days} days out. Your old mistakes are the best study guide now.`,
    ];
  }
  if (days <= 30) {
    return [
      `${days} days until test day. This is where showing up pays off.`,
      `${days} days left. Plenty of time if we keep at it.`,
    ];
  }
  return [
    `${days} days until the test. Lots of runway, so let's use it well.`,
    `${days} days out. No rush, just steady progress.`,
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

// How far down the *actual page content* goes, in page coordinates --
// used to bound how deep he's ever allowed to wander. Deliberately NOT
// document.documentElement.scrollHeight: that measures the whole
// document, and Ozho's own wrapper (an absolutely-positioned sibling of
// the real content -- see the #app-content div in the root layout) counts
// toward it exactly like any other element would. If his position ever
// ended up deeper than the page's real content -- most commonly by
// carrying a Y coordinate over from a much taller page (a long subskill
// lesson) onto a much shorter one (the dashboard) right after navigating,
// since his position persists across routes on purpose -- the *document's*
// height would balloon to match wherever he happened to be sitting. Every
// wander target is bounded by "however tall the page currently measures,"
// so that inflated number would let him go deeper still, which inflates
// it further, on and on with no ceiling: the runaway "keeps running
// downward, endlessly extending the page" bug. Measuring #app-content
// itself instead sidesteps the loop entirely -- his own position can
// never feed back into this number, because he isn't part of it.
function pageContentBottom(): number {
  const content = document.getElementById("app-content");
  // Falls back to the whole-document measurement only if that element is
  // ever somehow missing -- still correct on any page that doesn't have
  // the runaway problem in the first place, just not loop-proof.
  if (!content) return document.documentElement.scrollHeight;
  return content.getBoundingClientRect().bottom + window.scrollY;
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

const WANDER_MIN = 90;
const WANDER_MAX = 260;
// Floored to the bubble's own footprint (not his body) so the bubble
// itself can never render past the page edge -- a target picked right at
// a tighter margin would leave the bubble's other side hanging off-screen.
const TOP_MARGIN = BUBBLE_ABOVE + 10;
const SIDE_MARGIN = BUBBLE_HALF_W;
const BOTTOM_MARGIN = 24;
const RUN_SPEED = 150; // px/sec, before per-walk random variation
// Locomotion is steered, not scripted: he has a velocity, accelerates
// toward where he wants to be at a limited rate, eases off as he arrives,
// and his legs swap per distance covered rather than on a clock -- so a
// stroll, a trot and a sprint each read as their own gait, starts and
// stops have weight, and a change of mind mid-walk turns him around
// instead of snapping him onto a new curve.
const ACCEL = 520; // px/s^2
const ARRIVE_RADIUS = 80; // starts easing off inside this distance
const MIN_ARRIVE_SPEED = 38;
// Stride per leg swap grows with speed, like a real dog lengthening its
// stride before quickening it.
const strideFor = (speed: number) => 9 + speed * 0.07;
// A gentle, slowly swinging heading offset on ordinary strolls, fading out
// near the target -- the meander a dog has when it isn't in a hurry.
const MEANDER_RAD = 0.38;
const MEANDER_HZ = 0.14;

type IdleAct = "none" | "sniff" | "rest" | "stretch" | "bow" | "tilt" | "hop" | "spin";

// Gaits. Each walk picks one, and the body's bob and lean follow from it:
// a stroll barely rises, a trot bounces, a gallop bounds in a real arc and
// rocks nose-to-tail with each stride.
type Gait = "stroll" | "trot" | "gallop";
const GAIT_BOB: Record<Gait, number> = { stroll: 1.2, trot: 2.6, gallop: 5.5 };
const GAIT_ROCK: Record<Gait, number> = { stroll: 0, trot: 1.5, gallop: 5 };
// How far he leans into speeding up or braking, at most.
const MAX_LEAN_DEG = 7;

// Short idle bits between walks, each a CSS animation (see globals.css)
// that runs for this long.
const IDLE_ACT_MS: Partial<Record<IdleAct, number>> = {
  sniff: 1300,
  bow: 950,
  tilt: 1100,
  hop: 720,
  spin: 1000,
};
// Tail-chasing: he flips to face the other way this often during a spin.
const SPIN_FLIP_MS = 110;

// Zoomies: every so often a healthy Ozho tears around in a burst of quick,
// short gallops, then flops down. Mochi (who follows him) gets swept along.
const ZOOMIES_MIN_MS = 55000;
const ZOOMIES_MAX_MS = 120000;
const ZOOMIES_PHRASES = ["Zoomies!", "Can't stop! Won't stop!", "Nyoom.", "Wheee!"];
// A landing that follows a run this fast gets a little squash.
const LAND_SPEED = 190;

// The fetch ball, drawn a little bigger than the one in his mouth so it
// reads at a glance out on the page; its ground contact is level with his
// feet, BALL_FOOT below his center.
const BALL_SIZE = 12;
const BALL_FOOT = 13;
const STRETCH_MS = 700;
// The tail wag's own cadence -- deliberately independent of the leg swap
// (and of walking at all): see the tailFrame prop's doc in PixelDog.tsx
// for why this is a drawn-position swap rather than a CSS animation, and
// the render loop below for why it runs on almost every tick regardless
// of what else he's doing. Per-frame, not per-cycle -- with six frames
// ping-ponged 0..5..0, a full back-and-forth swing takes 10 steps
// (~450ms at this value), quick enough to read as an eager, happy wag
// rather than a lazy one; a 450ms figure here would be a slow cycle if
// read as a whole-swing number instead of a single-step one.
const TAIL_SWAP_MS = 45;
const MOUSE_CHECK_MS = 7000; // how often he reconsiders wandering toward the cursor

// ---- Cursor behavior ------------------------------------------------------
// He used to flee once the cursor came within a set radius of him -- a
// classic "creature AI" personal-space reflex, but wrong for what he's
// supposed to be: a companion you're meant to reach for and click, not
// something that bolts the moment you get close. He no longer treats the
// cursor as something to avoid at all (isValidLanding doesn't steer wander
// targets away from it, and there's no escape reflex any more) -- instead,
// the cursor resting near him while he's already standing still reads as an
// invitation: a quick happy perk, a glance toward it, and sometimes a short
// line, then he carries on. Never fires mid-walk (a cursor he's simply
// passing isn't "visiting" him) or while the click menu is open (that's its
// own, bigger reaction).
const NOTICE_DIST = 70;
const NOTICE_COOLDOWN_MS = 8000;
const NOTICE_PHRASES = ["Oh! Hi.", "*ears perk up*", "Hey, you.", "Was that a treat? No? Okay.", "*sniff sniff* Hi!"];

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
const RETURN_PHRASES = ["Wait for me!", "Coming, coming!", "Don't scroll without me!", "Right behind you!", "Zoomies!"];

// Below this width, there's no room for him to roam without routing
// straight over lesson prose, answer choices, or score badges -- a phone
// screen doesn't have the wide-open margins a desktop viewport does for
// beginWalk's landing spots to land in. Matches Tailwind's own `sm:`
// breakpoint, which is also where the rest of the app's layout switches
// to a single narrow column. Desktop (>= this width) is untouched -- he
// still roams exactly as before.
const MOBILE_BREAKPOINT = 640;
// Docked position on mobile: pinned to the bottom-right corner of the
// viewport itself (position: fixed, not the page-coordinate absolute
// positioning his desktop wandering uses), so scrolling never carries page
// content underneath a spot he still thinks is "empty". Margins chosen so
// he sits mostly in the page's own edge gutter rather than over the
// content column.
// Top-right, not bottom -- tried bottom-right first and it landed him
// squarely on top of the quiz's answer-choice cards and the Submit button
// on real devices (both full-width, both able to sit anywhere near the
// bottom of the viewport depending on scroll position). Content a student
// is actively reading or about to tap tends to sit mid-to-lower in the
// viewport (that's just comfortable thumb/eye position on a phone); the
// top edge is comparatively the least-attended real estate on every one
// of these pages, closest to how a status bar or app-bar icon reads as
// "chrome", not "part of the page".
const MOBILE_DOCK_MARGIN_X = 10;
// 17, not 10: centers his badge on the app's sticky header bar (see
// AppShell), which leaves this corner clear for him on phones.
const MOBILE_DOCK_MARGIN_Y = 17;
// Rendered noticeably smaller than his normal 44px sprite -- a small
// static badge in the corner reads as an icon; at full size he was heavy
// enough to still feel like he was "sitting on" whatever text happened to
// be nearby.
const MOBILE_DOCK_SIZE = 30;
// Diameter of the opaque circular backdrop behind him while docked, so an
// incidental line of text passing underneath reads as "there's a badge
// here" (like any floating chat-launcher icon) rather than a transparent
// sprite ambiguously sitting mid-sentence.
const MOBILE_DOCK_BADGE_SIZE = 40;
// Half the badge's size -- used to translate the fixed-corner dock into
// an equivalent page coordinate for the moment the action menu is open
// (see openMenu), since the ring-clamping math below was written for
// posRef's normal page-coordinate system, not fixed-viewport corners.
const MOBILE_DOCK_HALF = MOBILE_DOCK_BADGE_SIZE / 2;

// "Follow" mode: he sticks close to the cursor, obviously and continuously,
// rather than ambling back into a wide comfort band every 10+ seconds like
// the old version did (that read as "wanders nearby sometimes", not
// "following"). FOLLOW_SPEED_MULT is even faster than the dash-back-into-
// view speed -- keeping up with the mouse needs more urgency than a one-off
// return trip. Every follow-mode leg is also `straight` (see beginWalk) --
// the normal wander/return-dash bow-sideways-a-bit path reads as drifting
// or overshooting the cursor instead of beelining to it and actually
// planting there. FOLLOW_TOLERANCE is measured straight to the cursor
// itself (see followAnchor), not to the offset landing spot beside it --
// once he's within it he just stays put, full stop, even if that leaves
// him short of the exact landing spot. Measuring against the landing spot
// instead used to mean that whenever the cursor sat down right next to
// him, the landing spot (always offset FOLLOW_OFFSET_X/Y away) was still
// more than a few pixels off, so he'd set off walking away from a cursor
// that was already right there just to plant himself at the "correct"
// offset -- reading exactly like the personal-space flee reflex he isn't
// supposed to have any more (see the "Cursor behavior" note above). Sized
// comfortably past the landing spot's own distance from the cursor
// (~sqrt(70^2+45^2), about 83px) so arriving there reads as "settled",
// not as still-too-far-and-about-to-move-again. He only sets off toward
// the landing spot once the cursor has actually drifted outside this
// radius. FOLLOW_RECHECK_MS is the pause after each short leg completes
// before he re-aims at the cursor's current spot -- kept to about one
// render tick (not zero, so there's still a well-defined "arrived" instant
// rather than re-pathing mid-assignment) rather than pickPauseMs's
// multi-second ambient rests, so back-to-back legs read as one continuous
// chase instead of a walk-stop-walk stutter.
const FOLLOW_SPEED_MULT = 2.6;
const FOLLOW_TOLERANCE = 110;
const FOLLOW_RECHECK_MS = 20;
const FOLLOW_OFFSET_X = 70;
const FOLLOW_OFFSET_Y = 45;

// ---- Click panel: the "full set of things you can do with Ozho" ---------
// Clicking Ozho opens his panel (components/OzhoPanel.tsx); each action
// there is handled in handleMenuAction below.

const PET_PHRASES = [
  "Ohh, right behind the ears. Perfect.",
  "*tail thumping*",
  "Ten out of ten. Would be pet again.",
  "Okay, fully recharged.",
  "You're very good at this.",
  "*happy wiggle*",
];
// After a lot of petting in one day -- see PET_LOTS_THRESHOLD.
const PET_PHRASES_LOTS = [
  "I am officially the most pet dog alive.",
  "Best study break ever. Quiz next, though?",
  "You really like me, huh? Feeling's mutual.",
];
const FETCH_THROW_PHRASES = ["Ball! Ball ball ball!", "Throw it far. I dare you.", "Watch this. I'm very fast."];
const FETCH_RETURN_PHRASES = ["Got it! Again?", "Retrieved. I'm a professional.", "Here! It's only a little slobbery."];
const FOLLOW_ON_PHRASES = ["Right by your side.", "Lead the way. I'll keep up.", "Sticking close. Good boy behavior."];
const FOLLOW_OFF_PHRASES = [
  "Off to sniff around. Call me anytime.",
  "Back to patrolling. Holler if you need me.",
  "I'll be nearby.",
];
const SIT_ON_PHRASES = ["Sitting. Very well, too.", "Staying right here.", "Good sit, right? Right."];
const SIT_OFF_PHRASES = ["Free! Legs stretched.", "Back on my paws.", "Up and ready."];
const NEXT_INTRO = ["Let's go! Follow me.", "Great pick. On it.", "This one? Let's do it."];

const FOLLOW_STORAGE_KEY = "ozho:follow-mode";
const PET_COUNT_KEY = "ozho:pet-count"; // "YYYY-MM-DD:N", resets each day
const PET_LOTS_THRESHOLD = 4;


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
  // The "Pet" menu action's own animation -- a contented wiggle, distinct
  // from both the tiny ambient `perk` hop and the bigger `trick` jump-spin,
  // so being petted actually reads as its own thing (see the className
  // priority in the render return, and .animate-ozho-pet in globals.css).
  const [petting, setPetting] = useState(false);
  // The click menu, plus the two effects a couple of its actions have that
  // outlive the menu itself: a heart burst (pet) and a thrown ball (fetch).
  const [menuOpen, setMenuOpen] = useState(false);
  // What he does with himself between walks, besides standing there: a
  // sniff at the ground, sitting down for a longer rest (then a stretch
  // before setting off again). Glancing around is just a facing flip.
  const [idleAct, setIdleAct] = useState<IdleAct>("none");
  // A quick squash when he pulls up from a fast run.
  const [land, setLand] = useState(false);
  const landTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The sprite's own wrapper: the render loop writes his gait bob and lean
  // straight to it each tick, underneath whatever CSS animation the button
  // above it is playing.
  const bodyRef = useRef<HTMLSpanElement>(null);
  const gaitRef = useRef<Gait>("trot");
  const bobPhaseRef = useRef(0);
  const prevSpeedRef = useRef(0);
  // Top speed reached on the current walk -- he's braked to a crawl by the
  // time he arrives, so the landing squash keys off this instead.
  const peakSpeedRef = useRef(0);
  const leanRef = useRef(0);
  // Zoomies: legs left in the current burst, and when the next can start.
  const zoomLegsRef = useRef(0);
  const zoomiesAtRef = useRef(Date.now() + ZOOMIES_MIN_MS * 0.6 + Math.random() * ZOOMIES_MIN_MS);
  // What a play bow leads into: a dash, a pounce at the cursor, or nothing.
  const afterBowRef = useRef<"dash" | "pounce" | null>(null);
  const spinFlipAtRef = useRef(0);
  const zoomingRef = useRef(false);
  const [panelAnchor, setPanelAnchor] = useState<{ x: number; y: number } | null>(null);
  // Read off /api/pet/state for the panel's status line.
  const [streak, setStreak] = useState(0);
  const [fedToday, setFedToday] = useState(false);
  const [followMode, setFollowMode] = useState(false);
  // Below MOBILE_BREAKPOINT he's docked in a fixed screen corner instead of
  // roaming (see the render loop's early-return and the wrapper's own
  // position:fixed style). Needs both a ref (read inside the tick's
  // setInterval closure and openMenu, same reason every other behavior
  // flag in this file has a ref twin) and state (drives the wrapper's
  // JSX, which a ref alone can't do).
  const [isMobile, setIsMobile] = useState(false);
  const isMobileRef = useRef(false);
  // The "Sit" menu action -- holds him still in the sitting pose
  // (PixelDog's own `sitting` prop) until he's told to get up, another
  // action picks him back up (see handleMenuAction), or he has to break
  // it to dash back into view (see the out-of-view check). Session-only,
  // not persisted like followMode -- a fresh page load never starts him
  // already sat down.
  const [sitting, setSitting] = useState(false);
  const [heartKey, setHeartKey] = useState(0);
  const [showHearts, setShowHearts] = useState(false);
  // The thrown ball (components/ozhoBall.tsx): simulated in its own little
  // loop while it's out, drawn by writing straight to these nodes.
  const [ballShown, setBallShown] = useState(false);
  const ballSimRef = useRef<BallSim | null>(null);
  const ballElRef = useRef<HTMLDivElement | null>(null);
  const ballBodyElRef = useRef<HTMLDivElement | null>(null);
  const ballShadowElRef = useRef<HTMLDivElement | null>(null);
  const ballTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ballTurnRef = useRef({ turn: 0, spin: 0, at: 0 });
  // True for the whole return leg of a fetch (see the walk-complete branch
  // below) -- draws the ball held at his mouth on PixelDog instead of
  // sitting out on the page, since he's carrying it, not chasing it.
  const [carryingBall, setCarryingBall] = useState(false);

  const router = useRouter();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 80, y: 400 });
  const targetRef = useRef({ x: 80, y: 400 });
  const velRef = useRef({ x: 0, y: 0 });
  const idleActRef = useRef<IdleAct>("none");
  const idleEndRef = useRef(0);
  const nextIdleAtRef = useRef(0);
  const meanderRef = useRef({ amp: 0, phase: 0 });
  const strideRef = useRef(0);
  const pathSpeedRef = useRef(1);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const mouseAnchorRef = useRef<{ x: number; y: number } | null>(null);
  const nextMouseCheckRef = useRef(0);
  const noticeCooldownRef = useRef(0);
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
  const behaviorUntilRef = useRef(0);
  const speakAtRef = useRef(0);
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
  // Progression data for the mastery/weak-domain/test-countdown chatter
  // (see masteryLines/weakDomainLines/testCountdownLines above) -- fetched
  // once alongside stage/streak/costume in the mount effect below and
  // never refreshed afterward, same staleness tradeoff those already make
  // (a long session's chatter can lag slightly behind a just-finished
  // quiz; a reload picks up the real numbers). null/0 defaults mean "no
  // data yet" or "nothing set", which pickMessage()'s own guards treat as
  // "don't use this pool" rather than as a real zero/none to announce.
  const subskillsMasteredRef = useRef(0);
  const totalSubskillsRef = useRef(0);
  const daysUntilTestRef = useRef<number | null>(null);
  const weakestDomainRef = useRef<string | null>(null);
  const hasGreetedRef = useRef(false);
  const hasMountedPathRef = useRef(false);
  const navSpeakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteractionAtRef = useRef(Date.now());
  const asleepRef = useRef(false);
  const sleepAnimRef = useRef<"none" | "falling" | "waking">("none");
  const sleepAnimTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const perkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pettingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Menu / actions. menuOpenRef and followModeRef mirror their state into
  // the render loop (which reads refs, not state); fetchingRef sequences
  // fetch's three legs -- "flying" (the thrown ball is still in the air/
  // bouncing, he hasn't moved yet), "chasing" (dashing out to where it
  // landed), "back" (trotting home with it) -- inside that same loop's
  // walk-complete branch and the idle-wander branch (which "flying" needs
  // to suppress -- see there).
  const menuOpenRef = useRef(false);
  const followModeRef = useRef(false);
  const sittingRef = useRef(false);
  const fetchingRef = useRef<"flying" | "chasing" | "back" | null>(null);
  const fetchHomeRef = useRef<{ x: number; y: number } | null>(null);
  // Where the ball is landing -- set the moment it's thrown, acted on
  // (via beginWalk) only once handleBallLanded fires, so he's not walking
  // toward it while it's still mid-flight.
  const fetchLandingRef = useRef<{ x: number; y: number } | null>(null);
  const heartsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    speakAtRef.current =
      Date.now() + AMBIENT_SPEAK_MIN_MS + Math.random() * (AMBIENT_SPEAK_MAX_MS - AMBIENT_SPEAK_MIN_MS);
    behaviorUntilRef.current = Date.now() + 900 + Math.random() * 900;
    lastInteractionAtRef.current = Date.now();
    setReady(true);

    // "Come here / stay close" is a deliberate choice a student made about
    // how they want Ozho to behave, so it should survive a reload the same
    // way the equipped costume does.
    try {
      const savedFollow = window.localStorage.getItem(FOLLOW_STORAGE_KEY) === "1";
      followModeRef.current = savedFollow;
      setFollowMode(savedFollow);
    } catch {
      // storage disabled -- just default to free-roam
    }

    dedupedFetchJson<{
      stage: PetStage;
      currentStreak?: number;
      costume?: string | null;
      subskillsMastered?: number;
      totalSubskills?: number;
      daysUntilTest?: number | null;
      weakestDomain?: string | null;
      fedToday?: boolean;
    }>("/api/pet/state")
      .then((data) => {
        if (data && data.stage) {
          stageRef.current = data.stage;
          streakRef.current = data.currentStreak ?? 0;
          setStreak(data.currentStreak ?? 0);
          setFedToday(!!data.fedToday);
          setStage(data.stage);
          setCostume(data.costume && data.costume !== "none" ? data.costume : null);
          subskillsMasteredRef.current = data.subskillsMastered ?? 0;
          totalSubskillsRef.current = data.totalSubskills ?? 0;
          daysUntilTestRef.current = data.daysUntilTest ?? null;
          weakestDomainRef.current = data.weakestDomain ?? null;
        }
      })
      .catch(() => {});

    function checkMobile() {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      isMobileRef.current = mobile;
      setIsMobile(mobile);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);

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

    // Picking an answer (a quiz choice or a worked example's): he turns to
    // look, and now and then his ears perk -- he's paying attention.
    function onGlance(e: PointerEvent) {
      const choice = (e.target as Element | null)?.closest?.('[role="radio"]');
      if (!choice || walkingRef.current || menuOpenRef.current || asleepRef.current || isMobileRef.current) return;
      const r = choice.getBoundingClientRect();
      const f: 1 | -1 = r.left + r.width / 2 + window.scrollX >= posRef.current.x ? 1 : -1;
      facingRef.current = f;
      setFacing(f);
      if (Math.random() < 0.35) {
        if (perkTimeoutRef.current) clearTimeout(perkTimeoutRef.current);
        setPerk(true);
        perkTimeoutRef.current = setTimeout(() => setPerk(false), 260);
      }
    }
    window.addEventListener("pointerdown", onGlance);
    window.addEventListener("keydown", onInteract);
    window.addEventListener("click", onInteract);

    // Dopamine hook: any page can fire this to have Ozho do a little
    // hop-and-spin trick and say something excited -- mastering a
    // subskill, a streak milestone, unlocking a wardrobe costume. Kept as
    // a window event rather than a prop/context because ScoutCompanion is
    // mounted once at the root layout, far from whatever page triggers it.
    // Either event can pass `near` (a page-coordinate point) to have him
    // trot over to whatever just happened -- the quiz results card, say --
    // instead of reacting from wherever he happened to be wandering. Skipped
    // while he's docked (mobile), told to sit, or trotting after the
    // cursor, since each of those is a place the reader put him.
    function comeTo(near?: { x: number; y: number }) {
      if (!near || isMobileRef.current || sittingRef.current || followModeRef.current || menuOpenRef.current) return;
      enterFromEdge(near);
      // Flagged as a return so the out-of-view check doesn't swap this
      // destination for a random on-screen one while he's on his way.
      returningRef.current = true;
      beginWalk({ urgent: true, forceTarget: near });
    }
    function onCelebrate(e: Event) {
      lastInteractionAtRef.current = Date.now();
      holdIdle();
      beginWakeUp();
      const detail = (e as CustomEvent<{ message?: string; near?: { x: number; y: number } }>).detail;
      comeTo(detail?.near);
      speak(detail?.message || pick(CELEBRATION_PHRASES), 3200);
      if (trickTimeoutRef.current) clearTimeout(trickTimeoutRef.current);
      setTrick(true);
      trickTimeoutRef.current = setTimeout(() => setTrick(false), 760);
    }
    window.addEventListener("ozho:celebrate", onCelebrate);

    // A quieter sibling of ozho:celebrate: a line in his voice, no trick
    // and no confetti -- for moments worth a reaction that aren't wins
    // (a so-so quiz score, a nudge to review).
    function onSay(e: Event) {
      const detail = (e as CustomEvent<{ message: string; near?: { x: number; y: number } }>).detail;
      if (!detail?.message) return;
      lastInteractionAtRef.current = Date.now();
      beginWakeUp();
      comeTo(detail.near);
      speak(detail.message, 4200);
    }
    window.addEventListener("ozho:say", onSay);

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
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("pointerdown", onGlance);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("click", onInteract);
      window.removeEventListener("ozho:celebrate", onCelebrate);
      window.removeEventListener("ozho:say", onSay);
      window.removeEventListener("ozho:costume", onCostumeChange);
      if (trickTimeoutRef.current) clearTimeout(trickTimeoutRef.current);
      if (perkTimeoutRef.current) clearTimeout(perkTimeoutRef.current);
      if (pettingTimeoutRef.current) clearTimeout(pettingTimeoutRef.current);
      if (heartsTimeoutRef.current) clearTimeout(heartsTimeoutRef.current);
      if (ballTimerRef.current) clearInterval(ballTimerRef.current);
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
    companionBus.textRects = rects;
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
    // A route change is its own interaction -- whatever the menu was for,
    // it's stale on the new page.
    closeMenu();

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
    // Three more real-progress tiers, same "only fire when the data behind
    // it actually means something" discipline as the streak check above --
    // see the refs' own doc comment and masteryLines/testCountdownLines/
    // weakDomainLines for what each guard is protecting against. Ascending
    // roll thresholds, same pattern the rest of this function already
    // uses: whichever bucket the single roll lands in wins, falling
    // through to the next check only when that bucket's own data isn't
    // actually there.
    if (roll < 0.34 && daysUntilTestRef.current !== null && daysUntilTestRef.current >= 0) {
      const lines = testCountdownLines(daysUntilTestRef.current);
      if (lines.length) return pick(lines);
    }
    if (roll < 0.44 && subskillsMasteredRef.current > 0) {
      return pick(masteryLines(subskillsMasteredRef.current, totalSubskillsRef.current));
    }
    if (roll < 0.52 && weakestDomainRef.current) {
      return pick(weakDomainLines(weakestDomainRef.current));
    }
    // Whatever page he's actually standing on gets first crack at a line --
    // see PAGE_LINES above. Falls through to the general pools on pages
    // with no dedicated lines (e.g. /welcome) or when the roll misses.
    const kind = pageKindFor(pathname);
    if (kind && roll < 0.7) return pick(PAGE_LINES[kind]);
    if (roll < 0.88) return pick(TIPS);
    return pick(ENCOURAGEMENTS);
  }

  // Say hello shortly after Ozho's mood is known (once, ever).
  useEffect(() => {
    if (stage === null || hasGreetedRef.current) return;
    hasGreetedRef.current = true;
    const h = new Date().getHours();
    const pool = h >= 23 || h < 4 ? LATE_GREETINGS : h >= 5 && h < 10 && Math.random() < 0.6 ? MORNING_GREETINGS : GREETINGS;
    const t = setTimeout(() => speak(pick(pool), 4000), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // A pause between walks is usually a real rest, not a quick beat --
  // he's a companion sitting nearby, not a wind-up toy that's always
  // mid-stride. Longer, more varied pauses read as more natural (and
  // simply as less busy) than frequent short hops.
  function pickPauseMs(): number {
    const r = Math.random();
    // A near-death Ozho lingers between walks -- longer rests, fewer
    // brief hops -- so he reads as low on energy rather than restless.
    if (stageRef.current === "critical") {
      if (r < 0.55) return 9000 + Math.random() * 9000;
      return 4000 + Math.random() * 4000;
    }
    // Hungry: still gets up and about, just with more and longer rests.
    if (stageRef.current === "hungry") {
      if (r < 0.2) return 8000 + Math.random() * 8000;
      if (r < 0.55) return 3500 + Math.random() * 3500;
      return 1500 + Math.random() * 2000;
    }
    // Well fed: mostly short beats, the occasional proper lie-down. The
    // idle bits (sniffs, bows, hops, head tilts) fill the longer ones, so
    // even standing still he isn't static.
    if (r < 0.08) return 7000 + Math.random() * 5000; // a real rest
    if (r < 0.3) return 3500 + Math.random() * 2500; // a longer beat
    if (r < 0.7) return 1500 + Math.random() * 2000; // a normal beat
    return 500 + Math.random() * 900; // barely stopping
  }

  // How he gets there. Healthy dogs mix all three gaits; a hungry or
  // struggling one doesn't gallop.
  function pickGait(): Gait {
    const r = Math.random();
    const energetic = stageRef.current === "thriving" || stageRef.current === "content" || stageRef.current === null;
    if (!energetic) return r < 0.45 ? "stroll" : "trot";
    if (r < 0.25) return "stroll";
    if (r < 0.72) return "trot";
    return "gallop";
  }

  function gaitSpeed(g: Gait): number {
    if (g === "stroll") return 0.6 + Math.random() * 0.25;
    if (g === "trot") return 1.0 + Math.random() * 0.35;
    return 1.75 + Math.random() * 0.5;
  }

  function gaitForSpeed(mult: number): Gait {
    return mult < 0.95 ? "stroll" : mult < 1.6 ? "trot" : "gallop";
  }

  // Resolves what beginWalk would send him to next, WITHOUT actually
  // starting the walk -- the same validity/clamping rules (page margins,
  // clear of text), just stopping short of touching any walk-state refs.
  // throwBall uses this to know exactly where a thrown ball will land
  // (and thus where he'll need to run once it does) while he's still
  // standing still watching it fly -- calling beginWalk itself with the
  // same forceTarget once it lands re-resolves to this same point, since
  // neither his position nor the page has changed in the meantime.
  //   - `avoid`: bias a randomly-picked target to the opposite side of
  //     this point (used by the "standing on text" reflex).
  //   - `forceTarget`: use this point outright instead of picking a
  //     random wander target.
  // Whatever target comes out gets resampled (or re-picked, for a forced
  // one) up to a few times if it lands on top of a text box, so he never
  // deliberately settles on text -- only ever right up next to it.
  function resolveTarget(opts: { avoid?: { x: number; y: number } | null; forceTarget?: { x: number; y: number } } = {}) {
    const { avoid, forceTarget } = opts;
    const start = { x: posRef.current.x, y: posRef.current.y };
    // Floored at the margin itself so a transient small clientWidth/
    // content-height reading (e.g. mid-layout) can never push max below
    // min. See pageContentBottom() for why that's used for the Y bound
    // instead of document.documentElement.scrollHeight.
    const maxX = Math.max(SIDE_MARGIN, document.documentElement.clientWidth - SIDE_MARGIN);
    const maxY = Math.max(TOP_MARGIN, pageContentBottom() - BOTTOM_MARGIN);

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

    // Landing spot is fully validated up front -- just text -- rather than
    // walking somewhere and only finding out it doesn't work after
    // arriving. That "arrive, immediately discover it's bad, walk again"
    // pattern is exactly what reads as erratic; picking a target that's
    // already known-good avoids it instead of reacting to it after the
    // fact. The cursor is deliberately not a factor here any more -- he's
    // free to wander right up next to it (see the "Cursor behavior" note
    // above).
    function isValidLanding(x: number, y: number): boolean {
      if (overlapsText(x, y)) return false;
      if (overlapsHeadingBubbleZone(x, y)) return false;
      return true;
    }

    // If a forced target itself isn't valid, search progressively further
    // out *around that same point* rather than substituting something
    // unrelated -- a forced target is always deliberate (a thrown ball's
    // landing spot, a "come here" spot near the reader, dashing back into
    // view), so a fallback needs to stay close to what was actually
    // asked for. This used to call pickReturnTarget() here instead, which
    // has nothing to do with the point that failed -- fine back when
    // forceTarget only ever meant "get back into view" or "come sit near
    // the reader" (any reasonable on-screen spot really does satisfy
    // those), but wrong once it also started meaning "land exactly where
    // this thrown ball is going": falling back to an unrelated,
    // viewport-relative point could send the ball (and him, chasing it)
    // off in a direction with no relationship to the actual throw.
    function nearbyForceTargetCandidate(tries: number) {
      const jitterAngle = Math.random() * Math.PI * 2;
      const jitterRadius = 30 + tries * 25;
      return {
        x: clamp(forceTarget!.x + Math.cos(jitterAngle) * jitterRadius, SIDE_MARGIN, maxX),
        y: clamp(forceTarget!.y + Math.sin(jitterAngle) * jitterRadius, TOP_MARGIN, maxY),
      };
    }

    let end = forceTarget
      ? { x: clamp(forceTarget.x, SIDE_MARGIN, maxX), y: clamp(forceTarget.y, TOP_MARGIN, maxY) }
      : randomCandidate();
    for (let tries = 0; !isValidLanding(end.x, end.y) && tries < 12; tries++) {
      end = forceTarget ? nearbyForceTargetCandidate(tries) : randomCandidate();
    }
    // Final safety clamp -- a no-op for every candidate above (both
    // candidate functions already clamp their own output), but cheap
    // insurance against a degenerate 0-size viewport reading (see the
    // render loop's own guard for the same case) ever producing something
    // out of bounds.
    end = { x: clamp(end.x, SIDE_MARGIN, maxX), y: clamp(end.y, TOP_MARGIN, maxY) };

    return { start, end, maxX, maxY };
  }

  // Left a whole screen or more behind (the reader scrolled a long way):
  // rather than a multi-second sprint across the page, he pops in at the
  // nearest edge of the screen, already running toward `target`.
  function enterFromEdge(target: { x: number; y: number }) {
    const sy = window.scrollY;
    const vh = window.innerHeight;
    const pos = posRef.current;
    const farAbove = pos.y < sy - vh * 0.5;
    const farBelow = pos.y > sy + vh * 1.5;
    if (!farAbove && !farBelow) return;
    pos.y = farAbove ? sy - 20 : sy + vh + 20;
    pos.x = clamp(
      target.x + (Math.random() - 0.5) * 160,
      SIDE_MARGIN,
      Math.max(SIDE_MARGIN, document.documentElement.clientWidth - SIDE_MARGIN)
    );
    velRef.current = { x: 0, y: farAbove ? 220 : -220 };
    walkingRef.current = true;
  }

  // Right after you've interacted with him (a trick, a pet, closing his
  // panel) he stays up and attentive for a bit instead of immediately
  // sitting down for a rest or wandering off to sniff something.
  function holdIdle(ms = 3000) {
    setIdle("none");
    nextIdleAtRef.current = Date.now() + ms + Math.random() * 1500;
  }

  function setIdle(a: IdleAct) {
    if (idleActRef.current === a) return;
    idleActRef.current = a;
    setIdleAct(a);
  }

  // A timed idle bit (sniff, bow, tilt, hop, spin): plays for its length,
  // and the rest he's in stretches to fit it if it has to.
  function startAct(a: IdleAct) {
    const ms = IDLE_ACT_MS[a] ?? 1000;
    const now = Date.now();
    setIdle(a);
    idleEndRef.current = now + ms;
    behaviorUntilRef.current = Math.max(behaviorUntilRef.current, now + ms + 150);
  }

  // Well fed and not asked to keep motion down: the full repertoire.
  function isLively(): boolean {
    const st = stageRef.current;
    return st === "thriving" || st === "content" || st === null;
  }

  // Picks what he does with a spare moment between walks. `left` is how
  // long the current rest still has to run.
  function pickIdleAct(left: number) {
    if (left > 5000 && Math.random() < 0.3) {
      setIdle("rest");
      return;
    }
    const lively = isLively();
    const options: [IdleAct | "glance", number][] = [
      ["sniff", 3],
      ["tilt", 2.2],
      ["glance", 2],
      ["bow", lively ? 1.4 : 0],
      ["hop", lively ? 1.2 : 0],
      ["spin", lively && stageRef.current !== "content" ? 0.8 : 0],
    ];
    const total = options.reduce((t, [, w]) => t + w, 0);
    let r = Math.random() * total;
    let choice: IdleAct | "glance" = "glance";
    for (const [a, w] of options) {
      if ((r -= w) <= 0) {
        choice = a;
        break;
      }
    }
    if (choice === "glance" || left < (IDLE_ACT_MS[choice] ?? 0) + 200) {
      facingRef.current = facingRef.current === 1 ? -1 : 1;
      setFacing(facingRef.current);
      return;
    }
    if (choice === "bow") afterBowRef.current = Math.random() < 0.5 ? "dash" : null;
    if (choice === "spin") spinFlipAtRef.current = 0;
    startAct(choice);
  }

  // Zoomies: a burst of three to five short, fast gallops in random
  // directions with barely a pause between them (the arrival handler in
  // the render loop chains them), ending in a flop or a head tilt.
  function startZoomies() {
    zoomiesAtRef.current = Date.now() + ZOOMIES_MIN_MS + Math.random() * (ZOOMIES_MAX_MS - ZOOMIES_MIN_MS);
    zoomingRef.current = true;
    zoomLegsRef.current = 3 + Math.floor(Math.random() * 3);
    if (Math.random() < 0.4) speak(pick(ZOOMIES_PHRASES), 1800);
    startZoomLeg();
  }

  function startZoomLeg() {
    zoomLegsRef.current -= 1;
    const p = posRef.current;
    const angle = Math.random() * Math.PI * 2;
    const radius = 110 + Math.random() * 130;
    beginWalk({
      speedMult: 2.2 + Math.random() * 0.5,
      forceTarget: { x: p.x + Math.cos(angle) * radius, y: p.y + Math.sin(angle) * radius * 0.7 },
    });
  }

  // Back to a neutral stance: no bob, no lean.
  function resetBody() {
    prevSpeedRef.current = 0;
    leanRef.current = 0;
    if (bodyRef.current && bodyRef.current.style.transform) bodyRef.current.style.transform = "";
  }

  function cancelZoomies() {
    zoomingRef.current = false;
    zoomLegsRef.current = 0;
  }

  // Sets off toward a new spot (see resolveTarget for how it's picked and
  // kept off text); the render loop steers him there.
  //   - `urgent`: faster and more direct -- purposeful, not a stroll.
  //   - `speedMult`: overrides urgent's own default speed entirely -- used
  //     by follow mode, which needs to move even more decisively than a
  //     one-off "dash back into view" (see FOLLOW_SPEED_MULT).
  //   - `straight`: no meander at all -- follow mode beelines to the
  //     cursor and actually stops there.
  // The way there is free to cross text (see the render loop) --
  // resolveTarget only keeps the landing spot itself off of it.
  function beginWalk(opts: { avoid?: { x: number; y: number } | null; urgent?: boolean; speedMult?: number; straight?: boolean; forceTarget?: { x: number; y: number }; gait?: Gait } = {}) {
    const { urgent = false, speedMult, straight = false } = opts;
    if (urgent) cancelZoomies();
    const { end } = resolveTarget(opts);
    const wasWalking = walkingRef.current;
    setIdle("none");

    targetRef.current = end;
    peakSpeedRef.current = 0;
    const gait = opts.gait ?? (speedMult !== undefined || urgent ? null : pickGait());
    pathSpeedRef.current =
      speedMult !== undefined ? speedMult : urgent ? RETURN_SPEED_MULT + Math.random() * 0.3 : gaitSpeed(gait ?? "trot");
    gaitRef.current = gait ?? gaitForSpeed(pathSpeedRef.current);
    // Strolls wander; trots less so; gallops and dashes go more or less
    // straight at it.
    const meanderScale = straight ? 0 : urgent || gaitRef.current === "gallop" ? 0.25 : gaitRef.current === "trot" ? 0.7 : 1;
    meanderRef.current = {
      amp: meanderScale * MEANDER_RAD * (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.5),
      phase: Math.random() * Math.PI * 2,
    };
    // Bursting into a sprint from a standstill gets a little launch hop.
    if (!wasWalking && (urgent || gaitRef.current === "gallop")) {
      if (perkTimeoutRef.current) clearTimeout(perkTimeoutRef.current);
      setPerk(true);
      perkTimeoutRef.current = setTimeout(() => setPerk(false), 260);
    }
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

      // Below MOBILE_BREAKPOINT he's docked to a fixed screen corner (see
      // the wrapper's own position:fixed style below) instead of running
      // any of the rest of this loop -- ambient wandering, the
      // out-of-view dash, and the text-overlap escape all used to walk
      // him right over lesson prose, answer choices, or score badges,
      // which a phone screen has no spare margin for him to route around.
      // Tapping him to open the action menu still works either way, since
      // that's a plain onClick on the button below, untouched by this
      // loop. Desktop (>= MOBILE_BREAKPOINT) never hits this and behaves
      // exactly as before.
      if (isMobileRef.current) return;

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
      } else if (
        idleMs > IDLE_SLEEP_MS &&
        !walkingRef.current &&
        !menuOpenRef.current &&
        !fetchingRef.current &&
        stageRef.current !== "dead"
      ) {
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
      // than only in specific states. Skipped entirely once he's in real
      // trouble -- critical (about to die) or dead -- where PixelDog draws
      // the tail down/limp and ignores tailFrame anyway, so this is also
      // just not wasting the tick. Same for sitting: that pose draws its
      // own fixed curled tail and ignores tailFrame too. A merely-hungry
      // Ozho still wags, only noticeably slower, so the drop in energy
      // reads as a gradient rather than a switch.
      if (stageRef.current !== "dead" && stageRef.current !== "critical" && !sittingRef.current) {
        tailTimerRef.current += dt;
        const swapMs = stageRef.current === "hungry" ? TAIL_SWAP_MS * 2.4 : TAIL_SWAP_MS;
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

      // The action menu is open: he holds dead still under it (a drifting
      // target would slide out from under the buttons) but keeps wagging,
      // which the block above already handled. Nothing else this tick.
      if (menuOpenRef.current) {
        resetBody();
        if (wrapperRef.current) {
          wrapperRef.current.style.left = `${posRef.current.x}px`;
          wrapperRef.current.style.top = `${posRef.current.y}px`;
        }
        if (!isMobileRef.current) companionBus.ozho = { ...posRef.current, at: Date.now(), resting: false };
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

      // Highest priority (ordinarily): scrolling him out of the visible
      // viewport means he'd otherwise just sit there off-screen, which
      // undercuts the whole point of anchoring him to the page. Dash back
      // in -- once, not re-triggered every tick while already on the way.
      //
      // Suppressed for the whole of a fetch (fetchingRef truthy), though --
      // this used to fire regardless of what he was doing, which was a
      // real bug: a ball thrown far enough (or a page tall enough) to land
      // outside the current scroll position would have him walking toward
      // it, cross the "off-screen" threshold mid-chase, and get yanked
      // onto a completely unrelated `pickReturnTarget()` instead -- a
      // fresh forced walk overwriting the one already in progress, with no
      // relationship to where the ball actually was. Worse, since that
      // hijacked walk still ends with fetchingRef reading "chasing", *its*
      // arrival was read as reaching the ball -- picking it up (removing
      // it from the page) and setting off for home from wherever this
      // unrelated spot happened to be. That's the "runs off in a random
      // direction and the ball just disappears" bug: not a pathing error
      // so much as a second, unrelated walk silently replacing the real
      // one out from under it. Skipping this entirely during a fetch (he
      // can't be "lost" off-screen mid-game the way ordinary wandering
      // can -- the chase/return legs always resolve to a specific,
      // deliberately-picked point, and the whole game is over in a few
      // seconds either way) also protects "flying" -- he isn't walking
      // yet at that point, but without this guard he still could be, the
      // instant this fired.
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const outOfView =
        pos.x < scrollX - OUT_OF_VIEW_MARGIN ||
        pos.x > scrollX + vw + OUT_OF_VIEW_MARGIN ||
        pos.y < scrollY - OUT_OF_VIEW_MARGIN ||
        pos.y > scrollY + vh + OUT_OF_VIEW_MARGIN;

      if (outOfView && !returningRef.current && !fetchingRef.current) {
        // Breaks a "Sit" rather than honoring it here -- staying seated
        // is a real command, but not one worth becoming permanently
        // stranded and unclickable off-screen for.
        if (sittingRef.current) {
          sittingRef.current = false;
          setSitting(false);
        }
        returningRef.current = true;
        const back = pickReturnTarget();
        enterFromEdge(back);
        beginWalk({ urgent: true, forceTarget: back });
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
      // Excludes "flying" for the same reason as the out-of-view dash
      // above: he isn't walking yet (walkingRef.current is already false
      // then, same as ordinary idle), but he does need to actually hold
      // still watching the thrown ball rather than wandering off because
      // he happened to be standing on a word when he threw it. Excludes
      // sitting for the same reason "Sit" excludes it from the idle-wander
      // branch below -- staying seated on command shouldn't itself get
      // interrupted by standing on text.
      if (
        hit &&
        !walkingRef.current &&
        fetchingRef.current !== "flying" &&
        !sittingRef.current &&
        nowMs > textEscapeUntilRef.current
      ) {
        textEscapeUntilRef.current = nowMs + TEXT_ESCAPE_COOLDOWN_MS;
        beginWalk({ avoid: { x: (hit.left + hit.right) / 2, y: (hit.top + hit.bottom) / 2 } });
      }

      // "Noticing" the cursor -- see the Cursor behavior note up top. Only
      // while he's genuinely at rest (not walking through, not mid-dash
      // back into view, not under the click menu, which already has its
      // own bigger reaction) does the cursor resting near him actually
      // mean anything; a passing cursor on the way somewhere else doesn't
      // count as a visit.
      if (
        !walkingRef.current &&
        !returningRef.current &&
        !menuOpenRef.current &&
        mouseRef.current &&
        nowMs > noticeCooldownRef.current
      ) {
        const d = Math.hypot(pos.x - mouseRef.current.x, pos.y - mouseRef.current.y);
        if (d < NOTICE_DIST) {
          noticeCooldownRef.current = nowMs + NOTICE_COOLDOWN_MS;
          facingRef.current = mouseRef.current.x >= pos.x ? 1 : -1;
          setFacing(facingRef.current);
          if (isLively() && idleActRef.current === "none" && Math.random() < 0.35) {
            // Play! Front end down, rear up, then a pounce at the cursor.
            afterBowRef.current = "pounce";
            startAct("bow");
          } else if (Math.random() < 0.5) {
            // speak() already gives him the same little happy hop -- no
            // need to trigger it a second time here.
            speak(pick(NOTICE_PHRASES), 2200);
          } else {
            if (perkTimeoutRef.current) clearTimeout(perkTimeoutRef.current);
            setPerk(true);
            perkTimeoutRef.current = setTimeout(() => setPerk(false), 260);
          }
        }
      }

      // Anything that stops him without arriving (opening the panel,
      // sitting) leaves no momentum behind for the next walk.
      if (!walkingRef.current && (velRef.current.x || velRef.current.y)) velRef.current = { x: 0, y: 0 };

      if (walkingRef.current) {
        const speed =
          RUN_SPEED *
          pathSpeedRef.current *
          (onText ? BEHIND_TEXT_SPEED_MULT : 1) *
          // A near-death Ozho trudges rather than trots -- part of the
          // same "he is not okay" read as the tucked tail, stopped wag,
          // and shiver. Not applied to the urgent dash back into view
          // (returningRef), which should still look purposeful.
          (stageRef.current === "critical" && !returningRef.current ? 0.5 : 1);
        const sec = dt / 1000;
        const v = velRef.current;
        const tgt = targetRef.current;
        const tdx = tgt.x - pos.x;
        const tdy = tgt.y - pos.y;
        const tdist = Math.hypot(tdx, tdy);
        const curSpeed = Math.hypot(v.x, v.y);

        // Arrived: this frame's step would reach (or pass) the spot.
        if (tdist < 1.5 || Math.max(curSpeed, MIN_ARRIVE_SPEED) * sec >= tdist) {
          pos.x = targetRef.current.x;
          pos.y = targetRef.current.y;
          velRef.current = { x: 0, y: 0 };
          walkingRef.current = false;
          setIsWalking(false);
          returningRef.current = false;
          resetBody();
          if (peakSpeedRef.current > LAND_SPEED && zoomLegsRef.current === 0) {
            if (landTimeoutRef.current) clearTimeout(landTimeoutRef.current);
            setLand(true);
            landTimeoutRef.current = setTimeout(() => setLand(false), 260);
          }
          // Follow mode gets its own short recheck gap instead of the long
          // ambient rest below -- otherwise every leg of the chase would
          // end with him just standing there for several seconds even
          // though the cursor kept moving the whole time.
          behaviorUntilRef.current = nowMs + (followModeRef.current ? FOLLOW_RECHECK_MS : pickPauseMs());
          if (zoomingRef.current) {
            if (zoomLegsRef.current > 0) {
              // Mid-zoomies: barely a beat before the next burst.
              behaviorUntilRef.current = nowMs + 60 + Math.random() * 140;
            } else {
              // Done: flop down for a breather, or stand there panting
              // with a head tilt like nothing happened.
              zoomingRef.current = false;
              behaviorUntilRef.current = nowMs + 4000 + Math.random() * 3000;
              if (Math.random() < 0.6) setIdle("rest");
              else startAct("tilt");
            }
          }

          // Fetch: he's just reached the ball -> pick it up (see
          // carryingBall) and trot back to where he was standing when it
          // was thrown. Second arrival (the "back" leg) just ends the
          // game. (The first leg, waiting for the throw itself to land,
          // is handled by handleBallLanded, not here -- he isn't walking
          // yet at that point.)
          if (fetchingRef.current === "chasing") {
            fetchingRef.current = "back";
            stopBall();
            setCarryingBall(true);
            speak(pick(FETCH_RETURN_PHRASES), 2600);
            const home = fetchHomeRef.current ?? pickReturnTarget();
            beginWalk({ urgent: true, forceTarget: home });
          } else if (fetchingRef.current === "back") {
            fetchingRef.current = null;
            setCarryingBall(false);
          }
        } else {
          // Arrive: full speed until ARRIVE_RADIUS, then ease off.
          // The easing zone grows with top speed, so a sprint brakes early
          // enough to stop on the spot instead of overshooting and circling.
          const arriveR = Math.max(ARRIVE_RADIUS, ((speed * speed) / (2 * ACCEL)) * 1.3);
          const want = Math.max(MIN_ARRIVE_SPEED, speed * Math.min(1, tdist / arriveR));
          const m = meanderRef.current;
          m.phase += sec * MEANDER_HZ * Math.PI * 2;
          const heading = Math.atan2(tdy, tdx) + m.amp * Math.sin(m.phase) * Math.min(1, tdist / 160);
          const ax = Math.cos(heading) * want - v.x;
          const ay = Math.sin(heading) * want - v.y;
          const amag = Math.hypot(ax, ay);
          // Speeding up and turning are limited; slowing down is allowed
          // to be quicker, so he never overshoots his spot.
          const limit = (want < curSpeed ? ACCEL * 1.8 : ACCEL) * sec;
          const k = amag > limit ? limit / amag : 1;
          v.x += ax * k;
          v.y += ay * k;
          pos.x = clamp(
            pos.x + v.x * sec,
            SIDE_MARGIN,
            Math.max(SIDE_MARGIN, document.documentElement.clientWidth - SIDE_MARGIN)
          );
          pos.y = clamp(pos.y + v.y * sec, TOP_MARGIN, Math.max(TOP_MARGIN, pageContentBottom() - BOTTOM_MARGIN));
          if (Math.abs(v.x) > 12) {
            const f: 1 | -1 = v.x > 0 ? 1 : -1;
            if (f !== facingRef.current) {
              facingRef.current = f;
              setFacing(f);
            }
          }
        }

        // Legs swap per distance covered, so feet never skate.
        const moved = Math.hypot(velRef.current.x, velRef.current.y);
        strideRef.current += moved * sec;
        if (strideRef.current > strideFor(moved)) {
          strideRef.current = 0;
          setLegFrame((f) => (f === 0 ? 1 : 0));
        }
        // The body rises once per leg swap (a full bounding arc at a
        // gallop), rocks nose-to-tail with the stride, and leans into
        // speeding up or braking -- so each gait has its own rhythm and
        // starts and stops have weight.
        if (walkingRef.current && bodyRef.current) {
          const g = gaitRef.current;
          bobPhaseRef.current += ((moved * sec) / strideFor(Math.max(moved, 1))) * Math.PI;
          const amt = Math.min(1, moved / 60);
          const bob = GAIT_BOB[g] * Math.abs(Math.sin(bobPhaseRef.current)) * amt;
          const rock = GAIT_ROCK[g] * Math.cos(bobPhaseRef.current) * amt;
          peakSpeedRef.current = Math.max(peakSpeedRef.current, moved);
          const accel = (moved - prevSpeedRef.current) / Math.max(sec, 0.001);
          prevSpeedRef.current = moved;
          const leanTarget = clamp((accel / ACCEL) * MAX_LEAN_DEG, -MAX_LEAN_DEG, MAX_LEAN_DEG);
          leanRef.current += (leanTarget - leanRef.current) * Math.min(1, sec * 10);
          bodyRef.current.style.transform = `translateY(${(-bob).toFixed(2)}px) rotate(${((leanRef.current + rock) * facingRef.current).toFixed(2)}deg)`;
        }
      } else if (fetchingRef.current === "flying") {
        // The thrown ball is still in the air/bouncing -- he watches from
        // right where he threw it from rather than wandering off, so
        // "doesn't move until it lands" actually holds. handleBallLanded
        // (called by the ball's sim once it's come to rest) is what sends
        // him after it.
      } else if (sittingRef.current) {
        // "Sit": stays put, full stop, until he's told to get up (or has
        // to break it to dash back into view -- see the out-of-view check
        // above, which clears sittingRef itself when that happens).
      } else if (followModeRef.current) {
        // "Come here" mode: chase the cursor closely and continuously,
        // rather than only reacting once he's drifted well outside a wide
        // comfort band -- that older version shared the ambient wander's
        // multi-second rest between legs, so most of the time he just sat
        // there like he does when following is off. Whether he needs to
        // move at all is judged against the cursor itself (followAnchor),
        // not the offset spot he'd walk to (followTarget) -- if the cursor
        // is already within FOLLOW_TOLERANCE of him he just stays put, even
        // short of that exact offset spot, instead of setting off toward it
        // and reading as fleeing a cursor that just got close. He only
        // actually walks once the cursor has drifted outside that radius,
        // and FOLLOW_RECHECK_MS (set on arrival below, not pickPauseMs's
        // long ambient rest) keeps the gap between legs short enough that
        // the chase reads as one continuous motion.
        if (nowMs > behaviorUntilRef.current) {
          const anchor = followAnchor();
          const d = Math.hypot(pos.x - anchor.x, pos.y - anchor.y);
          if (d > FOLLOW_TOLERANCE) {
            beginWalk({ forceTarget: followTarget(), urgent: true, speedMult: FOLLOW_SPEED_MULT, straight: true });
          } else {
            behaviorUntilRef.current = nowMs + FOLLOW_RECHECK_MS;
          }
        } else if (Math.random() < 0.01) {
          facingRef.current = facingRef.current === 1 ? -1 : 1;
          setFacing(facingRef.current);
        }
      } else {
        const act = idleActRef.current;
        const timed = IDLE_ACT_MS[act] !== undefined;
        if (nowMs > behaviorUntilRef.current) {
          if (act === "rest") {
            // Up from a proper rest: a stretch first, then off he goes.
            setIdle("stretch");
            behaviorUntilRef.current = nowMs + STRETCH_MS;
          } else if (zoomLegsRef.current > 0) {
            startZoomLeg();
          } else {
            beginWalk();
          }
        } else if (timed && nowMs > idleEndRef.current) {
          setIdle("none");
          const next = afterBowRef.current;
          afterBowRef.current = null;
          // A play bow is an invitation: sometimes he takes himself up on
          // it and bolts, or pounces at the cursor that caught his eye.
          if (act === "bow" && next === "dash") {
            beginWalk({ gait: "gallop" });
          } else if (act === "bow" && next === "pounce" && mouseRef.current) {
            const m = mouseRef.current;
            beginWalk({ urgent: true, straight: true, speedMult: 2.4, forceTarget: { x: m.x - facingRef.current * 28, y: m.y + 18 } });
          }
        } else if (act === "spin") {
          // Chasing his tail: whips around to face the other way, over
          // and over, while the CSS spin-wobble plays on top.
          if (nowMs > spinFlipAtRef.current) {
            spinFlipAtRef.current = nowMs + SPIN_FLIP_MS;
            facingRef.current = facingRef.current === 1 ? -1 : 1;
            setFacing(facingRef.current);
          }
        } else if (act === "none" && nowMs > zoomiesAtRef.current && isLively() && !onTextRef.current) {
          startZoomies();
        } else if (act === "none" && nowMs > nextIdleAtRef.current) {
          nextIdleAtRef.current = nowMs + 1300 + Math.random() * 2000;
          pickIdleAct(behaviorUntilRef.current - nowMs);
        } else if (act === "none" && Math.random() < 0.002) {
          // An idle glance side to side -- small, infrequent, alive.
          facingRef.current = facingRef.current === 1 ? -1 : 1;
          setFacing(facingRef.current);
        }
      }

      if (wrapperRef.current) {
        wrapperRef.current.style.left = `${pos.x}px`;
        wrapperRef.current.style.top = `${pos.y}px`;
      }
      // Mochi follows whatever this says -- see lib/companionBus.ts.
      if (!isMobileRef.current)
        companionBus.ozho = {
          x: pos.x,
          y: pos.y,
          at: Date.now(),
          resting: !walkingRef.current && (idleActRef.current === "rest" || sittingRef.current),
        };
    }, 16);
    return () => clearInterval(intervalId);
  }, []);

  // ---- Click menu plumbing ----------------------------------------------

  function openMenu() {
    cancelZoomies();
    afterBowRef.current = null;
    // A click now stops him wherever he is -- see onClickDog -- including
    // mid-fetch. Chasing or trotting a ball back are both real walks
    // (walkingRef.current), so the stop below already halts him; this is
    // just the fetch-specific cleanup that halting alone wouldn't do --
    // cancel the game outright rather than leaving a ball stranded on the
    // page, or him permanently "carrying" one he never actually finished
    // bringing home. (Interrupting the "flying" state -- the ball's own
    // animation, still in the air -- is left alone: he isn't walking yet
    // at that point, and the ball plays itself out independent of him.)
    if (fetchingRef.current === "chasing" || fetchingRef.current === "back") {
      fetchingRef.current = null;
      stopBall();
      setCarryingBall(false);
    }
    // Beside him on desktop (viewport coordinates -- the panel is fixed);
    // null on phones, where he's docked and the panel is a bottom sheet.
    setPanelAnchor(
      isMobileRef.current ? null : { x: posRef.current.x - window.scrollX, y: posRef.current.y - window.scrollY }
    );
    menuOpenRef.current = true;
    setMenuOpen(true);
    // Clear any lingering bubble so it doesn't sit on top of the panel, and
    // stop him where he is (the render loop freezes him while it's open).
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    setBubble(null);
    walkingRef.current = false;
    setIsWalking(false);
    // In case he was mid-dash back into view -- otherwise this would
    // stay stuck true, silently keeping the "return dash" speed/rest
    // exceptions active even after he's just standing here with a menu
    // open.
    returningRef.current = false;
  }

  function closeMenu() {
    if (!menuOpenRef.current) return;
    menuOpenRef.current = false;
    setMenuOpen(false);
    holdIdle();
    // Resume normal life with a fresh pause rather than bolting the instant
    // the menu closes -- except in follow mode, which shouldn't go quiet
    // for pickPauseMs's multi-second ambient rest just because the menu
    // happened to open and close (e.g. toggling Follow on in the first
    // place always does exactly that). Without this branch, follow mode's
    // own re-checking below stayed blocked by this long pause for however
    // long pickPauseMs picked, which is what made "obviously following"
    // actually read as "stands still for several seconds after every menu
    // interaction".
    behaviorUntilRef.current = Date.now() + (followModeRef.current ? FOLLOW_RECHECK_MS : pickPauseMs());
  }

  // Where "the cursor" actually is for follow purposes -- the real mouse
  // position once we've seen one, otherwise the viewport center so there's
  // still a sane point to walk toward before the first mousemove. Shared by
  // followTarget (the offset spot he actually walks to) and the tick loop's
  // own "am I already near enough to just stay put" check, so both agree on
  // what "the cursor" means.
  function followAnchor() {
    const vw = window.innerWidth;
    const sx = window.scrollX;
    const sy = window.scrollY;
    return mouseRef.current ?? { x: sx + vw * 0.5, y: sy + window.innerHeight * 0.5 };
  }

  // A spot to trot to for "come here" -- close beside the actual cursor
  // (not a wide viewport-relative band that could land him a third of a
  // screen away from it) so it's obvious he's tracking the mouse itself.
  // Offset to whichever side of the cursor has more room, so a mouse near
  // one edge doesn't repeatedly aim him off-page. Deliberately no random
  // jitter -- an earlier version added a little to keep repeated calls
  // from pathing to the exact same pixel, but paired with a tight
  // tolerance that jitter alone was enough to keep exceeding it, so he
  // never actually settled beside a stationary cursor: every recheck
  // computed a slightly different spot and set off another short walk,
  // reading as restless twitching instead of "stops". With a still mouse,
  // this now returns the exact same point every time. Only used once the
  // tick loop (or toggleFollow) has already decided he's outside
  // FOLLOW_TOLERANCE of followAnchor() and needs to actually walk --
  // see the note there on why arrival is judged against the cursor itself,
  // not this offset point.
  function followTarget() {
    const vw = window.innerWidth;
    const sx = window.scrollX;
    const anchor = followAnchor();
    const side = anchor.x - sx > vw / 2 ? -1 : 1;
    const x = clamp(anchor.x + side * FOLLOW_OFFSET_X, sx + SIDE_MARGIN, sx + vw - SIDE_MARGIN);
    return { x, y: anchor.y + FOLLOW_OFFSET_Y };
  }

  // Called once the thrown ball has come to rest (see throwBall) -- the
  // one place he actually starts moving toward it. Guarded on fetchingRef
  // still being "flying" so a stray extra call is a harmless no-op.
  function handleBallLanded() {
    if (fetchingRef.current !== "flying") return;
    fetchingRef.current = "chasing";
    const landing = fetchLandingRef.current;
    fetchLandingRef.current = null;
    if (landing) beginWalk({ urgent: true, forceTarget: landing });
  }

  // Positions the ball and its shadow from the sim. The ball's ground
  // contact sits level with his feet (BALL_FOOT below his center), so
  // when he trots to the resting spot, it's right at his paws.
  function drawBall() {
    const b = ballSimRef.current;
    const el = ballElRef.current;
    const body = ballBodyElRef.current;
    const shadow = ballShadowElRef.current;
    if (!b || !el || !body || !shadow) return;
    const g = ballGround(b);
    const footY = g.y + BALL_FOOT;
    el.style.opacity = "1";
    el.style.transform = `translate3d(${Math.round(g.x - BALL_SIZE / 2)}px, ${Math.round(footY - BALL_SIZE - b.h)}px, 0)`;
    // Squash on impact. The roll turns only the seam, in quarter turns so
    // the pixels stay crisp; its lighting and shadow never rotate.
    body.style.transform = `scale(${(1 + 0.3 * b.squash).toFixed(3)}, ${(1 - 0.3 * b.squash).toFixed(3)})`;
    // A real roll is many quarter turns per frame at speed, which strobes
    // (and can look like it's spinning backwards). One step per ~55ms at
    // most reads as a smooth, fast roll instead.
    const tr = ballTurnRef.current;
    const now = performance.now();
    if (b.spin - tr.spin >= 90 && now - tr.at > 55) {
      tr.turn = (tr.turn + 1) % 4;
      tr.spin = b.spin;
      tr.at = now;
    }
    setBallTurn(body, tr.turn * 90);
    const lift = Math.min(1, b.h / 120);
    shadow.style.opacity = (0.16 * (1 - 0.6 * lift)).toFixed(3);
    shadow.style.transform = `translate3d(${Math.round(g.x - (BALL_SIZE * 0.6))}px, ${Math.round(footY - 2)}px, 0) scale(${(1 - 0.45 * lift).toFixed(3)})`;
  }

  function stopBall() {
    if (ballTimerRef.current) clearInterval(ballTimerRef.current);
    ballTimerRef.current = null;
    ballSimRef.current = null;
    setBallShown(false);
  }

  // Fetch: the ball is thrown from where he stands to a spot that's free
  // to stand on (resolveTarget), really flies there -- arc, a couple of
  // bounces, a roll -- and only once it's still does he go after it. He
  // watches it the whole way.
  function throwBall() {
    const origin = { x: posRef.current.x, y: posRef.current.y };
    const angle = Math.random() * Math.PI * 2;
    const throwDist = 240 + Math.random() * 240;
    const rawTarget = { x: origin.x + Math.cos(angle) * throwDist, y: origin.y + Math.sin(angle) * throwDist };
    const { end: rest } = resolveTarget({ forceTarget: rawTarget });

    fetchHomeRef.current = origin;
    fetchingRef.current = "flying";
    fetchLandingRef.current = rest;
    speak(pick(FETCH_THROW_PHRASES), 1800);

    if (ballTimerRef.current) clearInterval(ballTimerRef.current);
    ballSimRef.current = planToss(origin, rest);
    ballTurnRef.current = { turn: 0, spin: 0, at: 0 };
    setBallShown(true);
    let last = performance.now();
    ballTimerRef.current = setInterval(() => {
      const b = ballSimRef.current;
      if (!b) return;
      const now = performance.now();
      stepBall(b, (now - last) / 1000);
      last = now;
      drawBall();
      if (fetchingRef.current === "flying") {
        const f: 1 | -1 = ballGround(b).x >= posRef.current.x ? 1 : -1;
        if (f !== facingRef.current) {
          facingRef.current = f;
          setFacing(f);
        }
      }
      if (b.resting) {
        if (ballTimerRef.current) clearInterval(ballTimerRef.current);
        ballTimerRef.current = null;
        handleBallLanded();
      }
    }, 16);
  }

  function petOzho() {
    holdIdle();
    const today = new Date().toISOString().slice(0, 10);
    let n = 0;
    try {
      const raw = window.localStorage.getItem(PET_COUNT_KEY);
      if (raw && raw.startsWith(today + ":")) n = parseInt(raw.slice(today.length + 1), 10) || 0;
    } catch {
      // ignore -- just means we can't tell he's been well-loved today
    }
    n += 1;
    try {
      window.localStorage.setItem(PET_COUNT_KEY, `${today}:${n}`);
    } catch {
      // ignore
    }
    setHeartKey((k) => k + 1);
    setShowHearts(true);
    if (heartsTimeoutRef.current) clearTimeout(heartsTimeoutRef.current);
    heartsTimeoutRef.current = setTimeout(() => setShowHearts(false), 1300);
    // The contented wiggle -- his own distinct reaction to being petted,
    // not just the generic little speaking-hop every line already gets.
    if (pettingTimeoutRef.current) clearTimeout(pettingTimeoutRef.current);
    setPetting(true);
    pettingTimeoutRef.current = setTimeout(() => setPetting(false), 700);
    speak(pick(n >= PET_LOTS_THRESHOLD ? PET_PHRASES_LOTS : PET_PHRASES), 2800);
  }

  function doTrick() {
    holdIdle();
    if (trickTimeoutRef.current) clearTimeout(trickTimeoutRef.current);
    setTrick(true);
    trickTimeoutRef.current = setTimeout(() => setTrick(false), 760);
    speak(pick(CELEBRATION_PHRASES), 2600);
  }

  // The panel's "Up next" link: he cheers and you're off -- the panel
  // already showed what it is, so there's nothing left to announce.
  function goNext(href: string) {
    closeMenu();
    beginWakeUp();
    lastInteractionAtRef.current = Date.now();
    speak(pick(NEXT_INTRO), 1800);
    router.push(href);
  }

  function toggleFollow() {
    const next = !followModeRef.current;
    followModeRef.current = next;
    setFollowMode(next);
    try {
      window.localStorage.setItem(FOLLOW_STORAGE_KEY, next ? "1" : "0");
    } catch {
      // ignore -- it just won't persist across reloads
    }
    speak(pick(next ? FOLLOW_ON_PHRASES : FOLLOW_OFF_PHRASES), 2800);
    if (next) {
      // Same "already near enough" check the tick loop uses -- turning
      // follow on while the cursor happens to already be right beside him
      // shouldn't send him off walking toward the exact offset spot.
      const anchor = followAnchor();
      const d = Math.hypot(posRef.current.x - anchor.x, posRef.current.y - anchor.y);
      if (d > FOLLOW_TOLERANCE) {
        beginWalk({ forceTarget: followTarget(), urgent: true, speedMult: FOLLOW_SPEED_MULT, straight: true });
      } else {
        behaviorUntilRef.current = Date.now() + FOLLOW_RECHECK_MS;
      }
    }
  }

  // "Stay put until told otherwise" -- unlike followMode, this doesn't
  // move him anywhere itself (there's nowhere it needs to send him,
  // he just stops where he already is) and isn't persisted to
  // localStorage: a fresh page load never starts him already sat down.
  function toggleSit() {
    const next = !sittingRef.current;
    sittingRef.current = next;
    setSitting(next);
    speak(pick(next ? SIT_ON_PHRASES : SIT_OFF_PHRASES), 2400);
  }

  function handleMenuAction(action: OzhoAction) {
    closeMenu();
    beginWakeUp();
    lastInteractionAtRef.current = Date.now();
    // Any action besides sit itself means standing back up first --
    // fetching, doing a trick, or trotting along beside the reader don't
    // make sense from a seated position. toggleSit handles its own
    // stand-up case below.
    if (action !== "sit" && sittingRef.current) {
      sittingRef.current = false;
      setSitting(false);
    }
    switch (action) {
      case "pet":
        petOzho();
        break;
      case "trick":
        doTrick();
        break;
      case "fetch":
        throwBall();
        break;
      case "sit":
        toggleSit();
        break;
      case "follow":
        toggleFollow();
        break;
      case "wardrobe":
        speak("Wardrobe! I'll try not to take forever.", 2000);
        setTimeout(() => router.push("/settings#wardrobe"), 700);
        break;
    }
  }

  function onClickDog() {
    // The window-level click listener (see the init effect) already stamps
    // lastInteractionAtRef for the generic idle timer; a direct click on
    // him specifically gets its own reaction. Captured before beginWakeUp()
    // runs, since that's what actually changes the state.
    const wasAsleep = asleepRef.current || sleepAnimRef.current !== "none";
    beginWakeUp();
    if (wasAsleep) {
      // Waking him is a moment of its own -- don't also throw a menu at the
      // student in the same click.
      speak(pick(SLEEPY_WAKE_PHRASES), 3200);
      return;
    }
    if (menuOpenRef.current) {
      closeMenu();
      return;
    }
    // Mid-stride used to just get a greeting, since a moving target is a
    // hard thing to click a second time to actually pick something from
    // -- but that meant there was no way to reach the menu at all while
    // he was walking. The click itself now stops him wherever he is (see
    // openMenu, which also cleans up a fetch in progress) so the menu he
    // opens is one you can actually use.
    openMenu();
  }

  // While the menu's open, a click anywhere off Ozho, any scroll, or a few
  // seconds of no choice all dismiss it.
  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: PointerEvent) {
      const t = e.target as Element;
      if (!wrapperRef.current?.contains(t) && !t.closest?.("[data-ozho-panel]")) closeMenu();
    }
    // The desktop panel is pinned beside where he stood; once the page
    // scrolls it would be pinned beside nothing. The phone sheet doesn't
    // point at anything, so it stays.
    function onScroll() {
      if (!isMobileRef.current) closeMenu();
    }
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  const mood = stage ? MOOD_BY_STAGE[stage] : "neutral";
  const hidden = HIDDEN_ON.has(pathname ?? "");

  if (!ready || hidden) return null;

  // Deliberately just one absolutely-positioned element with no positioned
  // wrapper around it: with nothing between it and the document root, its
  // top/left resolve in PAGE space, so it scrolls with the content like
  // something that actually lives there instead of floating over it. The
  // thrown fetch ball is a second such element -- it lives at its own page
  // coordinates, independent of where Ozho currently is.
  return (
    <>
      {ballShown && (
        <>
          <div
            ref={ballShadowElRef}
            aria-hidden
            className="absolute left-0 top-0 z-30 pointer-events-none rounded-[50%] bg-black"
            style={{ width: BALL_SIZE * 1.2, height: 3, opacity: 0 }}
          />
          <div
            ref={ballElRef}
            aria-hidden
            className="absolute left-0 top-0 z-40 pointer-events-none will-change-transform"
            style={{ width: BALL_SIZE, height: BALL_SIZE, opacity: 0 }}
          >
            <div ref={ballBodyElRef} style={{ transformOrigin: "50% 100%" }}>
              <PixelBall size={BALL_SIZE} />
            </div>
          </div>
        </>
      )}
      <div
        ref={wrapperRef}
        className="absolute z-40 pointer-events-none transition-opacity duration-200"
        style={
          isMobile
            ? // Docked: pinned to the viewport itself (fixed), not the page
              // (absolute), so scrolling never carries content underneath a
              // spot he still thinks is empty. Opened with the menu still
              // closed for real here -- see openMenu, which points posRef at
              // this same corner (in page coordinates) the instant it opens,
              // so the branch below takes over without a visible jump.
              { position: "fixed", right: MOBILE_DOCK_MARGIN_X, top: MOBILE_DOCK_MARGIN_Y, opacity: 1 }
            : {
                left: posRef.current.x,
                top: posRef.current.y,
                transform: "translate(-50%, -50%)",
                opacity: behindText ? BEHIND_TEXT_OPACITY : 1,
              }
        }
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
          <div className="bg-white border border-[#ebe3d3] shadow-[0_6px_20px_rgba(38,34,24,0.12)] rounded-xl px-3 py-2 text-xs text-ink leading-snug text-center">
            {bubble}
          </div>
          <div className="w-2.5 h-2.5 bg-white border-r border-b border-[#ebe3d3] rotate-45 mx-auto -mt-[7px]" />
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
            <span className="absolute bottom-0 left-0 text-[10px] font-bold text-[#9a9384] animate-zzz" style={{ animationDelay: "0s" }}>
              z
            </span>
            <span className="absolute bottom-0 left-2.5 text-xs font-bold text-[#9a9384] animate-zzz" style={{ animationDelay: "0.55s" }}>
              Z
            </span>
            <span className="absolute bottom-0 left-5 text-sm font-bold text-[#9a9384] animate-zzz" style={{ animationDelay: "1.1s" }}>
              Z
            </span>
          </div>
        </div>
      )}
      {isMobile && (
        // An opaque circular backdrop, docked-mode only -- so whatever
        // line of text happens to be scrolled underneath this corner
        // reads as "there's a badge here" (the same read as any floating
        // chat-launcher icon) rather than his transparent-background
        // sprite ambiguously sitting mid-sentence, which is exactly what
        // made the old free-roaming version look glitchy rather than cute.
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(38,34,24,0.18)]"
          style={{ width: MOBILE_DOCK_BADGE_SIZE, height: MOBILE_DOCK_BADGE_SIZE }}
          aria-hidden
        />
      )}
      <button
        onClick={onClickDog}
        aria-label="Ozho, your study companion"
        className={`relative pointer-events-auto block cursor-pointer bg-transparent border-none p-0 transition-transform duration-150 ease-out ${
          sleepAnim === "falling"
            ? "animate-fall-asleep"
            : sleepAnim === "waking"
            ? "animate-wake-up"
            : trick
            ? "animate-trick"
            : petting
            ? "animate-ozho-pet"
            : perk
            ? "animate-perk"
            : land && !isWalking
            ? "animate-ozho-land"
            : stage === "critical" && !isWalking
            ? "animate-worried"
            : isWalking
            ? ""
            : idleAct === "sniff"
            ? "animate-ozho-sniff"
            : idleAct === "stretch"
            ? "animate-ozho-stretch"
            : idleAct === "bow"
            ? "animate-ozho-bow"
            : idleAct === "tilt"
            ? "animate-ozho-tilt"
            : idleAct === "hop"
            ? "animate-ozho-hops"
            : idleAct === "spin"
            ? "animate-ozho-spin"
            : ""
        }`}
        style={{ ["--face" as string]: facing }}
      >
        {/* An invisible, generously-sized hit area centered over him --
            his actual sprite is only 44x27.5 and an odd, non-square shape
            (a walking pixel-art dog, not a button), which made him
            genuinely hard to reliably click, especially mid-stride. This
            is a plain descendant of the button (clicks on it still fire
            onClick via bubbling), sized and centered independently of the
            sprite, so it doesn't touch this wrapper's own box -- the
            speech bubble, zzz, and radial menu all position off of that,
            and shouldn't shift just because the hitbox got friendlier.
            Docked mode skips the extra padding entirely -- he's stationary
            there, not "mid-stride", so the enlarged hitbox isn't needed,
            and the smaller it is the less of whatever's underneath (an
            answer choice, a Submit button) it can end up blocking. */}
        {!isMobile && (
          <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2" aria-hidden />
        )}
        {/* Gait bob and lean land here, written by the render loop. */}
        <span ref={bodyRef} className="block" style={{ transformOrigin: "50% 80%" }}>
        <PixelDog
          size={isMobile ? MOBILE_DOCK_SIZE : 44}
          mood={mood}
          dead={stage === "dead"}
          asleep={asleep}
          // The trick is a jump-spin from standing, even if he was sitting;
          // a "Sit" he was told resumes once he lands.
          sitting={(sitting || idleAct === "rest") && !isWalking && !trick}
          legFrame={isWalking ? legFrame : 0}
          tailFrame={tailFrame}
          facing={facing}
          costume={costume}
          carryingBall={carryingBall}
        />
        </span>
      </button>

      {showHearts && (
        // A quick puff of hearts when you pet him -- three, staggered, each
        // drifting a slightly different direction so it reads as a little
        // burst rather than a stack. Keyed so repeat pets restart it.
        <div key={heartKey} className="absolute left-1/2 top-0 pointer-events-none" aria-hidden>
          {[
            { d: "0s", x: "-14px" },
            { d: "0.12s", x: "4px" },
            { d: "0.24s", x: "16px" },
          ].map((h, i) => (
            <span
              key={i}
              className="absolute text-sm animate-ozho-heart"
              style={{ "--hx": h.x, animationDelay: h.d } as CSSProperties}
            >
              💛
            </span>
          ))}
        </div>
      )}

      </div>
      {menuOpen && (
        // A sibling of the wrapper, not a child: the wrapper carries a
        // transform, which would make this fixed-position panel position
        // itself against him instead of the viewport.
        <div data-ozho-panel>
          <OzhoPanel
            anchor={panelAnchor}
            stage={stage}
            streak={streak}
            fedToday={fedToday}
            sitting={sitting}
            following={followMode}
            docked={isMobile}
            onAction={handleMenuAction}
            onGo={goNext}
            onClose={closeMenu}
          />
        </div>
      )}
    </>
  );
}
