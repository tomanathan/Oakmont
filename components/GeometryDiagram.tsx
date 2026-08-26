import type {
  DiagramSpec,
  TransversalPosition,
} from "@/lib/diagramTypes";

const STROKE = "#3a3550";
const MUTED = "#ab9c88";
const HILITE = "#b5602f";
const FILL = "#fef8f2";

function Label({
  x,
  y,
  text,
  hilite,
  muted,
  anchor = "middle",
  size = 15,
}: {
  x: number;
  y: number;
  text: string;
  hilite?: boolean;
  muted?: boolean;
  anchor?: "start" | "middle" | "end";
  size?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fill={hilite ? HILITE : muted ? MUTED : STROKE}
      fontWeight={hilite ? 700 : 500}
      fontFamily="inherit"
    >
      {text}
    </text>
  );
}

function ParallelTick({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={STROKE} strokeWidth={1.5}>
      <path d={`M ${x - 4} ${y - 6} L ${x + 4} ${y} L ${x - 4} ${y + 6}`} fill="none" />
      <path d={`M ${x + 4} ${y - 6} L ${x + 12} ${y} L ${x + 4} ${y + 6}`} fill="none" />
    </g>
  );
}

function RightAngleMark({ x, y, size = 14 }: { x: number; y: number; size?: number }) {
  return (
    <path
      d={`M ${x - size} ${y} L ${x - size} ${y - size} L ${x} ${y - size}`}
      fill="none"
      stroke={STROKE}
      strokeWidth={1.5}
    />
  );
}

function RightTriangle({
  base,
  height,
  hypotenuse,
  angle,
  topAngle,
  solveFor,
}: {
  base?: string;
  height?: string;
  hypotenuse?: string;
  angle?: string;
  topAngle?: string;
  solveFor?: "base" | "height" | "hypotenuse" | "angle";
}) {
  const BL = [40, 165];
  const BR = [215, 165];
  const T = [215, 40];
  return (
    <>
      <polygon points={`${BL.join(",")} ${BR.join(",")} ${T.join(",")}`} fill={FILL} stroke={STROKE} strokeWidth={2} />
      <RightAngleMark x={BR[0]} y={BR[1]} />
      {base !== undefined && (
        <Label x={(BL[0] + BR[0]) / 2} y={185} text={base} hilite={solveFor === "base"} />
      )}
      {height !== undefined && (
        <Label x={232} y={(BR[1] + T[1]) / 2 + 5} text={height} hilite={solveFor === "height"} anchor="start" />
      )}
      {hypotenuse !== undefined && (
        <Label x={100} y={92} text={hypotenuse} hilite={solveFor === "hypotenuse"} anchor="end" />
      )}
      {angle !== undefined && (
        <>
          <path d="M 68 165 A 28 28 0 0 0 40 143" fill="none" stroke={STROKE} strokeWidth={1.5} />
          <Label x={70} y={150} text={angle} hilite={solveFor === "angle"} size={13} />
        </>
      )}
      {topAngle !== undefined && (
        <>
          <path d="M 215 65 A 25 25 0 0 1 195 40" fill="none" stroke={STROKE} strokeWidth={1.5} />
          <Label x={195} y={62} text={topAngle} size={12} anchor="end" />
        </>
      )}
    </>
  );
}

function IsoscelesAltitude({
  equalSide,
  base,
  halfBase,
  altitude,
  solveFor,
}: {
  equalSide: string;
  base?: string;
  halfBase?: string;
  altitude?: string;
  solveFor?: "altitude" | "equalSide" | "halfBase";
}) {
  const A = [130, 30];
  const BL = [30, 170];
  const BR = [230, 170];
  const F = [130, 170];
  return (
    <>
      <polygon points={`${A.join(",")} ${BL.join(",")} ${BR.join(",")}`} fill={FILL} stroke={STROKE} strokeWidth={2} />
      <line x1={A[0]} y1={A[1]} x2={F[0]} y2={F[1]} stroke={STROKE} strokeWidth={1.5} strokeDasharray="4 3" />
      <RightAngleMark x={F[0]} y={F[1]} size={10} />
      <Label x={62} y={95} text={equalSide} hilite={solveFor === "equalSide"} anchor="end" />
      <Label x={198} y={95} text={equalSide} muted anchor="start" />
      {halfBase !== undefined ? (
        <>
          <Label x={80} y={188} text={halfBase} hilite={solveFor === "halfBase"} />
          <Label x={180} y={188} text={halfBase} muted />
        </>
      ) : (
        base !== undefined && <Label x={130} y={188} text={base} />
      )}
      {altitude !== undefined && (
        <Label x={140} y={100} text={altitude} hilite={solveFor === "altitude"} anchor="start" />
      )}
    </>
  );
}

function TriangleAngles({
  angleA,
  angleB,
  angleC,
  exterior,
  chained,
}: {
  angleA?: string;
  angleB?: string;
  angleC?: string;
  exterior?: { at: "A" | "B" | "C"; label: string };
  chained?: { angleB: string; angleBAC: string; angleD: string; angleDAC: string };
}) {
  if (chained) {
    const B = [30, 170];
    const C = [140, 170];
    const D = [230, 170];
    const A = [140, 30];
    return (
      <>
        <line x1={B[0]} y1={B[1]} x2={D[0]} y2={D[1]} stroke={STROKE} strokeWidth={2} />
        <polygon points={`${A.join(",")} ${B.join(",")} ${C.join(",")}`} fill={FILL} stroke={STROKE} strokeWidth={2} />
        <polygon points={`${A.join(",")} ${C.join(",")} ${D.join(",")}`} fill="#f6e8db" stroke={STROKE} strokeWidth={2} />
        <line x1={C[0]} y1={C[1] - 5} x2={C[0]} y2={C[1] + 5} stroke={STROKE} strokeWidth={1.5} />
        <Label x={62} y={155} text={chained.angleB} />
        <Label x={112} y={58} text={chained.angleBAC} size={13} />
        <Label x={168} y={58} text={chained.angleDAC} hilite size={13} />
        <Label x={205} y={155} text={chained.angleD} />
      </>
    );
  }

  const A = [130, 30];
  const B = [30, 170];
  const C = [230, 170];
  const extPoint: [number, number] = [278, 170];
  return (
    <>
      {exterior && (
        <line x1={C[0]} y1={C[1]} x2={extPoint[0]} y2={extPoint[1]} stroke={STROKE} strokeWidth={1.5} strokeDasharray="4 3" />
      )}
      <polygon points={`${A.join(",")} ${B.join(",")} ${C.join(",")}`} fill={FILL} stroke={STROKE} strokeWidth={2} />
      {angleA !== undefined && <Label x={130} y={52} text={angleA} size={13} />}
      {angleB !== undefined && <Label x={62} y={155} text={angleB} size={13} />}
      {angleC !== undefined && <Label x={195} y={155} text={angleC} size={13} />}
      {exterior && <Label x={255} y={150} text={exterior.label} hilite size={13} />}
    </>
  );
}

function SimilarTriangles({
  leftLabels,
  leftSides,
  rightLabels,
  rightSides,
}: {
  leftLabels: [string, string, string];
  leftSides: [string, string, string];
  rightLabels: [string, string, string];
  rightSides: [string, string, string];
}) {
  const a1: [number, number] = [15, 160];
  const b1: [number, number] = [105, 160];
  const c1: [number, number] = [62, 65];
  const d1: [number, number] = [150, 178];
  const e1: [number, number] = [255, 178];
  const f1: [number, number] = [202, 42];
  return (
    <>
      <polygon points={`${a1.join(",")} ${b1.join(",")} ${c1.join(",")}`} fill={FILL} stroke={STROKE} strokeWidth={2} />
      <polygon points={`${d1.join(",")} ${e1.join(",")} ${f1.join(",")}`} fill={FILL} stroke={STROKE} strokeWidth={2} />
      <Label x={a1[0] - 6} y={a1[1] + 4} text={leftLabels[0]} muted size={12} anchor="end" />
      <Label x={b1[0] + 6} y={b1[1] + 4} text={leftLabels[1]} muted size={12} anchor="start" />
      <Label x={c1[0]} y={c1[1] - 8} text={leftLabels[2]} muted size={12} />
      <Label x={(a1[0] + b1[0]) / 2} y={178} text={leftSides[0]} size={12} />
      <Label x={(b1[0] + c1[0]) / 2 + 18} y={(b1[1] + c1[1]) / 2} text={leftSides[1]} size={12} anchor="start" />
      <Label x={(c1[0] + a1[0]) / 2 - 18} y={(c1[1] + a1[1]) / 2} text={leftSides[2]} size={12} anchor="end" />
      <Label x={d1[0] - 6} y={d1[1] + 4} text={rightLabels[0]} muted size={12} anchor="end" />
      <Label x={e1[0] + 6} y={e1[1] + 4} text={rightLabels[1]} muted size={12} anchor="start" />
      <Label x={f1[0]} y={f1[1] - 8} text={rightLabels[2]} muted size={12} />
      <Label x={(d1[0] + e1[0]) / 2} y={196} text={rightSides[0]} size={12} />
      <Label x={(e1[0] + f1[0]) / 2 + 18} y={(e1[1] + f1[1]) / 2} text={rightSides[1]} size={12} anchor="start" />
      <Label x={(f1[0] + d1[0]) / 2 - 12} y={(f1[1] + d1[1]) / 2} text={rightSides[2]} size={12} anchor="end" />
    </>
  );
}

const TRANSVERSAL_POS: Record<TransversalPosition, [number, number]> = {
  1: [65, 41],
  2: [113, 41],
  3: [65, 75],
  4: [113, 75],
  5: [135, 141],
  6: [183, 141],
  7: [135, 175],
  8: [183, 175],
};

function ParallelTransversal({
  givenLabel,
  givenPosition,
  askedLabel,
  askedPosition,
  extraLabel,
  extraPosition,
}: {
  givenLabel: string;
  givenPosition: TransversalPosition;
  askedLabel: string;
  askedPosition: TransversalPosition;
  extraLabel?: string;
  extraPosition?: TransversalPosition;
}) {
  const [gx, gy] = TRANSVERSAL_POS[givenPosition];
  const [ax, ay] = TRANSVERSAL_POS[askedPosition];
  return (
    <>
      <line x1={10} y1={55} x2={250} y2={55} stroke={STROKE} strokeWidth={2} />
      <line x1={10} y1={155} x2={250} y2={155} stroke={STROKE} strokeWidth={2} />
      <ParallelTick x={16} y={55} />
      <ParallelTick x={16} y={155} />
      <line x1={70} y1={20} x2={190} y2={190} stroke={STROKE} strokeWidth={2} />
      <Label x={gx} y={gy} text={givenLabel} size={13} />
      <Label x={ax} y={ay} text={askedLabel} hilite size={13} />
      {extraLabel !== undefined && extraPosition !== undefined && (
        <Label x={TRANSVERSAL_POS[extraPosition][0]} y={TRANSVERSAL_POS[extraPosition][1]} text={extraLabel} muted size={12} />
      )}
    </>
  );
}

function BentPath({ angle1, angle2, unknown }: { angle1: string; angle2: string; unknown: string }) {
  const Tp: [number, number] = [80, 40];
  const Bnd: [number, number] = [140, 105];
  const Bp: [number, number] = [190, 170];
  return (
    <>
      <line x1={10} y1={40} x2={250} y2={40} stroke={STROKE} strokeWidth={2} />
      <line x1={10} y1={170} x2={250} y2={170} stroke={STROKE} strokeWidth={2} />
      <ParallelTick x={16} y={40} />
      <ParallelTick x={16} y={170} />
      <line x1={Tp[0]} y1={Tp[1]} x2={Bnd[0]} y2={Bnd[1]} stroke={STROKE} strokeWidth={2} />
      <line x1={Bnd[0]} y1={Bnd[1]} x2={Bp[0]} y2={Bp[1]} stroke={STROKE} strokeWidth={2} />
      <Label x={95} y={60} text={angle1} size={13} />
      <Label x={150} y={100} text={unknown} hilite size={13} />
      <Label x={172} y={152} text={angle2} size={13} />
    </>
  );
}

const CROSS4: [number, number][] = [
  [130, 55],
  [190, 105],
  [130, 165],
  [70, 105],
];
const CROSS6: [number, number][] = [
  [130, 50],
  [195, 75],
  [195, 140],
  [130, 165],
  [65, 140],
  [65, 75],
];

function IntersectingLines({
  lines,
  angles,
}: {
  lines: 2 | 3;
  angles: { label: string; position: number; muted?: boolean }[];
}) {
  const positions = lines === 2 ? CROSS4 : CROSS6;
  return (
    <>
      <line x1={30} y1={60} x2={230} y2={150} stroke={STROKE} strokeWidth={2} />
      <line x1={230} y1={60} x2={30} y2={150} stroke={STROKE} strokeWidth={2} />
      {lines === 3 && <line x1={130} y1={20} x2={130} y2={190} stroke={STROKE} strokeWidth={2} />}
      {angles.map((a, i) => {
        const [x, y] = positions[a.position % positions.length];
        return <Label key={i} x={x} y={y} text={a.label} hilite={!a.muted && i === angles.length - 1} muted={a.muted} size={13} />;
      })}
    </>
  );
}

function CircleBasic({
  radiusLabel,
  centralAngleLabel,
  arcLabel,
  tangent,
  chordTriangle,
}: {
  radiusLabel?: string;
  centralAngleLabel?: string;
  arcLabel?: string;
  tangent?: { radius: string; tangentSeg: string; hyp: string };
  chordTriangle?: { radius: string; angle: string; chord: string };
}) {
  const O: [number, number] = [125, 108];
  const r = 62;
  if (tangent) {
    const Tpt: [number, number] = [O[0] + r, O[1]];
    const Ext: [number, number] = [O[0] + r, O[1] - 70];
    return (
      <>
        <circle cx={O[0]} cy={O[1]} r={r} fill={FILL} stroke={STROKE} strokeWidth={2} />
        <line x1={O[0]} y1={O[1]} x2={Tpt[0]} y2={Tpt[1]} stroke={STROKE} strokeWidth={2} />
        <line x1={Tpt[0]} y1={Tpt[1]} x2={Ext[0]} y2={Ext[1]} stroke={STROKE} strokeWidth={2} />
        <line x1={O[0]} y1={O[1]} x2={Ext[0]} y2={Ext[1]} stroke={STROKE} strokeWidth={2} strokeDasharray="4 3" />
        <RightAngleMark x={Tpt[0]} y={Tpt[1]} size={10} />
        <Label x={(O[0] + Tpt[0]) / 2} y={O[1] + 16} text={tangent.radius} size={13} />
        <Label x={Tpt[0] + 12} y={(Tpt[1] + Ext[1]) / 2} text={tangent.tangentSeg} size={13} anchor="start" />
        <Label x={(O[0] + Ext[0]) / 2 - 10} y={(O[1] + Ext[1]) / 2} text={tangent.hyp} hilite size={13} anchor="end" />
      </>
    );
  }
  if (chordTriangle) {
    const p1: [number, number] = [O[0] + r * Math.cos((200 * Math.PI) / 180), O[1] - r * Math.sin((200 * Math.PI) / 180)];
    const p2: [number, number] = [O[0] + r * Math.cos((340 * Math.PI) / 180), O[1] - r * Math.sin((340 * Math.PI) / 180)];
    return (
      <>
        <circle cx={O[0]} cy={O[1]} r={r} fill={FILL} stroke={STROKE} strokeWidth={2} />
        <line x1={O[0]} y1={O[1]} x2={p1[0]} y2={p1[1]} stroke={STROKE} strokeWidth={2} />
        <line x1={O[0]} y1={O[1]} x2={p2[0]} y2={p2[1]} stroke={STROKE} strokeWidth={2} />
        <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke={STROKE} strokeWidth={2} />
        <Label x={O[0] - 20} y={O[1] - 4} text={chordTriangle.radius} size={12} anchor="end" />
        <Label x={O[0]} y={O[1] + 30} text={chordTriangle.angle} size={13} />
        <Label x={(p1[0] + p2[0]) / 2} y={(p1[1] + p2[1]) / 2 + 22} text={chordTriangle.chord} hilite size={13} />
      </>
    );
  }
  return (
    <>
      <circle cx={O[0]} cy={O[1]} r={r} fill={FILL} stroke={STROKE} strokeWidth={2} />
      {centralAngleLabel !== undefined ? (
        <>
          <line x1={O[0]} y1={O[1]} x2={O[0]} y2={O[1] - r} stroke={STROKE} strokeWidth={2} />
          <line
            x1={O[0]}
            y1={O[1]}
            x2={O[0] + r * Math.cos((225 * Math.PI) / 180)}
            y2={O[1] - r * Math.sin((225 * Math.PI) / 180)}
            stroke={STROKE}
            strokeWidth={2}
          />
          <path
            d={`M ${O[0]} ${O[1] - r} A ${r} ${r} 0 0 0 ${O[0] + r * Math.cos((225 * Math.PI) / 180)} ${
              O[1] - r * Math.sin((225 * Math.PI) / 180)
            }`}
            fill="#f6e0c9"
            opacity={0.7}
          />
          <Label x={O[0] - 22} y={O[1] - 18} text={centralAngleLabel} size={13} />
          {arcLabel !== undefined && <Label x={O[0] - 55} y={O[1] - 50} text={arcLabel} hilite size={13} />}
        </>
      ) : (
        radiusLabel !== undefined && (
          <>
            <line x1={O[0]} y1={O[1]} x2={O[0] + r} y2={O[1]} stroke={STROKE} strokeWidth={2} />
            <Label x={O[0] + r / 2} y={O[1] - 8} text={radiusLabel} size={13} />
          </>
        )
      )}
    </>
  );
}

function CircleCoordinate({
  h,
  k,
  r,
  verticalLineAtX,
  markPoints,
  singlePoint,
  noIntersect,
}: {
  h: number;
  k: number;
  r: number;
  verticalLineAtX?: number;
  markPoints?: boolean;
  singlePoint?: boolean;
  noIntersect?: boolean;
}) {
  const O: [number, number] = [140, 105];
  const rad = 60;
  const hasLine = verticalLineAtX !== undefined;
  const lineX = noIntersect ? O[0] + rad + 30 : singlePoint ? O[0] + rad : O[0] + rad * 0.5;
  const dy = noIntersect
    ? 0
    : Math.sqrt(Math.max(0, rad * rad - (lineX - O[0]) * (lineX - O[0])));
  return (
    <>
      <line x1={30} y1={175} x2={230} y2={175} stroke={MUTED} strokeWidth={1.5} />
      <line x1={45} y1={190} x2={45} y2={20} stroke={MUTED} strokeWidth={1.5} />
      <Label x={220} y={190} text="x" muted size={12} />
      <Label x={35} y={28} text="y" muted size={12} />
      <circle cx={O[0]} cy={O[1]} r={rad} fill={FILL} stroke={STROKE} strokeWidth={2} />
      <circle cx={O[0]} cy={O[1]} r={2.5} fill={STROKE} />
      <Label x={O[0]} y={O[1] - 8} text={`(${h}, ${k})`} size={12} />
      <line x1={O[0]} y1={O[1]} x2={O[0] + rad} y2={O[1]} stroke={STROKE} strokeWidth={1.5} strokeDasharray="3 2" />
      <Label x={O[0] + rad / 2} y={O[1] + 16} text={`r = ${r}`} size={12} />
      {hasLine && (
        <>
          <line
            x1={lineX}
            y1={noIntersect ? O[1] - 45 : O[1] - dy - 10}
            x2={lineX}
            y2={noIntersect ? O[1] + 45 : O[1] + dy + 10}
            stroke={HILITE}
            strokeWidth={2}
            strokeDasharray="4 3"
          />
          <Label x={lineX} y={205} text={`x = ${verticalLineAtX}`} hilite size={12} />
          {markPoints && !singlePoint && !noIntersect && (
            <>
              <circle cx={lineX} cy={O[1] - dy} r={3} fill={HILITE} />
              <circle cx={lineX} cy={O[1] + dy} r={3} fill={HILITE} />
            </>
          )}
          {singlePoint && <circle cx={lineX} cy={O[1]} r={3} fill={HILITE} />}
        </>
      )}
    </>
  );
}

function Sector({
  radiusLabel,
  angleLabel,
  angleDegrees,
  askFor,
}: {
  radiusLabel?: string;
  angleLabel: string;
  angleDegrees: number;
  askFor: "area" | "arcLength" | "angle";
}) {
  const O: [number, number] = [125, 120];
  const r = 65;
  const display = Math.min(300, Math.max(20, angleDegrees));
  const startDeg = -90;
  const endDeg = startDeg + display;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const p1: [number, number] = [O[0] + r * Math.cos(toRad(startDeg)), O[1] + r * Math.sin(toRad(startDeg))];
  const p2: [number, number] = [O[0] + r * Math.cos(toRad(endDeg)), O[1] + r * Math.sin(toRad(endDeg))];
  const largeArc = display > 180 ? 1 : 0;
  return (
    <>
      <circle cx={O[0]} cy={O[1]} r={r} fill="none" stroke={MUTED} strokeWidth={1.5} strokeDasharray="3 3" />
      <path
        d={`M ${O[0]} ${O[1]} L ${p1[0]} ${p1[1]} A ${r} ${r} 0 ${largeArc} 1 ${p2[0]} ${p2[1]} Z`}
        fill={askFor === "arcLength" ? "none" : "#f6e0c9"}
        stroke={STROKE}
        strokeWidth={askFor === "arcLength" ? 1.5 : 2}
      />
      {askFor === "arcLength" && (
        <path
          d={`M ${p1[0]} ${p1[1]} A ${r} ${r} 0 ${largeArc} 1 ${p2[0]} ${p2[1]}`}
          fill="none"
          stroke={HILITE}
          strokeWidth={3}
        />
      )}
      {radiusLabel !== undefined && <Label x={(O[0] + p1[0]) / 2 - 10} y={(O[1] + p1[1]) / 2} text={radiusLabel} size={12} anchor="end" />}
      <Label x={O[0] + 14} y={O[1] - 14} text={angleLabel} hilite={askFor === "angle"} size={13} />
    </>
  );
}

function UnitCircleAngle({ rawLabel, angleDegrees }: { rawLabel: string; angleDegrees: number }) {
  const O: [number, number] = [130, 108];
  const r = 68;
  const norm = ((angleDegrees % 360) + 360) % 360;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const end: [number, number] = [O[0] + r * Math.cos(toRad(norm)), O[1] - r * Math.sin(toRad(norm))];
  const largeArc = norm > 180 ? 1 : 0;
  const sweep = 0;
  const arcEndSmall: [number, number] = [O[0] + 26 * Math.cos(toRad(norm)), O[1] - 26 * Math.sin(toRad(norm))];
  return (
    <>
      <circle cx={O[0]} cy={O[1]} r={r} fill="none" stroke={MUTED} strokeWidth={1.5} />
      <line x1={O[0] - r - 10} y1={O[1]} x2={O[0] + r + 10} y2={O[1]} stroke={MUTED} strokeWidth={1.5} />
      <line x1={O[0]} y1={O[1] - r - 10} x2={O[0]} y2={O[1] + r + 10} stroke={MUTED} strokeWidth={1.5} />
      <path d={`M ${O[0] + 26} ${O[1]} A 26 26 0 ${largeArc} ${sweep} ${arcEndSmall[0]} ${arcEndSmall[1]}`} fill="none" stroke={HILITE} strokeWidth={2} />
      <line x1={O[0]} y1={O[1]} x2={end[0]} y2={end[1]} stroke={HILITE} strokeWidth={2.5} />
      <circle cx={end[0]} cy={end[1]} r={3} fill={HILITE} />
      <Label x={end[0] + (end[0] > O[0] ? 10 : -10)} y={end[1] + (end[1] > O[1] ? 14 : -8)} text={rawLabel} hilite size={13} anchor={end[0] > O[0] ? "start" : "end"} />
    </>
  );
}

function Solid({ shape, labels }: { shape: string; labels: Record<string, string> }) {
  if (shape === "cylinder" || shape === "cylinderHemisphere") {
    const topY = shape === "cylinderHemisphere" ? 90 : 55;
    const botY = 165;
    return (
      <>
        <line x1={65} y1={topY} x2={65} y2={botY} stroke={STROKE} strokeWidth={2} />
        <line x1={195} y1={topY} x2={195} y2={botY} stroke={STROKE} strokeWidth={2} />
        <path d={`M 65 ${botY} A 65 16 0 0 0 195 ${botY}`} fill="none" stroke={STROKE} strokeWidth={2} />
        <path d={`M 65 ${botY} A 65 16 0 0 1 195 ${botY}`} fill="none" stroke={STROKE} strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
        {shape === "cylinderHemisphere" ? (
          <path d={`M 65 ${topY} A 65 55 0 0 1 195 ${topY}`} fill={FILL} stroke={STROKE} strokeWidth={2} />
        ) : (
          <ellipse cx={130} cy={topY} rx={65} ry={16} fill={FILL} stroke={STROKE} strokeWidth={2} />
        )}
        <line x1={130} y1={topY} x2={195} y2={topY} stroke={STROKE} strokeWidth={1.5} />
        <Label x={162} y={topY - 6} text={labels.r ?? ""} size={12} />
        <Label x={210} y={(topY + botY) / 2} text={labels.h ?? ""} size={13} anchor="start" />
      </>
    );
  }
  if (shape === "hollowCylinder") {
    return (
      <>
        <line x1={55} y1={65} x2={55} y2={165} stroke={STROKE} strokeWidth={2} />
        <line x1={205} y1={65} x2={205} y2={165} stroke={STROKE} strokeWidth={2} />
        <path d="M 55 165 A 75 16 0 0 0 205 165" fill="none" stroke={STROKE} strokeWidth={2} />
        <ellipse cx={130} cy={65} rx={75} ry={16} fill={FILL} stroke={STROKE} strokeWidth={2} />
        <ellipse cx={130} cy={65} rx={40} ry={9} fill="white" stroke={STROKE} strokeWidth={1.5} />
        <Label x={168} y={58} text={labels.outerR ?? ""} size={11} />
        <Label x={130} y={68} text={labels.innerR ?? ""} size={11} />
        <Label x={222} y={115} text={labels.len ?? ""} size={13} anchor="start" />
      </>
    );
  }
  if (shape === "cone") {
    return (
      <>
        <ellipse cx={130} cy={165} rx={60} ry={16} fill={FILL} stroke={STROKE} strokeWidth={2} />
        <line x1={130} y1={40} x2={70} y2={165} stroke={STROKE} strokeWidth={2} />
        <line x1={130} y1={40} x2={190} y2={165} stroke={STROKE} strokeWidth={2} />
        <line x1={130} y1={40} x2={130} y2={165} stroke={STROKE} strokeWidth={1.5} strokeDasharray="4 3" />
        <line x1={130} y1={165} x2={190} y2={165} stroke={STROKE} strokeWidth={1.5} />
        <Label x={160} y={178} text={labels.r ?? ""} size={12} />
        <Label x={142} y={105} text={labels.h ?? ""} size={13} anchor="start" />
      </>
    );
  }
  if (shape === "sphere") {
    return (
      <>
        <circle cx={130} cy={110} r={65} fill={FILL} stroke={STROKE} strokeWidth={2} />
        <ellipse cx={130} cy={110} rx={65} ry={18} fill="none" stroke={STROKE} strokeWidth={1.2} strokeDasharray="3 2" opacity={0.6} />
        <line x1={130} y1={110} x2={195} y2={110} stroke={STROKE} strokeWidth={1.5} />
        <Label x={162} y={102} text={labels.r ?? ""} size={13} />
      </>
    );
  }
  // box
  return (
    <>
      <polygon points="60,80 180,80 180,180 60,180" fill={FILL} stroke={STROKE} strokeWidth={2} />
      <polygon points="60,80 100,50 220,50 180,80" fill="#f6e8db" stroke={STROKE} strokeWidth={2} />
      <polygon points="180,80 220,50 220,150 180,180" fill="#f0ddc4" stroke={STROKE} strokeWidth={2} />
      <Label x={120} y={198} text={labels.l ?? ""} size={13} />
      <Label x={228} y={100} text={labels.w ?? ""} size={12} anchor="start" />
      <Label x={45} y={135} text={labels.h ?? ""} size={13} anchor="end" />
    </>
  );
}

function ScaleCompare({ shape, factorLabel }: { shape: "square" | "cube" | "circle"; factorLabel: string }) {
  return (
    <>
      {shape === "circle" ? (
        <>
          <circle cx={38} cy={158} r={18} fill={FILL} stroke={STROKE} strokeWidth={2} />
          <circle cx={195} cy={118} r={50} fill={FILL} stroke={STROKE} strokeWidth={2} />
        </>
      ) : shape === "square" ? (
        <>
          <rect x={20} y={140} width={35} height={35} fill={FILL} stroke={STROKE} strokeWidth={2} />
          <rect x={150} y={70} width={95} height={95} fill={FILL} stroke={STROKE} strokeWidth={2} />
        </>
      ) : (
        <>
          <polygon points="15,155 45,155 45,185 15,185" fill={FILL} stroke={STROKE} strokeWidth={2} />
          <polygon points="15,155 27,143 57,143 45,155" fill="#f6e8db" stroke={STROKE} strokeWidth={2} />
          <polygon points="45,155 57,143 57,173 45,185" fill="#f0ddc4" stroke={STROKE} strokeWidth={2} />
          <polygon points="150,110 235,110 235,195 150,195" fill={FILL} stroke={STROKE} strokeWidth={2} />
          <polygon points="150,110 178,82 263,82 235,110" fill="#f6e8db" stroke={STROKE} strokeWidth={2} />
          <polygon points="235,110 263,82 263,167 235,195" fill="#f0ddc4" stroke={STROKE} strokeWidth={2} />
        </>
      )}
      <path d="M 65 165 L 130 165" stroke={HILITE} strokeWidth={2} markerEnd="url(#arrow)" />
      <Label x={98} y={155} text={`× ${factorLabel}`} hilite size={14} />
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={HILITE} />
        </marker>
      </defs>
    </>
  );
}

export function GeometryDiagram({ spec }: { spec: DiagramSpec }) {
  return (
    <div className="my-3 rounded-lg border border-[#f0d0b3] bg-[#fef8f2] p-3 flex flex-col items-center">
      <svg viewBox="0 0 280 210" className="w-full max-w-[280px] h-auto">
        {spec.kind === "rightTriangle" && <RightTriangle {...spec} />}
        {spec.kind === "isoscelesAltitude" && <IsoscelesAltitude {...spec} />}
        {spec.kind === "triangleAngles" && <TriangleAngles {...spec} />}
        {spec.kind === "similarTriangles" && <SimilarTriangles {...spec} />}
        {spec.kind === "parallelTransversal" && <ParallelTransversal {...spec} />}
        {spec.kind === "bentPath" && <BentPath {...spec} />}
        {spec.kind === "intersectingLines" && <IntersectingLines {...spec} />}
        {spec.kind === "circleBasic" && <CircleBasic {...spec} />}
        {spec.kind === "circleCoordinate" && <CircleCoordinate {...spec} />}
        {spec.kind === "sector" && <Sector {...spec} />}
        {spec.kind === "unitCircleAngle" && <UnitCircleAngle {...spec} />}
        {spec.kind === "solid" && <Solid {...spec} />}
        {spec.kind === "scaleCompare" && <ScaleCompare {...spec} />}
      </svg>
      <div className="text-[10px] text-gray-400 mt-1">Figure not drawn to scale.</div>
    </div>
  );
}
