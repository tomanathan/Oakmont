// Structured, hand-authored specs for the schematic geometry figures shown
// next to worked examples in the geometry subskills. Figures are drawn
// schematically (consistent canonical layouts with swapped-in labels), the
// same way official SAT figures are captioned "Note: Figure not drawn to
// scale" -- the goal is to show which sides/angles are which, not to be
// pixel-accurate to the given numbers.

export interface RightTriangleSpec {
  kind: "rightTriangle";
  base?: string;
  height?: string;
  hypotenuse?: string;
  angle?: string;
  topAngle?: string;
  solveFor?: "base" | "height" | "hypotenuse" | "angle";
}

export interface IsoscelesAltitudeSpec {
  kind: "isoscelesAltitude";
  equalSide: string;
  base?: string;
  halfBase?: string;
  altitude?: string;
  solveFor?: "altitude" | "equalSide" | "halfBase";
}

export interface TriangleAnglesSpec {
  kind: "triangleAngles";
  angleA?: string;
  angleB?: string;
  angleC?: string;
  exterior?: { at: "A" | "B" | "C"; label: string };
  chained?: { angleB: string; angleBAC: string; angleD: string; angleDAC: string };
}

export interface SimilarTrianglesSpec {
  kind: "similarTriangles";
  leftLabels: [string, string, string];
  leftSides: [string, string, string];
  rightLabels: [string, string, string];
  rightSides: [string, string, string];
}

export type TransversalPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface ParallelTransversalSpec {
  kind: "parallelTransversal";
  givenLabel: string;
  givenPosition: TransversalPosition;
  askedLabel: string;
  askedPosition: TransversalPosition;
  extraLabel?: string;
  extraPosition?: TransversalPosition;
}

export interface BentPathSpec {
  kind: "bentPath";
  angle1: string;
  angle2: string;
  unknown: string;
}

export interface IntersectingLinesSpec {
  kind: "intersectingLines";
  lines: 2 | 3;
  angles: { label: string; position: number; muted?: boolean }[];
}

export interface CircleBasicSpec {
  kind: "circleBasic";
  radiusLabel?: string;
  centralAngleLabel?: string;
  arcLabel?: string;
  tangent?: { radius: string; tangentSeg: string; hyp: string };
  chordTriangle?: { radius: string; angle: string; chord: string };
}

export interface CircleCoordinateSpec {
  kind: "circleCoordinate";
  h: number;
  k: number;
  r: number;
  verticalLineAtX?: number;
  markPoints?: boolean;
  singlePoint?: boolean;
  noIntersect?: boolean;
}

export interface SectorSpec {
  kind: "sector";
  radiusLabel?: string;
  angleLabel: string;
  angleDegrees: number;
  askFor: "area" | "arcLength" | "angle";
}

export interface UnitCircleAngleSpec {
  kind: "unitCircleAngle";
  rawLabel: string;
  angleDegrees: number;
}

export interface SolidShapeSpec {
  kind: "solid";
  shape: "cylinder" | "cone" | "sphere" | "box" | "cylinderHemisphere" | "hollowCylinder";
  labels: Record<string, string>;
}

export interface ScaleCompareSpec {
  kind: "scaleCompare";
  shape: "square" | "cube" | "circle";
  factorLabel: string;
}

export type DiagramSpec =
  | RightTriangleSpec
  | IsoscelesAltitudeSpec
  | TriangleAnglesSpec
  | SimilarTrianglesSpec
  | ParallelTransversalSpec
  | BentPathSpec
  | IntersectingLinesSpec
  | CircleBasicSpec
  | CircleCoordinateSpec
  | SectorSpec
  | UnitCircleAngleSpec
  | SolidShapeSpec
  | ScaleCompareSpec;
