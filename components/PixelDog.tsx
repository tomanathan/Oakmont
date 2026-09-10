export type DogMood = "happy" | "neutral" | "tired" | "sad";

const PALETTE = {
  body: "#c98a4b",
  bodyDark: "#a86a34",
  belly: "#f6ead6",
  dark: "#2b2018",
  tongue: "#e28a86",
  collar: "#2f6f4f",
  tag: "#e0b84a",
};

const PALETTE_DEAD = {
  body: "#a6a2ab",
  bodyDark: "#87838d",
  belly: "#e2e0e6",
  dark: "#4a4650",
  tongue: "#a6a2ab",
  collar: "#87838d",
  tag: "#c7c4cc",
};

// Mochi's palette -- the second companion, unlocked at a long streak (see
// lib/pet.ts's SECOND_PET_UNLOCK_STREAK_DAYS). Same silhouette as Ozho
// throughout this file; only the colors change, drawn from the app's own
// lavender/indigo accent and gold-star tones rather than a random new
// palette, so Mochi reads as belonging to this app rather than a generic
// reskin.
const PALETTE_MOCHI = {
  body: "#8b8fc2",
  bodyDark: "#6d70a0",
  belly: "#eceafc",
  dark: "#2b2038",
  tongue: "#e28a86",
  collar: "#c9971b",
  tag: "#e0b84a",
};

// Six hand-drawn tail positions, swept through a wide arc for the wag --
// see the tailFrame prop's own doc below for why discrete drawn frames are
// used instead of a CSS rotation. Each entry is [nearX, nearY, tipX, tipY],
// the top-left corners of the two rects that make up the tail (an 8x8
// "near" square closer to the body, a 6x6 "tip" square further out).
//
// Two earlier versions of this table moved the near square's position
// directly from frame to frame -- one swept it almost straight up and
// down (read as a vertical bob, not a wag), the other widened its
// horizontal range to fix that but let it drift far enough left that it
// stopped overlapping the body at all at the extreme frame, so the tail
// visibly detached from him. Both mistakes trace to the same cause:
// standard sprite-animation practice pins a tail to a *fixed pivot point*
// where it meets the body and swings everything else around that one
// unmoving point -- letting the attachment point itself drift is exactly
// what makes a sprite "appear to levitate" between frames (see Sources).
// This table is built that way instead: every [nearX, nearY, tipX, tipY]
// below is the two squares' centers rotated by a different angle around a
// single fixed pivot at roughly (9, 20) -- right where the body's left
// edge sits -- at a small radius for the near square (3px) and a larger
// one for the tip (7px). Small radius means the near square always
// contains the pivot point by construction, at every angle, so it always
// overlaps the body; the tip, rotating rigidly along with it at the same
// angle, is always close enough to the near square to overlap it too.
// Both connections are geometric guarantees, not just numbers that
// happened to work out -- there's no frame where either joint can gap.
// ScoutCompanion ping-pongs through these in order (0..5..0) rather than
// looping frame 5 back to 0, since this is a back-and-forth swing, not a
// full rotation -- a same-direction loop would jump instead of reverse.
const TAIL_WAG_FRAMES: [number, number, number, number][] = [
  [6, 13, 7, 10],
  [4, 13, 4, 10],
  [3, 14, 2, 11],
  [2, 15, 0, 14],
  [2, 16, 0, 17],
  [2, 17, 0, 19],
];

/**
 * A small blocky, flat-color "pixel art" dog -- Ozho's on-screen form.
 * Shared by the static PetAvatar (dashboard card, welcome page) and the
 * roaming ScoutCompanion, so the character looks the same everywhere; only
 * pose (legFrame), mood, and facing direction change between call sites.
 */
export function PixelDog({
  size = 56,
  mood = "neutral",
  legFrame = 0,
  tailFrame = 0,
  facing = 1,
  dead = false,
  asleep = false,
  costume = null,
  variant = "ozho",
  className = "",
}: {
  size?: number;
  mood?: DogMood;
  legFrame?: 0 | 1;
  // Which of TAIL_WAG_FRAMES' six hand-drawn tail positions to draw when
  // the tail is up -- see tailUp below. Stepping through these (see
  // ScoutCompanion's own tailFrame timer, which ping-pongs 0..5..0) is
  // the actual wag: distinct drawn shapes swapped on a timer, the same
  // technique the walk cycle already uses for legFrame, rather than a CSS
  // transform. A continuous CSS rotation was tried first and turned out
  // to be the wrong tool here -- at his real render size the tail is only
  // ~7x10px, and `shape-rendering: crispEdges` pixel-snaps geometry for
  // sharp pixel-art edges, which collapses a few degrees of sub-pixel
  // rotation into little or no visible difference. A hand-drawn position
  // swap has no such ambiguity: each frame is an exact, unrounded set of
  // integer coordinates, so the difference between frames is always
  // genuinely visible on screen -- exactly why the leg swap already reads
  // fine at this same scale. Six frames (rather than the original two)
  // give the swing room to cover a much bigger arc while still reading as
  // a smooth sweep rather than a snap between two extremes.
  tailFrame?: 0 | 1 | 2 | 3 | 4 | 5;
  facing?: 1 | -1;
  dead?: boolean;
  asleep?: boolean;
  // Wardrobe costume id (see lib/costumes.ts), or null/"none" for bare.
  // Only drawn on the standing pose -- a dead or sleeping Ozho stays
  // undressed, both to keep the art simple and because neither state is
  // really a "look how far I've come" moment.
  costume?: string | null;
  // Which pet this renders as -- "ozho" (default, every existing call
  // site) or "mochi" (the second companion, unlocked by a long streak).
  // Same shapes throughout this file either way; only the palette below
  // changes. Mochi never wears a costume or dies (see SecondCompanion.tsx),
  // but both states still resolve palette the same way dead does, so
  // nothing here needs its own dead/asleep branching.
  variant?: "ozho" | "mochi";
  className?: string;
}) {
  const p = dead ? PALETTE_DEAD : variant === "mochi" ? PALETTE_MOCHI : PALETTE;

  // Asleep (and not dead -- a dead dog stays in the standing pose below,
  // it doesn't curl up) gets a completely different, compact silhouette
  // rather than the standing pose with its eyes shut: lying down, tail
  // curled over the back, legs tucked out of sight entirely. Sized and
  // positioned to sit in the same viewBox/ground-shadow spot as the
  // standing pose so nothing shifts when he drops off to sleep.
  if (asleep && !dead) {
    return (
      <svg
        viewBox="0 0 64 40"
        width={size}
        height={(size * 40) / 64}
        shapeRendering="crispEdges"
        style={{ transform: facing === -1 ? "scaleX(-1)" : undefined }}
        className={className}
      >
        <ellipse cx={32} cy={38} rx={19} ry={2} fill="#000" opacity={0.12} />

        {/* body -- four stacked bands narrowing toward the top fake a
            rounded, curled-up dome using the same flat-rect language as
            the rest of the sprite */}
        <rect x={14} y={30} width={34} height={4} fill={p.body} />
        <rect x={11} y={23} width={39} height={7} fill={p.body} />
        <rect x={16} y={17} width={29} height={6} fill={p.body} />
        <rect x={21} y={12} width={19} height={5} fill={p.body} />

        {/* tail, curled up and resting on top of the back */}
        <rect x={16} y={9} width={7} height={7} fill={p.bodyDark} />
        <rect x={20} y={13} width={6} height={6} fill={p.bodyDark} />

        {/* head, tucked down low at the front */}
        <rect x={42} y={19} width={13} height={12} fill={p.body} />
        <rect x={52} y={23} width={7} height={7} fill={p.belly} />
        <rect x={57} y={25} width={2.5} height={2.5} fill={p.dark} />

        {/* ear, relaxed and hanging against the neck */}
        <rect x={40} y={25} width={5} height={9} fill={p.bodyDark} />

        {/* eye -- flat closed line */}
        <rect x={47} y={22.3} width={3.5} height={1.2} rx={0.6} fill={p.dark} />

        {/* collar hint at the neck */}
        <rect x={40} y={21} width={3} height={7} fill={p.collar} />
      </svg>
    );
  }

  // Every other expressive cue below -- ear, tail, tongue, frown -- only
  // applies to this standing pose (asleep has its own curled-up look
  // above; dead always stays standing).
  const earUp = !dead && (mood === "happy" || mood === "neutral");
  // Tail up (and wagging, in ScoutCompanion) for every mood short of
  // "sad". "sad" is only ever critical (about to die) or dead -- and a
  // dog in real trouble shouldn't look thrilled to see you. Alive-but-sad
  // (critical) tucks the tail down; dead lets it lie limp straight back
  // (see the tail render below). Hungry maps to "tired", not "sad", so a
  // merely-hungry Ozho keeps the tail up -- ScoutCompanion just wags it
  // slower. Asleep has its own separate curled-up pose above that doesn't
  // reach this code at all.
  const tailUp = !dead && mood !== "sad";
  const tailTucked = !dead && mood === "sad";
  const showTongue = !dead && mood === "happy";
  const showFrown = dead || mood === "sad";

  const backLegDown = legFrame === 0;

  return (
    <svg
      viewBox="0 0 64 40"
      width={size}
      height={(size * 40) / 64}
      shapeRendering="crispEdges"
      style={{ transform: facing === -1 ? "scaleX(-1)" : undefined }}
      className={className}
    >
      <ellipse cx={32} cy={38} rx={20} ry={2} fill="#000" opacity={0.12} />

      {/* tail. Three poses:
          - up (tailUp): one of the six TAIL_WAG_FRAMES positions, stepped
            by ScoutCompanion on a timer for the wag -- see tailFrame's own
            doc above. Static callers (PetAvatar, PetCard, the header pill)
            render frame 0: up, not moving, still reads as fine.
          - tucked (tailTucked, i.e. critical / about to die): hangs
            straight down at the back, near the hind legs. The clearest
            "not okay" tail there is, and distinct from the dead pose.
          - limp (dead): lies flat straight back, lifeless.
          near/tip widths reach past x=10 on some frames so the tail tucks
          under the body's left edge with no gap -- see TAIL_WAG_FRAMES. */}
      {tailUp ? (
        <>
          <rect x={TAIL_WAG_FRAMES[tailFrame][0]} y={TAIL_WAG_FRAMES[tailFrame][1]} width={8} height={8} fill={p.bodyDark} />
          <rect x={TAIL_WAG_FRAMES[tailFrame][2]} y={TAIL_WAG_FRAMES[tailFrame][3]} width={6} height={6} fill={p.bodyDark} />
        </>
      ) : tailTucked ? (
        <>
          <rect x={5} y={23} width={7} height={6} fill={p.bodyDark} />
          <rect x={4} y={27} width={6} height={7} fill={p.bodyDark} />
        </>
      ) : (
        <rect x={0} y={22} width={12} height={4} fill={p.bodyDark} />
      )}

      {/* legs (walk cycle) */}
      <rect x={backLegDown ? 14 : 12} y={28} width={6} height={backLegDown ? 8 : 6} fill={p.bodyDark} />
      <rect x={backLegDown ? 34 : 32} y={28} width={6} height={backLegDown ? 6 : 8} fill={p.bodyDark} />

      {/* body */}
      <rect x={10} y={16} width={28} height={14} fill={p.body} />
      <rect x={10} y={24} width={28} height={5} fill={p.belly} />

      {/* head + snout */}
      <rect x={34} y={6} width={16} height={16} fill={p.body} />
      <rect x={48} y={14} width={8} height={8} fill={p.belly} />
      <rect x={53} y={16} width={3} height={3} fill={p.dark} />

      {/* ear -- perked pokes up above the head; relaxed hangs down past
          the jawline so it reads as a dangling ear rather than a patch
          lost inside the head square */}
      {earUp ? (
        <rect x={37} y={0} width={5} height={8} fill={p.bodyDark} />
      ) : (
        <rect x={34} y={14} width={5} height={14} fill={p.bodyDark} />
      )}

      {/* eye -- dead gets an X, tired gets a half-lidded slit (drowsy but
          not fully out), everyone else gets the normal open square */}
      {dead ? (
        <path d="M 41 10 L 44 13 M 44 10 L 41 13" stroke={p.dark} strokeWidth={1.4} strokeLinecap="round" />
      ) : mood === "tired" ? (
        <rect x={41.5} y={11.8} width={3.5} height={2} fill={p.dark} />
      ) : (
        <rect x={42} y={11} width={3} height={3} fill={p.dark} />
      )}

      {showTongue && <rect x={51} y={22} width={3} height={5} fill={p.tongue} />}
      {showFrown && <rect x={50} y={23} width={4} height={1.5} fill={p.dark} />}

      {/* collar */}
      <rect x={33} y={19} width={5} height={6} fill={p.collar} />
      <circle cx={35} cy={27} r={2} fill={p.tag} />

      {/* wardrobe costume -- standing pose only, see the costume prop doc */}
      {!dead && costume && costume !== "none" && <CostumeOverlay costume={costume} />}
    </svg>
  );
}

/**
 * Flat-rect costume pieces layered on top of the standing sprite, drawn in
 * the same viewBox coordinates and blocky style as the rest of Ozho. Each
 * one is intentionally simple -- a handful of shapes, not new art
 * direction -- so it reads at 44-120px without fussy detail.
 */
function CostumeOverlay({ costume }: { costume: string }) {
  switch (costume) {
    case "sunglasses":
      // Sized to clearly cover the whole eye/brow area (the native eye is
      // only 3x3) rather than a discreet accent -- at 22-40px render sizes
      // anything subtler than this reads as nothing at all.
      return (
        <>
          <rect x={39} y={9} width={9.5} height={5.5} rx={0.8} fill="#1a1a2e" />
          <rect x={36.3} y={10.6} width={3} height={1.8} fill="#1a1a2e" />
          <rect x={41.5} y={10.2} width={2} height={1.2} fill="#4a4a6a" />
        </>
      );
    case "bowtie":
      return (
        <>
          <path d="M 29 18.5 L 34.5 21 L 29 23.5 Z" fill="#5a6bc4" />
          <path d="M 41 18.5 L 35.5 21 L 41 23.5 Z" fill="#5a6bc4" />
          <rect x={34} y={19.5} width={3} height={3} fill="#e0b84a" />
        </>
      );
    case "scarf":
      return (
        <>
          <rect x={31} y={17} width={9} height={5} fill="#4a86ad" />
          <rect x={31} y={18.5} width={9} height={1.5} fill="#7fb3d5" />
          <rect x={32.5} y={22} width={5} height={10} fill="#3a6690" />
          <rect x={32.5} y={24.5} width={5} height={1.5} fill="#5a96bd" />
        </>
      );
    case "bandana":
      return (
        <>
          <path d="M 30 20.5 L 44 20.5 L 37.5 30.5 Z" fill="#c0524f" />
          <rect x={34} y={18.5} width={6} height={3} fill="#a8433f" />
        </>
      );
    case "cap":
      return (
        <>
          <rect x={35} y={0.5} width={15} height={6} fill="#3a6690" />
          <rect x={46.5} y={5.5} width={10} height={2.5} fill="#2d5170" />
          <circle cx={42.5} cy={2.5} r={1} fill="#eef3f8" />
        </>
      );
    case "cape":
      return <path d="M 12 14.5 L 12 32 L 1.5 28 L 3.5 17.5 Z" fill="#b23b3b" />;
    case "crown":
      return (
        <>
          <path d="M 35.5 6.5 L 37.5 1 L 41 4.5 L 44.5 -0.5 L 47.5 4.5 L 48.5 6.5 Z" fill="#e0b84a" />
          <circle cx={41} cy={3} r={0.9} fill="#c0524f" />
          <circle cx={37.7} cy={4} r={0.7} fill="#2f6f4f" />
        </>
      );
    // The three below are streak-reward costumes (see lib/costumes.ts) --
    // same "handful of flat shapes" treatment as the section-reward ones
    // above, just drawn at different spots on the sprite so they don't
    // collide with the collar/tag every costume already sits near.
    case "flame-collar":
      // A two-tone flame charm hanging just below the collar, roughly
      // where the tag circle already sits -- reads as a pendant, not a
      // replacement for the tag itself.
      return (
        <>
          <path d="M 35 23 L 37.5 27 L 35 31 L 32.5 27 Z" fill="#e8622c" />
          <path d="M 35 25.5 L 36.3 27.5 L 35 29.5 L 33.7 27.5 Z" fill="#f5a94e" />
        </>
      );
    case "star-badge":
      // A four-pointed sparkle badge on the flank, in the same gold as the
      // mastery stars elsewhere in the app (StarRating, the tag circle) --
      // deliberately echoes that iconography rather than inventing a new
      // "achievement" color.
      return (
        <path
          d="M 18 18 L 19.5 21.5 L 23 23 L 19.5 24.5 L 18 28 L 16.5 24.5 L 13 23 L 16.5 21.5 Z"
          fill="#e0b84a"
        />
      );
    case "explorer-hat":
      // A wide-brimmed safari hat -- same head position as the backwards
      // cap above, but a distinct silhouette (a narrower crown block sits
      // on top of a brim that extends past both sides) so the two don't
      // read as near-duplicates.
      return (
        <>
          <rect x={37} y={-1} width={10} height={5} fill="#c9a15a" />
          <rect x={32} y={3} width={20} height={2.5} rx={0.5} fill="#c9a15a" />
          <rect x={37} y={3.2} width={10} height={1} fill="#a9824a" />
        </>
      );
    default:
      return null;
  }
}
