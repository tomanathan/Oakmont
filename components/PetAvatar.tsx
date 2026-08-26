import type { PetStage } from "@/lib/pet";

const PALETTE: Record<PetStage, { body: string; belly: string; accent: string }> = {
  thriving: { body: "#6d7fd6", belly: "#eaecfa", accent: "#2f6f4f" },
  content: { body: "#7d8bd9", belly: "#eef0fc", accent: "#4a5bb0" },
  hungry: { body: "#d9a15c", belly: "#fbe9dd", accent: "#b5602f" },
  critical: { body: "#c9622f", belly: "#fbe0d0", accent: "#9a3f1a" },
  dead: { body: "#9a94a6", belly: "#e5e2ec", accent: "#6b6478" },
};

function Face({ stage }: { stage: PetStage }) {
  const c = PALETTE[stage].accent;
  switch (stage) {
    case "thriving":
      return (
        <>
          <circle cx={78} cy={95} r={5} fill={c} />
          <circle cx={122} cy={95} r={5} fill={c} />
          <path d="M 75 112 Q 100 130 125 112" fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" />
          <path d="M 55 80 L 45 65 M 145 80 L 155 65" stroke={c} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
        </>
      );
    case "content":
      return (
        <>
          <circle cx={78} cy={95} r={5} fill={c} />
          <circle cx={122} cy={95} r={5} fill={c} />
          <path d="M 80 116 Q 100 126 120 116" fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" />
        </>
      );
    case "hungry":
      return (
        <>
          <circle cx={78} cy={97} r={4.5} fill={c} />
          <circle cx={122} cy={97} r={4.5} fill={c} />
          <path d="M 82 120 Q 100 112 118 120" fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" />
        </>
      );
    case "critical":
      return (
        <>
          <path d="M 73 92 L 83 100 M 83 92 L 73 100" stroke={c} strokeWidth={3.5} strokeLinecap="round" />
          <path d="M 117 92 L 127 100 M 127 92 L 117 100" stroke={c} strokeWidth={3.5} strokeLinecap="round" />
          <path d="M 82 122 Q 100 108 118 122" fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" />
        </>
      );
    case "dead":
      return (
        <>
          <path d="M 72 90 L 84 102 M 84 90 L 72 102" stroke={c} strokeWidth={4} strokeLinecap="round" />
          <path d="M 116 90 L 128 102 M 128 90 L 116 102" stroke={c} strokeWidth={4} strokeLinecap="round" />
          <path d="M 84 122 Q 100 116 116 122" fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" />
        </>
      );
  }
}

export function PetAvatar({ stage, size = 120 }: { stage: PetStage; size?: number }) {
  const p = PALETTE[stage];
  const droop = stage === "critical" || stage === "dead";
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={stage === "thriving" ? "animate-flame-pulse" : ""}>
      {stage === "dead" && (
        <text x="100" y="40" textAnchor="middle" fontSize="28" fill={p.accent} opacity={0.7}>
          ✝
        </text>
      )}
      <ellipse cx={100} cy={172} rx={44} ry={7} fill="#000" opacity={0.06} />
      <path
        d={
          droop
            ? "M 100 55 C 145 55 168 90 165 130 C 163 158 135 172 100 172 C 65 172 37 158 35 130 C 32 90 55 55 100 55 Z"
            : "M 100 48 C 148 48 172 85 170 128 C 168 160 138 178 100 178 C 62 178 32 160 30 128 C 28 85 52 48 100 48 Z"
        }
        fill={p.body}
        opacity={stage === "dead" ? 0.7 : 1}
      />
      <ellipse cx={100} cy={135} rx={38} ry={28} fill={p.belly} opacity={stage === "dead" ? 0.6 : 0.9} />
      <ellipse cx={62} cy={70} rx={13} ry={9} fill={p.body} opacity={stage === "dead" ? 0.7 : 1} />
      <ellipse cx={138} cy={70} rx={13} ry={9} fill={p.body} opacity={stage === "dead" ? 0.7 : 1} />
      <Face stage={stage} />
    </svg>
  );
}
