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
 * A small blocky, flat-color "pixel art" dog -- Scout's on-screen form.
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
  className = "",
}: {
  size?: number;
  mood?: DogMood;
  legFrame?: 0 | 1;
  facing?: 1 | -1;
  dead?: boolean;
  className?: string;
}) {
  const p = dead ? PALETTE_DEAD : PALETTE;
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

      {/* eye */}
      {dead ? (
        <>
          <path d="M 41 10 L 44 13 M 44 10 L 41 13" stroke={p.dark} strokeWidth={1.4} strokeLinecap="round" />
        </>
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
