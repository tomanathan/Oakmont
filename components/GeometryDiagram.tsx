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
  // A halo behind the glyphs (same tone as the card/shape fill) keeps a
  // label legible even when it sits on or near a line -- the line gets
  // masked out under the number instead of visibly cutting through it.
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fill={hilite ? HILITE : muted ? MUTED : STROKE}
      fontWeight={hilite ? 700 : 500}
      fontFamily="inherit"
      stroke={FILL}
      strokeWidth={4}
      strokeLinejoin="round"
      paintOrder="stroke"
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

// Reads the real number a label is standing for, so a shape can be drawn to
// actually match the problem instead of a fixed stand-in. Anything with a
// variable in it ("3x°", "K+20°", "θ") is genuinely indeterminate and
// returns null; the caller falls back to a reasonable default angle/ratio
// in that case. Handles plain numbers, "a/b" fractions, and simple radical
// terms like "7√2" or "-3-√5" (the forms this app's content actually uses).
function parseNumeric(raw?: string): number | null {
  if (raw === undefined) return null;
  let s = raw.trim();
  if (s === "" || s === "?") return null;
  if (/[a-zA-Zθπ]/.test(s)) return null;
  s = s.replace(/°/g, "").replace(/\s+/g, "");
  const fracMatch = s.match(/^(-?[\d.]+)\/(-?[\d.]+)$/);
  if (fracMatch) {
    const denom = parseFloat(fracMatch[2]);
    return denom === 0 ? null : parseFloat(fracMatch[1]) / denom;
  }
  const withRadicalsResolved = s.replace(/(-?\d*\.?\d*)√(\d+(\.\d+)?)/g, (_, coefStr, nStr) => {
    const coef = coefStr === "" ? 1 : coefStr === "-" ? -1 : parseFloat(coefStr);
    return String(coef * Math.sqrt(parseFloat(nStr)));
  });
  if (!/^[\d.+-]+$/.test(withRadicalsResolved)) return null;
  const terms = withRadicalsResolved.match(/[+-]?\d+(\.\d+)?/g);
  if (!terms || terms.length === 0) return null;
  const value = terms.reduce((sum, t) => sum + parseFloat(t), 0);
  return Number.isFinite(value) ? value : null;
}

const DEG = Math.PI / 180;

// Where two rays -- each starting at a point and heading off at a compass
// angle in degrees (0 = pointing right (+x), measured clockwise since SVG's
// y-axis points down) -- actually cross. Used to construct a triangle from
// two base vertices and their real interior angles, the same way you'd rule
// it out with a protractor on paper.
function rayIntersection(
  p1: [number, number],
  deg1: number,
  p2: [number, number],
  deg2: number
): [number, number] {
  const d1 = [Math.cos(deg1 * DEG), Math.sin(deg1 * DEG)];
  const d2 = [Math.cos(deg2 * DEG), Math.sin(deg2 * DEG)];
  const denom = d1[0] * d2[1] - d1[1] * d2[0];
  if (Math.abs(denom) < 1e-9) return [(p1[0] + p2[0]) / 2, Math.min(p1[1], p2[1]) - 60];
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const t = (dx * d2[1] - dy * d2[0]) / denom;
  return [p1[0] + d1[0] * t, p1[1] + d1[1] * t];
}

// Keeps a computed angle inside a legible range -- a real 2deg or 89deg
// triangle would be too sliver-thin to read as a diagram, so the drawing
// clamps while the labels still show the real numbers.
function clampAngle(deg: number, min = 12, max = 78): number {
  return Math.min(max, Math.max(min, deg));
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
  // Figure out the triangle's real shape from whatever's actually given --
  // two sides pin down the true angle exactly; failing that, a stated angle
  // is used directly; only when NONE of that is available (fully symbolic,
  // e.g. both legs unlabeled) does it fall back to a generic angle.
  const baseVal = parseNumeric(base);
  const heightVal = parseNumeric(height);
  const hypVal = parseNumeric(hypotenuse);
  const angleVal = parseNumeric(angle);

  let angleDeg: number;
  if (baseVal !== null && heightVal !== null) {
    angleDeg = Math.atan2(heightVal, baseVal) / DEG;
  } else if (baseVal !== null && hypVal !== null && hypVal > 0) {
    angleDeg = Math.acos(Math.min(1, Math.max(-1, baseVal / hypVal))) / DEG;
  } else if (heightVal !== null && hypVal !== null && hypVal > 0) {
    angleDeg = Math.asin(Math.min(1, Math.max(-1, heightVal / hypVal))) / DEG;
  } else if (angleVal !== null) {
    angleDeg = angleVal;
  } else {
    angleDeg = 40;
  }
  angleDeg = clampAngle(angleDeg);
  const angleRad = angleDeg * DEG;

  const maxW = 175;
  const maxH = 125;
  let w = maxW;
  let h = maxW * Math.tan(angleRad);
  if (h > maxH) {
    h = maxH;
    w = maxH / Math.tan(angleRad);
  }

  const BL: [number, number] = [40, 165];
  const BR: [number, number] = [40 + w, 165];
  const T: [number, number] = [40 + w, 165 - h];

  return (
    <>
      <polygon points={`${BL.join(",")} ${BR.join(",")} ${T.join(",")}`} fill={FILL} stroke={STROKE} strokeWidth={2} />
      <RightAngleMark x={BR[0]} y={BR[1]} />
      {base !== undefined && (
        <Label x={(BL[0] + BR[0]) / 2} y={185} text={base} hilite={solveFor === "base"} />
      )}
      {height !== undefined && (
        <Label x={BR[0] + 17} y={(BR[1] + T[1]) / 2 + 5} text={height} hilite={solveFor === "height"} anchor="start" />
      )}
      {hypotenuse !== undefined && (
        <Label
          x={(BL[0] + T[0]) / 2 - 12}
          y={(BL[1] + T[1]) / 2 - 4}
          text={hypotenuse}
          hilite={solveFor === "hypotenuse"}
          anchor="end"
        />
      )}
      {angle !== undefined && (
        <>
          <path
            d={`M ${BL[0] + 28} ${BL[1]} A 28 28 0 0 0 ${BL[0] + 28 * Math.cos(angleRad)} ${
              BL[1] - 28 * Math.sin(angleRad)
            }`}
            fill="none"
            stroke={STROKE}
            strokeWidth={1.5}
          />
          <Label
            x={BL[0] + 40 * Math.cos(angleRad / 2)}
            y={BL[1] - 40 * Math.sin(angleRad / 2)}
            text={angle}
            hilite={solveFor === "angle"}
            size={13}
          />
        </>
      )}
      {topAngle !== undefined && (
        <>
          <path
            d={`M ${T[0]} ${T[1] + 25} A 25 25 0 0 1 ${
              T[0] + 25 * Math.cos(Math.PI - angleRad)
            } ${T[1] + 25 * Math.sin(Math.PI - angleRad)}`}
            fill="none"
            stroke={STROKE}
            strokeWidth={1.5}
          />
          <Label
            x={T[0] + 36 * Math.cos((Math.PI - angleRad) / 2 + Math.PI / 4)}
            y={T[1] + 36 * Math.sin((Math.PI - angleRad) / 2 + Math.PI / 4)}
            text={topAngle}
            size={12}
            anchor="end"
          />
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
  const equalSideVal = parseNumeric(equalSide);
  const halfBaseVal = parseNumeric(halfBase) ?? (parseNumeric(base) !== null ? parseNumeric(base)! / 2 : null);
  const altitudeVal = parseNumeric(altitude);

  // Pin down the real half-base : altitude ratio from whichever two of the
  // three measurements are actually known (Pythagorean theorem covers the
  // classic "equal side + half base, altitude unknown" case), falling back
  // to a generic isosceles silhouette only when nothing numeric is given.
  let halfW: number;
  let h: number;
  if (halfBaseVal !== null && altitudeVal !== null) {
    halfW = halfBaseVal;
    h = altitudeVal;
  } else if (equalSideVal !== null && halfBaseVal !== null && equalSideVal > halfBaseVal) {
    halfW = halfBaseVal;
    h = Math.sqrt(equalSideVal * equalSideVal - halfBaseVal * halfBaseVal);
  } else if (equalSideVal !== null && altitudeVal !== null && equalSideVal > altitudeVal) {
    h = altitudeVal;
    halfW = Math.sqrt(equalSideVal * equalSideVal - altitudeVal * altitudeVal);
  } else {
    halfW = 1;
    h = 2.4;
  }
  const maxHalfW = 100;
  const maxH = 135;
  const scale = Math.min(maxHalfW / halfW, maxH / h);
  halfW *= scale;
  h *= scale;

  const A: [number, number] = [130, 170 - h];
  const BL: [number, number] = [130 - halfW, 170];
  const BR: [number, number] = [130 + halfW, 170];
  const F: [number, number] = [130, 170];
  return (
    <>
      <polygon points={`${A.join(",")} ${BL.join(",")} ${BR.join(",")}`} fill={FILL} stroke={STROKE} strokeWidth={2} />
      <line x1={A[0]} y1={A[1]} x2={F[0]} y2={F[1]} stroke={STROKE} strokeWidth={1.5} strokeDasharray="4 3" />
      <RightAngleMark x={F[0]} y={F[1]} size={10} />
      <Label x={(A[0] + BL[0]) / 2 - 8} y={(A[1] + BL[1]) / 2} text={equalSide} hilite={solveFor === "equalSide"} anchor="end" />
      <Label x={(A[0] + BR[0]) / 2 + 8} y={(A[1] + BR[1]) / 2} text={equalSide} muted anchor="start" />
      {halfBase !== undefined ? (
        <>
          <Label x={(BL[0] + F[0]) / 2} y={188} text={halfBase} hilite={solveFor === "halfBase"} />
          <Label x={(F[0] + BR[0]) / 2} y={188} text={halfBase} muted />
        </>
      ) : (
        base !== undefined && <Label x={130} y={188} text={base} />
      )}
      {altitude !== undefined && (
        <Label x={F[0] + 10} y={(A[1] + F[1]) / 2} text={altitude} hilite={solveFor === "altitude"} anchor="start" />
      )}
    </>
  );
}

// Fills in whichever of a triangle's three angles aren't directly given
// (they sum to 180, so two knowns always pin down the third), then clamps
// and rescales the result so the drawn triangle never degenerates into an
// unreadable sliver even when the source data is sparse or symbolic.
function resolveTriangleAngles(
  aRaw: number | null,
  bRaw: number | null,
  cRaw: number | null
): [number, number, number] {
  let a = aRaw;
  let b = bRaw;
  let c = cRaw;
  if (a !== null && b !== null && c === null) c = 180 - a - b;
  else if (a !== null && c !== null && b === null) b = 180 - a - c;
  else if (b !== null && c !== null && a === null) a = 180 - b - c;
  else if (a === null || b === null || c === null) {
    const knownSum = (a ?? 0) + (b ?? 0) + (c ?? 0);
    const unknownCount = (a === null ? 1 : 0) + (b === null ? 1 : 0) + (c === null ? 1 : 0);
    const fill = unknownCount > 0 ? (180 - knownSum) / unknownCount : 0;
    a = a ?? fill;
    b = b ?? fill;
    c = c ?? fill;
  }
  const clamped = [a, b, c].map((v) => Math.max(15, Math.min(130, v!)));
  const sum = clamped[0] + clamped[1] + clamped[2];
  return clamped.map((v) => (v * 180) / sum) as [number, number, number];
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
    let b = parseNumeric(chained.angleB);
    let bac = parseNumeric(chained.angleBAC);
    let d = parseNumeric(chained.angleD);
    let dac = parseNumeric(chained.angleDAC);
    if (b !== null && d !== null) {
      const totalApex = 180 - b - d;
      if (bac !== null && dac === null) dac = totalApex - bac;
      else if (dac !== null && bac === null) bac = totalApex - dac;
      else if (bac === null && dac === null) {
        bac = totalApex / 2;
        dac = totalApex / 2;
      }
    } else {
      b = b ?? 60;
      d = d ?? 35;
      const totalApex = 180 - b - d;
      bac = bac ?? totalApex / 2;
      dac = dac ?? totalApex - (bac ?? 0);
    }
    b = clampAngle(b, 15, 130);
    d = clampAngle(d, 15, 130);

    // Steep base angles push the apex far above the base -- find the
    // natural height at full base width first, then shrink the base (and
    // with it the whole similar triangle) so the apex stays on-canvas
    // instead of being clipped above the viewBox.
    const A0 = rayIntersection([30, 170], -b, [230, 170], 180 + d);
    const naturalHeight = 170 - A0[1];
    const maxHeight = 145;
    const scale = naturalHeight > maxHeight ? maxHeight / naturalHeight : 1;
    const half = 100 * scale;
    const B: [number, number] = [130 - half, 170];
    const D: [number, number] = [130 + half, 170];
    const A = rayIntersection(B, -b, D, 180 + d);
    const thetaAB = Math.atan2(B[1] - A[1], B[0] - A[0]);
    const thetaAD = Math.atan2(D[1] - A[1], D[0] - A[0]);
    const apexFrac = bac! / Math.max(1, bac! + dac!);
    const thetaAC = thetaAB + (thetaAD - thetaAB) * apexFrac;
    const t = (170 - A[1]) / Math.sin(thetaAC);
    const C: [number, number] = [
      Math.min(D[0] - 15, Math.max(B[0] + 15, A[0] + t * Math.cos(thetaAC))),
      170,
    ];
    const bis1 = (thetaAB + thetaAC) / 2;
    const bis2 = (thetaAC + thetaAD) / 2;

    return (
      <>
        <line x1={B[0]} y1={B[1]} x2={D[0]} y2={D[1]} stroke={STROKE} strokeWidth={2} />
        <polygon points={`${A.join(",")} ${B.join(",")} ${C.join(",")}`} fill={FILL} stroke={STROKE} strokeWidth={2} />
        <polygon points={`${A.join(",")} ${C.join(",")} ${D.join(",")}`} fill="#f6e8db" stroke={STROKE} strokeWidth={2} />
        <line x1={C[0]} y1={C[1] - 5} x2={C[0]} y2={C[1] + 5} stroke={STROKE} strokeWidth={1.5} />
        <Label x={B[0] + 22} y={B[1] - 14} text={chained.angleB} />
        <Label x={A[0] + 34 * Math.cos(bis1)} y={A[1] + 34 * Math.sin(bis1)} text={chained.angleBAC} size={13} />
        <Label x={A[0] + 34 * Math.cos(bis2)} y={A[1] + 34 * Math.sin(bis2)} text={chained.angleDAC} hilite size={13} />
        <Label x={D[0] - 22} y={D[1] - 14} text={chained.angleD} />
      </>
    );
  }

  const exteriorVal = exterior ? parseNumeric(exterior.label) : null;
  let aRaw = parseNumeric(angleA);
  let bRaw = parseNumeric(angleB);
  let cRaw = parseNumeric(angleC);
  if (exteriorVal !== null) {
    const interior = 180 - exteriorVal;
    if (exterior!.at === "A" && aRaw === null) aRaw = interior;
    else if (exterior!.at === "B" && bRaw === null) bRaw = interior;
    else if (exterior!.at === "C" && cRaw === null) cRaw = interior;
  }
  const [, bDeg, cDeg] = resolveTriangleAngles(aRaw, bRaw, cRaw);

  // Same off-canvas-apex risk as the chained case above: shrink the base
  // (and the whole triangle with it) so steep angle pairs still fit.
  const A0 = rayIntersection([30, 170], -bDeg, [230, 170], 180 + cDeg);
  const naturalHeight = 170 - A0[1];
  const maxHeight = 145;
  const scale = naturalHeight > maxHeight ? maxHeight / naturalHeight : 1;
  const half = 100 * scale;
  const B: [number, number] = [130 - half, 170];
  const C: [number, number] = [130 + half, 170];
  const A = rayIntersection(B, -bDeg, C, 180 + cDeg);
  const extPoint: [number, number] = [C[0] + 45, C[1]];

  return (
    <>
      {exterior && (
        <line x1={C[0]} y1={C[1]} x2={extPoint[0]} y2={extPoint[1]} stroke={STROKE} strokeWidth={1.5} strokeDasharray="4 3" />
      )}
      <polygon points={`${A.join(",")} ${B.join(",")} ${C.join(",")}`} fill={FILL} stroke={STROKE} strokeWidth={2} />
      {angleA !== undefined && <Label x={A[0]} y={A[1] + 18} text={angleA} size={13} />}
      {angleB !== undefined && <Label x={B[0] + 22} y={B[1] - 14} text={angleB} size={13} />}
      {angleC !== undefined && <Label x={C[0] - 22} y={C[1] - 14} text={angleC} size={13} />}
      {exterior && <Label x={extPoint[0] - 5} y={extPoint[1] - 16} text={exterior.label} hilite size={13} />}
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

  // Draw the right-hand triangle at its real size relative to the left one
  // -- find the first side pair that's numeric on both sides and use that
  // as the scale factor, clamped so an extreme ratio still fits legibly in
  // the same fixed canvas as the reference triangle.
  let scale = 1;
  for (let i = 0; i < 3; i++) {
    const lv = parseNumeric(leftSides[i]);
    const rv = parseNumeric(rightSides[i]);
    if (lv !== null && rv !== null && lv !== 0) {
      scale = rv / lv;
      break;
    }
  }
  scale = Math.min(1.3, Math.max(0.35, scale));

  const d1: [number, number] = [150, 178];
  const e1: [number, number] = [d1[0] + (255 - 150) * scale, d1[1] + (178 - 178) * scale];
  const f1: [number, number] = [d1[0] + (202 - 150) * scale, d1[1] + (42 - 178) * scale];
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
  const O: [number, number] = [130, 105];
  const R = 100;

  // For two crossing lines, read whichever given angle is numeric and use
  // it as the real top-wedge angle -- vertical angles carry it straight
  // through unchanged, adjacent ones flip it via the supplementary rule --
  // then rotate the lines to actually match, instead of always drawing a
  // fixed symmetric X regardless of what the problem says.
  let topAngleDeg = 70;
  if (lines === 2) {
    for (const a of angles) {
      const v = parseNumeric(a.label);
      if (v === null) continue;
      const pos = a.position % 4;
      topAngleDeg = pos === 0 || pos === 2 ? v : 180 - v;
      break;
    }
  }
  const half = clampAngle(topAngleDeg, 20, 160) / 2;
  const dir1 = [Math.cos((-90 + half) * DEG), Math.sin((-90 + half) * DEG)];
  const dir2 = [Math.cos((-90 - half) * DEG), Math.sin((-90 - half) * DEG)];

  return (
    <>
      {lines === 2 ? (
        <>
          <line x1={O[0] + dir1[0] * R} y1={O[1] + dir1[1] * R} x2={O[0] - dir1[0] * R} y2={O[1] - dir1[1] * R} stroke={STROKE} strokeWidth={2} />
          <line x1={O[0] + dir2[0] * R} y1={O[1] + dir2[1] * R} x2={O[0] - dir2[0] * R} y2={O[1] - dir2[1] * R} stroke={STROKE} strokeWidth={2} />
        </>
      ) : (
        <>
          <line x1={30} y1={60} x2={230} y2={150} stroke={STROKE} strokeWidth={2} />
          <line x1={230} y1={60} x2={30} y2={150} stroke={STROKE} strokeWidth={2} />
          <line x1={130} y1={20} x2={130} y2={190} stroke={STROKE} strokeWidth={2} />
        </>
      )}
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
        <Label x={O[0]} y={O[1] + 16} text={chordTriangle.angle} size={13} />
        <Label x={(p1[0] + p2[0]) / 2} y={(p1[1] + p2[1]) / 2 + 24} text={chordTriangle.chord} hilite size={13} />
      </>
    );
  }
  return (
    <>
      <circle cx={O[0]} cy={O[1]} r={r} fill={FILL} stroke={STROKE} strokeWidth={2} />
      {centralAngleLabel !== undefined ? (
        (() => {
          const centralDeg = clampAngle(parseNumeric(centralAngleLabel) ?? 70, 20, 300);
          const endDeg = 90 + centralDeg;
          const endPt: [number, number] = [
            O[0] + r * Math.cos((endDeg * Math.PI) / 180),
            O[1] - r * Math.sin((endDeg * Math.PI) / 180),
          ];
          const largeArc = centralDeg > 180 ? 1 : 0;
          const midDeg = 90 + centralDeg / 2;
          const labelPt: [number, number] = [
            O[0] + (r * 0.4) * Math.cos((midDeg * Math.PI) / 180),
            O[1] - (r * 0.4) * Math.sin((midDeg * Math.PI) / 180),
          ];
          return (
            <>
              <line x1={O[0]} y1={O[1]} x2={O[0]} y2={O[1] - r} stroke={STROKE} strokeWidth={2} />
              <line x1={O[0]} y1={O[1]} x2={endPt[0]} y2={endPt[1]} stroke={STROKE} strokeWidth={2} />
              <path
                d={`M ${O[0]} ${O[1] - r} A ${r} ${r} 0 ${largeArc} 0 ${endPt[0]} ${endPt[1]}`}
                fill="#f6e0c9"
                opacity={0.7}
              />
              <Label x={labelPt[0]} y={labelPt[1]} text={centralAngleLabel} size={13} />
              {arcLabel !== undefined && (
                <Label
                  x={O[0] + (r + 14) * Math.cos((midDeg * Math.PI) / 180)}
                  y={O[1] - (r + 14) * Math.sin((midDeg * Math.PI) / 180)}
                  text={arcLabel}
                  hilite
                  size={13}
                />
              )}
            </>
          );
        })()
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
        <Label x={196} y={48} text={labels.outerR ?? ""} size={11} anchor="start" />
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

function isoCube(ax: number, ay: number, s: number): [string, string, string] {
  const d = s * 0.35;
  const front = `${ax},${ay} ${ax + s},${ay} ${ax + s},${ay + s} ${ax},${ay + s}`;
  const top = `${ax},${ay} ${ax + d},${ay - d} ${ax + d + s},${ay - d} ${ax + s},${ay}`;
  const side = `${ax + s},${ay} ${ax + s + d},${ay - d} ${ax + s + d},${ay - d + s} ${ax + s},${ay + s}`;
  return [front, top, side];
}

function ScaleCompare({ shape, factorLabel }: { shape: "square" | "cube" | "circle"; factorLabel: string }) {
  // The whole point of this figure is showing how much bigger the scaled
  // shape really is -- so read the real factor and size the second shape
  // accordingly, clamped so an extreme ratio still fits the fixed canvas.
  const factorVal = parseNumeric(factorLabel);
  const ratio = Math.min(3.2, Math.max(0.6, factorVal ?? 2));

  if (shape === "circle") {
    const rSmall = 18;
    const rBig = Math.min(65, Math.max(14, rSmall * ratio));
    return (
      <>
        <circle cx={38} cy={185 - rSmall} r={rSmall} fill={FILL} stroke={STROKE} strokeWidth={2} />
        <circle cx={160 + rBig} cy={195 - rBig} r={rBig} fill={FILL} stroke={STROKE} strokeWidth={2} />
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

  if (shape === "square") {
    const sSmall = 35;
    const sBig = Math.min(120, Math.max(18, sSmall * ratio));
    return (
      <>
        <rect x={20} y={175 - sSmall} width={sSmall} height={sSmall} fill={FILL} stroke={STROKE} strokeWidth={2} />
        <rect x={150} y={195 - sBig} width={sBig} height={sBig} fill={FILL} stroke={STROKE} strokeWidth={2} />
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

  const sSmall = 30;
  const sBig = Math.min(95, Math.max(16, sSmall * ratio));
  const [smallFront, smallTop, smallSide] = isoCube(15, 155, sSmall);
  const [bigFront, bigTop, bigSide] = isoCube(150, 195 - sBig, sBig);
  return (
    <>
      <polygon points={smallFront} fill={FILL} stroke={STROKE} strokeWidth={2} />
      <polygon points={smallTop} fill="#f6e8db" stroke={STROKE} strokeWidth={2} />
      <polygon points={smallSide} fill="#f0ddc4" stroke={STROKE} strokeWidth={2} />
      <polygon points={bigFront} fill={FILL} stroke={STROKE} strokeWidth={2} />
      <polygon points={bigTop} fill="#f6e8db" stroke={STROKE} strokeWidth={2} />
      <polygon points={bigSide} fill="#f0ddc4" stroke={STROKE} strokeWidth={2} />
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

function Axes() {
  return (
    <>
      <line x1={18} y1={105} x2={264} y2={105} stroke={MUTED} strokeWidth={1.5} />
      <line x1={140} y1={12} x2={140} y2={198} stroke={MUTED} strokeWidth={1.5} />
      <path d="M 258 100 L 264 105 L 258 110" fill="none" stroke={MUTED} strokeWidth={1.5} />
      <path d="M 135 18 L 140 12 L 145 18" fill="none" stroke={MUTED} strokeWidth={1.5} />
      <Label x={256} y={120} text="x" muted size={12} />
      <Label x={150} y={24} text="y" muted size={12} />
    </>
  );
}

const LINE_ENDPOINTS: Record<string, [[number, number], [number, number]]> = {
  steepPos: [
    [70, 185],
    [210, 25],
  ],
  gentlePos: [
    [25, 140],
    [255, 65],
  ],
  steepNeg: [
    [70, 25],
    [210, 185],
  ],
  gentleNeg: [
    [25, 65],
    [255, 140],
  ],
  zero: [
    [25, 105],
    [255, 105],
  ],
  undefined: [
    [140, 15],
    [140, 195],
  ],
};

function pointOnLine([x1, y1]: [number, number], [x2, y2]: [number, number], t: number): [number, number] {
  return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
}

function GraphLine({
  direction,
  dashed,
  offset = 0,
  color = STROKE,
}: {
  direction: string;
  dashed?: boolean;
  offset?: number;
  color?: string;
}) {
  const [[x1, y1], [x2, y2]] = LINE_ENDPOINTS[direction] ?? LINE_ENDPOINTS.gentlePos;
  return (
    <line
      x1={x1}
      y1={y1 + offset}
      x2={x2}
      y2={y2 + offset}
      stroke={color}
      strokeWidth={2.5}
      strokeDasharray={dashed ? "5 4" : undefined}
    />
  );
}

function lineIntersection(dir1: string, dir2: string): [number, number] {
  const [[ax1, ay1], [ax2, ay2]] = LINE_ENDPOINTS[dir1] ?? LINE_ENDPOINTS.gentlePos;
  const [[bx1, by1], [bx2, by2]] = LINE_ENDPOINTS[dir2] ?? LINE_ENDPOINTS.gentleNeg;
  const d = (ax1 - ax2) * (by1 - by2) - (ay1 - ay2) * (bx1 - bx2);
  if (Math.abs(d) < 1e-6) return [140, 105];
  const a = ax1 * ay2 - ay1 * ax2;
  const b = bx1 * by2 - by1 * bx2;
  const px = (a * (bx1 - bx2) - (ax1 - ax2) * b) / d;
  const py = (a * (by1 - by2) - (ay1 - ay2) * b) / d;
  return [Math.min(260, Math.max(20, px)), Math.min(195, Math.max(15, py))];
}

const POINT_X: Record<"left" | "mid" | "right", number> = { left: 0.15, mid: 0.5, right: 0.85 };

function LineGraph({
  direction,
  points,
  slopeLabel,
  extra,
}: {
  direction: string;
  points?: { label: string; at: "left" | "mid" | "right" }[];
  slopeLabel?: string;
  extra?: { direction: string; label?: string };
}) {
  const endpoints = LINE_ENDPOINTS[direction] ?? LINE_ENDPOINTS.gentlePos;
  return (
    <>
      <Axes />
      {extra && (
        <>
          <GraphLine
            direction={extra.direction}
            dashed
            color={MUTED}
            offset={extra.direction === direction ? -35 : 0}
          />
          {extra.label && (
            <Label
              {...(() => {
                const [p1, p2] = LINE_ENDPOINTS[extra.direction] ?? LINE_ENDPOINTS.gentlePos;
                const [lx, ly] = pointOnLine(p1, p2, 0.2);
                return { x: lx, y: (ly + (extra.direction === direction ? -35 : 0)) - 8 };
              })()}
              text={extra.label}
              muted
              size={11}
            />
          )}
        </>
      )}
      <GraphLine direction={direction} />
      {points?.map((p, i) => {
        const [px, py] = pointOnLine(endpoints[0], endpoints[1], POINT_X[p.at]);
        return (
          <g key={i}>
            <circle cx={px} cy={py} r={3.5} fill={HILITE} />
            <Label x={px + 8} y={py - 8} text={p.label} hilite size={12} anchor="start" />
          </g>
        );
      })}
      {slopeLabel && (
        <Label
          x={pointOnLine(endpoints[0], endpoints[1], 0.7)[0]}
          y={pointOnLine(endpoints[0], endpoints[1], 0.7)[1] - 12}
          text={slopeLabel}
          size={12}
        />
      )}
    </>
  );
}

function SystemGraph({
  line1Direction,
  line2Direction,
  parallel,
  sameLine,
  solutionLabel,
}: {
  line1Direction: string;
  line2Direction: string;
  parallel?: boolean;
  sameLine?: boolean;
  solutionLabel?: string;
}) {
  if (sameLine) {
    return (
      <>
        <Axes />
        <GraphLine direction={line1Direction} />
        <GraphLine direction={line1Direction} offset={-3} color={MUTED} dashed />
        <Label x={200} y={40} text="Same line" muted size={12} />
      </>
    );
  }
  if (parallel) {
    return (
      <>
        <Axes />
        <GraphLine direction={line1Direction} offset={-25} />
        <GraphLine direction={line1Direction} offset={25} />
        <Label x={215} y={50} text="No intersection" muted size={11} />
      </>
    );
  }
  const [ix, iy] = lineIntersection(line1Direction, line2Direction);
  return (
    <>
      <Axes />
      <GraphLine direction={line1Direction} />
      <GraphLine direction={line2Direction} />
      <circle cx={ix} cy={iy} r={4} fill={HILITE} />
      {solutionLabel && (
        <Label x={ix + 10} y={iy - 10} text={solutionLabel} hilite size={12} anchor="start" />
      )}
    </>
  );
}

function ParabolaGraph({
  opensUp,
  vertexLabel,
  rootLabels,
  yInterceptLabel,
  touchesAxis,
}: {
  opensUp: boolean;
  vertexLabel?: string;
  rootLabels?: [string, string];
  yInterceptLabel?: string;
  touchesAxis?: boolean;
}) {
  const hasRoots = !!rootLabels;
  const vertexY = touchesAxis ? 105 : opensUp ? (hasRoots ? 175 : 70) : hasRoots ? 35 : 140;
  const armY = opensUp ? 20 : 190;
  const leftX = 45;
  const rightX = 235;
  const vertexX = 140;
  const ctrlY = 2 * vertexY - armY;
  return (
    <>
      <Axes />
      <path
        d={`M ${leftX} ${armY} Q ${vertexX} ${ctrlY} ${rightX} ${armY}`}
        fill="none"
        stroke={STROKE}
        strokeWidth={2.5}
      />
      <circle cx={vertexX} cy={vertexY} r={3} fill={STROKE} />
      {vertexLabel && (
        <Label x={vertexX} y={vertexY + (opensUp ? 16 : -10)} text={vertexLabel} hilite size={12} />
      )}
      {hasRoots && (
        <>
          <circle cx={95} cy={105} r={3} fill={HILITE} />
          <circle cx={185} cy={105} r={3} fill={HILITE} />
          <Label x={95} y={122} text={rootLabels![0]} size={11} />
          <Label x={185} y={122} text={rootLabels![1]} size={11} />
        </>
      )}
      {yInterceptLabel && !hasRoots && (
        <Label x={vertexX + 18} y={vertexY - (opensUp ? 8 : -18)} text={yInterceptLabel} size={11} anchor="start" />
      )}
    </>
  );
}

function bezierPoint(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  t: number
): [number, number] {
  const mt = 1 - t;
  return [
    mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0],
    mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1],
  ];
}

function LineParabolaSystem({
  opensUp,
  points,
  noSolutions,
}: {
  opensUp: boolean;
  points: { label: string; accepted: boolean }[];
  noSolutions?: boolean;
}) {
  const vertexY = opensUp ? 165 : 45;
  const armY = opensUp ? 20 : 190;
  const leftX = 45;
  const rightX = 235;
  const vertexX = 140;
  const p0: [number, number] = [leftX, armY];
  const p1: [number, number] = [vertexX, 2 * vertexY - armY];
  const p2: [number, number] = [rightX, armY];

  const two = points.length >= 2;
  const one = points.length === 1;
  const tA = 0.32;
  const tB = 0.68;
  const ptA = bezierPoint(p0, p1, p2, tA);
  const ptB = bezierPoint(p0, p1, p2, tB);
  const vertexPt: [number, number] = [vertexX, vertexY];

  let lineEnds: [[number, number], [number, number]] = [
    [10, ptA[1] - (ptB[1] - ptA[1]) * 0.4],
    [270, ptB[1] + (ptB[1] - ptA[1]) * 0.4],
  ];
  if (one) {
    lineEnds = [
      [10, vertexPt[1]],
      [270, vertexPt[1]],
    ];
  } else if (noSolutions) {
    // Placed on the far side of the vertex from the arms (below the vertex
    // for an upward parabola, above it for a downward one) so it stays
    // inside the canvas while still clearly missing the curve entirely.
    lineEnds = opensUp
      ? [
          [10, 195],
          [270, 195],
        ]
      : [
          [10, 18],
          [270, 18],
        ];
  }

  return (
    <>
      <Axes />
      <path d={`M ${leftX} ${armY} Q ${vertexX} ${p1[1]} ${rightX} ${armY}`} fill="none" stroke={STROKE} strokeWidth={2.5} />
      <line x1={lineEnds[0][0]} y1={lineEnds[0][1]} x2={lineEnds[1][0]} y2={lineEnds[1][1]} stroke={HILITE} strokeWidth={2} />
      {two &&
        points.slice(0, 2).map((p, i) => {
          const [px, py] = i === 0 ? ptA : ptB;
          return (
            <g key={i}>
              <circle cx={px} cy={py} r={3.5} fill={p.accepted ? HILITE : MUTED} />
              <Label x={px} y={py - 10} text={p.label} hilite={p.accepted} muted={!p.accepted} size={11} />
            </g>
          );
        })}
      {one && (
        <>
          <circle cx={vertexPt[0]} cy={vertexPt[1]} r={3.5} fill={HILITE} />
          <Label x={vertexPt[0]} y={vertexPt[1] + (opensUp ? 16 : -10)} text={points[0]?.label ?? ""} hilite size={12} />
        </>
      )}
      {noSolutions && (
        <Label x={200} y={lineEnds[1][1] + (opensUp ? -10 : 16)} text="No real solutions" muted size={11} />
      )}
    </>
  );
}

function ExponentialGraph({
  growth,
  yInterceptLabel,
  asymptoteLabel,
}: {
  growth: boolean;
  yInterceptLabel?: string;
  asymptoteLabel?: string;
}) {
  const path = growth ? "M 30 188 Q 200 188 255 22" : "M 30 22 Q 90 188 255 190";
  return (
    <>
      <Axes />
      <line x1={20} y1={188} x2={264} y2={188} stroke={MUTED} strokeWidth={1.5} strokeDasharray="4 3" />
      <path d={path} fill="none" stroke={STROKE} strokeWidth={2.5} />
      {asymptoteLabel && <Label x={230} y={200} text={asymptoteLabel} muted size={11} />}
      {yInterceptLabel && (
        <Label
          x={growth ? 42 : 42}
          y={growth ? 178 : 15}
          text={yInterceptLabel}
          hilite
          size={12}
          anchor="start"
        />
      )}
    </>
  );
}

const SCATTER_POINTS: Record<string, [number, number][]> = {
  linearPos: [
    [40, 175],
    [65, 160],
    [80, 165],
    [100, 145],
    [120, 150],
    [140, 125],
    [155, 135],
    [175, 110],
    [195, 100],
    [210, 90],
    [230, 75],
    [245, 60],
  ],
  linearNeg: [
    [40, 55],
    [60, 70],
    [80, 65],
    [100, 90],
    [120, 85],
    [140, 105],
    [160, 115],
    [180, 130],
    [200, 140],
    [215, 155],
    [235, 165],
    [250, 180],
  ],
  quadratic: [
    [35, 60],
    [55, 100],
    [75, 130],
    [95, 155],
    [120, 172],
    [140, 178],
    [160, 172],
    [185, 155],
    [205, 130],
    [225, 100],
    [245, 60],
  ],
  exponential: [
    [35, 178],
    [60, 176],
    [85, 172],
    [110, 165],
    [130, 155],
    [150, 140],
    [170, 115],
    [190, 85],
    [210, 50],
    [230, 25],
    [248, 15],
  ],
  none: [
    [45, 100],
    [70, 60],
    [90, 150],
    [115, 90],
    [135, 140],
    [150, 55],
    [175, 120],
    [195, 80],
    [215, 160],
    [235, 100],
  ],
};

function ScatterGraph({ trend }: { trend: string }) {
  const pts = SCATTER_POINTS[trend] ?? SCATTER_POINTS.none;
  return (
    <>
      <Axes />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill={STROKE} opacity={0.75} />
      ))}
      {trend === "linearPos" && <line x1={35} y1={182} x2={250} y2={58} stroke={HILITE} strokeWidth={1.5} strokeDasharray="4 3" />}
      {trend === "linearNeg" && <line x1={35} y1={52} x2={255} y2={182} stroke={HILITE} strokeWidth={1.5} strokeDasharray="4 3" />}
      {trend === "quadratic" && (
        <path d="M 35 55 Q 140 195 245 55" fill="none" stroke={HILITE} strokeWidth={1.5} strokeDasharray="4 3" />
      )}
      {trend === "exponential" && (
        <path d="M 35 180 Q 200 180 248 15" fill="none" stroke={HILITE} strokeWidth={1.5} strokeDasharray="4 3" />
      )}
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
        {spec.kind === "lineGraph" && <LineGraph {...spec} />}
        {spec.kind === "systemGraph" && <SystemGraph {...spec} />}
        {spec.kind === "parabolaGraph" && <ParabolaGraph {...spec} />}
        {spec.kind === "lineParabolaSystem" && <LineParabolaSystem {...spec} />}
        {spec.kind === "exponentialGraph" && <ExponentialGraph {...spec} />}
        {spec.kind === "scatterGraph" && <ScatterGraph {...spec} />}
      </svg>
      <div className="text-[10px] text-gray-400 mt-1">Figure not drawn to scale.</div>
    </div>
  );
}
