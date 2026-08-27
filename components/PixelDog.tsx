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
  facing = 1,
  dead = false,
  asleep = false,
  className = "",
}: {
  size?: number;
  mood?: DogMood;
  legFrame?: 0 | 1;
  facing?: 1 | -1;
  dead?: boolean;
  asleep?: boolean;
  className?: string;
}) {
  const p = dead ? PALETTE_DEAD : PALETTE;

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
  const tailUp = !dead && mood === "happy";
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

      {/* tail (widths reach x=12 so they tuck under the body's left edge
          at x=10 with a 2-unit overlap instead of leaving a gap) */}
      {tailUp ? (
        <>
          <rect x={4} y={14} width={8} height={8} fill={p.bodyDark} />
          <rect x={2} y={8} width={6} height={6} fill={p.bodyDark} />
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
    </svg>
  );
}
