// Paper motion: pages and sheets that physically turn.
//
// Two kinds of turn, both built the same way:
//   "page": a whole notebook page (.nbk-page) turning over its left-hand
//           spiral, like a book. Used between screens.
//   "leaf": a sheet inside the page flipping up over its top edge, like a
//           legal pad. Used when the content of one panel changes in place
//           (the next worked example, the next question type).
//
// How: copy the sheet as it looks right now (a DOM clone, cropped to what's
// on screen), lay the copy exactly over the real one, let the real one
// change underneath, then turn the copy away to reveal it. Going back runs
// it the other way: the new sheet's copy swings in over a copy of the old.
// Nothing on the real page is frozen, so it stays clickable throughout.

export type TurnKind = "page" | "leaf";
export type TurnDir = "fwd" | "back";

const MS = { page: 780, leaf: 640 } as const;
// Turns and leaves are decorative: if anything about one fails, the swap
// underneath has already happened, so just clean up.
let active: { stop: () => void } | null = null;

interface Sheet {
  stage: HTMLDivElement;
  sheet: HTMLDivElement;
  shade: HTMLDivElement;
  backShade: HTMLDivElement;
  cast: HTMLDivElement;
}

function div(cls: string) {
  const d = document.createElement("div");
  d.className = cls;
  return d;
}

/**
 * Wraps the copy in empty stand-ins for its ancestors (same classes, no
 * box of their own), so styles scoped under them (".nb-root .nb-choice",
 * CSS variables, inherited fonts) still apply to it on <body>.
 */
function scoped(el: HTMLElement, clone: HTMLElement): HTMLElement {
  let inner: HTMLElement = clone;
  for (let n = el.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    if (!n.className || typeof n.className !== "string") continue;
    const w = document.createElement("div");
    // Keep what styles the inside; drop what draws on the outside (tape,
    // frames) or moves (entrance animations).
    w.className = n.className
      .split(/\s+/)
      .filter((c) => c && !/^(nbk-taped|nbk-polaroid|paper-|animate-|nbk-page$)/.test(c))
      .join(" ");
    w.style.cssText = "position:absolute;inset:0;margin:0;padding:0;border:0;background:none;box-shadow:none;transform:none;filter:none;overflow:visible;display:block;width:auto;height:auto;max-width:none;min-height:0;animation:none;";
    w.append(inner);
    inner = w;
  }
  return inner;
}

/**
 * Walks the original and its copy side by side; any child wholly outside
 * [lo, hi] (screen y) is collapsed in the copy to an empty box of the same
 * size. Children that straddle the edge are walked into, a few levels deep.
 */
function skipOffscreen(src: Element, copy: Element, lo: number, hi: number, depth: number) {
  const a = src.children;
  const b = copy.children;
  if (a.length !== b.length) return;
  for (let i = 0; i < a.length; i++) {
    const r = a[i].getBoundingClientRect();
    if (r.height === 0 && r.width === 0) continue;
    const c = b[i] as HTMLElement;
    if (r.bottom < lo || r.top > hi) {
      if (!c.style) continue;
      c.style.contentVisibility = "hidden";
      c.style.height = `${r.height}px`;
      c.style.minHeight = "0";
      c.style.boxSizing = "border-box";
    } else if (depth < 6 && r.height > hi - lo) {
      skipOffscreen(a[i], c, lo, hi, depth + 1);
    }
  }
}

/** The first solid background colour at or behind `el`. */
function groundOf(el: HTMLElement): string {
  for (let n: HTMLElement | null = el; n; n = n.parentElement) {
    const c = getComputedStyle(n).backgroundColor;
    if (c && c !== "transparent" && !/rgba\(.*,\s*0\)$/.test(c)) return c;
  }
  return "#fffdf7";
}

/** A copy of `el`, cropped to the screen, ready to turn. */
function lift(el: HTMLElement, kind: TurnKind): Sheet | null {
  const r = el.getBoundingClientRect();
  if (r.width < 40 || r.height < 30) return null;
  const vh = window.innerHeight;
  // Only what's visible (plus a little) is copied: a tall page turned whole
  // would be a huge texture for nothing.
  const top = Math.max(r.top, -24);
  const bottom = Math.min(r.bottom, vh + 24);
  if (bottom - top < 30) return null;
  const h = bottom - top;
  const fixed = kind === "page";

  const stage = div(`paper-stage paper-stage--${kind}`);
  stage.setAttribute("aria-hidden", "true");
  stage.style.left = `${r.left + (fixed ? 0 : window.scrollX)}px`;
  stage.style.top = `${top + (fixed ? 0 : window.scrollY)}px`;
  stage.style.width = `${r.width}px`;
  stage.style.height = `${h}px`;
  stage.style.position = fixed ? "fixed" : "absolute";
  // Look at the turn from the middle of the screen, not from the sheet's
  // own corner, so the perspective matches the room.
  stage.style.perspectiveOrigin = `${window.innerWidth / 2 - r.left}px ${vh / 2 - top}px`;

  const cast = div("paper-cast");
  const sheet = div("paper-sheet");
  const front = div("paper-face paper-front");
  const clone = el.cloneNode(true) as HTMLElement;
  // Everything off screen in the copy is skipped (kept at its size, its
  // insides never styled, laid out or painted): on a long page that's most
  // of it, and it's what makes lifting the copy cheap.
  skipOffscreen(el, clone, top - 120, bottom + 120, 0);
  clone.removeAttribute("id");
  clone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
  clone.querySelectorAll(".nbk-spiral").forEach((n) => n.remove());
  // Form fields copy their attributes, not what's been typed.
  const srcFields = el.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
  clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea").forEach((f, i) => {
    const src = srcFields[i];
    if (!src) return;
    if (f.type === "checkbox" || f.type === "radio") (f as HTMLInputElement).checked = (src as HTMLInputElement).checked;
    else f.value = src.value;
  });
  const cs = getComputedStyle(el);
  clone.style.position = "absolute";
  clone.style.left = "0";
  clone.style.top = `${r.top - top}px`;
  clone.style.width = `${r.width}px`;
  clone.style.height = `${r.height}px`;
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  clone.style.visibility = "visible";
  // The copy lives on <body>, outside whatever set its font and colour.
  clone.style.fontFamily = cs.fontFamily;
  clone.style.color = cs.color;
  // A see-through sheet takes the colour of whatever it's lying on.
  if (cs.backgroundColor === "rgba(0, 0, 0, 0)") clone.style.backgroundColor = groundOf(el);
  front.style.borderRadius = cs.borderRadius;
  const shade = div("paper-shade");
  front.append(scoped(el, clone), shade);

  const back = div("paper-face paper-back");
  back.style.borderRadius = cs.borderRadius;
  const backShade = div("paper-shade paper-shade--back");
  back.append(backShade);

  sheet.append(front, back);
  stage.append(cast, sheet);
  document.body.append(stage);
  return { stage, sheet, shade, backShade, cast };
}


type Frame = Keyframe & { offset: number };
/** The same motion played backwards (every frame needs an offset). */
const reverse = (f: Frame[]): Frame[] => [...f].reverse().map((k) => ({ ...k, offset: 1 - k.offset }));

/** Rotation keyframes: the sheet lifts at its free edge, then swings over. */
function frames(kind: TurnKind, dir: TurnDir) {
  const f: Frame[] =
    kind === "page"
      ? [
          // the free edge curls up first, then the sheet swings over
          { transform: "rotateY(0deg) skewY(0deg)", offset: 0 },
          { transform: "rotateY(-14deg) skewY(-1.2deg)", offset: 0.27 },
          { transform: "rotateY(-80deg) skewY(-2deg)", offset: 0.56 },
          { transform: "rotateY(-140deg) skewY(-1deg)", offset: 0.8 },
          { transform: "rotateY(-180deg) skewY(0deg)", offset: 1 },
        ]
      : [
          { transform: "rotateX(0deg) skewX(0deg)", offset: 0 },
          { transform: "rotateX(12deg) skewX(0.8deg)", offset: 0.24 },
          { transform: "rotateX(76deg) skewX(1.2deg)", offset: 0.55 },
          { transform: "rotateX(160deg) skewX(0deg)", offset: 1 },
        ];
  // Each stretch eases on its own (the whole run stays linear), so the
  // timing above is the timing you see.
  const eased = f.map((k) => ({ ...k, easing: "cubic-bezier(.42,0,.58,1)" }));
  return dir === "fwd" ? eased : reverse(eased);
}

function run(s: Sheet, kind: TurnKind, dir: TurnDir, under?: Sheet | null): Promise<void> {
  const ms = MS[kind];
  const opts = { duration: ms, easing: "linear", fill: "both" as const };
  const fwd = dir === "fwd";
  const anims: Animation[] = [];
  anims.push(s.sheet.animate(frames(kind, dir), opts));
  // The front darkens as it turns away from the light; the back brightens
  // as it comes round.
  const shadeK: Frame[] = [
    { opacity: 0, offset: 0 },
    { opacity: 0.55, offset: 0.5 },
    { opacity: 0.9, offset: 1 },
  ];
  anims.push(s.shade.animate(fwd ? shadeK : reverse(shadeK), opts));
  const backK: Frame[] = [
    { opacity: 1, offset: 0 },
    { opacity: 0.85, offset: 0.55 },
    { opacity: 0, offset: 1 },
  ];
  anims.push(s.backShade.animate(fwd ? backK : reverse(backK), opts));
  // Its shadow falls across the sheet underneath, deepest when it's
  // standing up, and slides toward the binding (or the top edge).
  const sc = (n: number) => (kind === "page" ? `scale(${n}, 1)` : `scale(1, ${n})`);
  const castK: Frame[] = [
    { opacity: 0, transform: sc(1), offset: 0 },
    { opacity: 1, transform: sc(0.55), offset: 0.45 },
    { opacity: 0, transform: sc(0.08), offset: 0.85 },
    { opacity: 0, transform: sc(0.08), offset: 1 },
  ];
  const castTarget = fwd ? s.cast : under?.cast ?? s.cast;
  anims.push(castTarget.animate(fwd ? castK : reverse(castK), opts));
  // Once over, it's lying face down past the binding, off the page: let it
  // drop away rather than vanish where it lands.
  // (A leaf would land on top of what's above it, so it goes sooner.)
  const gone = kind === "page" ? 0.82 : 0.6;
  if (fwd) anims.push(s.sheet.animate([{ opacity: 1 }, { opacity: 1, offset: gone }, { opacity: 0 }], { duration: ms, fill: "both" }));
  else anims.push(s.sheet.animate([{ opacity: 0 }, { opacity: 1, offset: 1 - gone }, { opacity: 1 }], { duration: ms, fill: "both" }));
  return Promise.all(anims.map((a) => a.finished)).then(
    () => undefined,
    () => undefined,
  );
}

function cleanup(...sheets: (Sheet | null)[]) {
  for (const s of sheets) s?.stage.remove();
}

/**
 * Turn `el` over while `update` changes it. `update` may be async (a route
 * change): the copy holds still over the old sheet until it resolves.
 * `find` re-finds the element after the update (a route change replaces it).
 */
export async function turn(
  el: HTMLElement | null,
  update: () => void | Promise<void>,
  opts: { kind: TurnKind; dir?: TurnDir; find?: () => HTMLElement | null },
): Promise<void> {
  active?.stop();
  const kind = opts.kind;
  const dir = opts.dir ?? "fwd";
  if (!el || typeof el.animate !== "function") {
    await update();
    return;
  }
  let stopped = false;
  const made: (Sheet | null)[] = [];
  const hidden: HTMLElement[] = [];
  const stop = () => {
    stopped = true;
    cleanup(...made);
    hidden.forEach((h) => (h.style.visibility = ""));
  };
  const me = { stop };
  active = me;
  try {
    const old = lift(el, kind);
    made.push(old);
    await update();
    if (stopped) return;
    // Let the new sheet lay itself out before it's copied or revealed.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (stopped) return;
    if (!old) return;
    if (dir === "fwd") {
      await run(old, kind, "fwd");
    } else {
      const now = (opts.find?.() ?? el) as HTMLElement | null;
      const next = now && now.isConnected ? lift(now, kind) : null;
      made.push(next);
      if (!next || !now) return;
      // The old copy stays as the sheet underneath; the real new one waits
      // hidden until its copy has landed on top.
      old.sheet.querySelector(".paper-back")?.remove();
      now.style.visibility = "hidden";
      hidden.push(now);
      next.stage.style.zIndex = String((Number(getComputedStyle(old.stage).zIndex) || 28) + 1);
      await run(next, kind, "back", old);
    }
  } finally {
    if (active === me) active = null;
    if (!stopped) stop();
  }
}

// ---------- page turns between screens ----------

/** A notebook page: the app's (.nbk-page) or the homepage's (.nb-page). */
export const PAGE = ".nbk-page, .nb-page";

// Roughly how deep each screen sits, so going "back up" turns the page
// back. Unknown screens count as one level in.
const DEPTH: [RegExp, number][] = [
  [/^\/dashboard\/?$/, 0],
  [/^\/plan/, 1],
  [/^\/subskill\//, 1],
  [/^\/review/, 1],
  [/^\/settings/, 2],
  [/^\/parent\/?$/, 0],
  [/^\/dev-preview\/dashboard/, 0],
];
export function depthOf(path: string): number {
  for (const [re, d] of DEPTH) if (re.test(path)) return d;
  return 1;
}

type Nav = (href: string) => void;
let navigate: Nav | null = null;
let waiting: (() => void) | null = null;

/** Wired up by PaperMotion: how to change route, and when it has changed. */
export function setNavigator(fn: Nav | null) {
  navigate = fn;
}
export function routeChanged() {
  const w = waiting;
  waiting = null;
  w?.();
}

/** Go to `href` with the notebook page turning over to it. */
export function turnTo(href: string, dir?: TurnDir) {
  const go = navigate;
  if (!go) {
    window.location.assign(href);
    return;
  }
  const to = new URL(href, window.location.href);
  const page = document.querySelector<HTMLElement>(PAGE);
  const d = dir ?? (depthOf(to.pathname) < depthOf(window.location.pathname) ? "back" : "fwd");
  void turn(
    page,
    () =>
      new Promise<void>((resolve) => {
        waiting = resolve;
        go(to.pathname + to.search + to.hash);
        // A slow screen shouldn't keep the old page hanging there.
        window.setTimeout(() => {
          if (waiting === resolve) routeChanged();
        }, 1600);
      }),
    { kind: "page", dir: d, find: () => document.querySelector<HTMLElement>(PAGE) },
  );
}
