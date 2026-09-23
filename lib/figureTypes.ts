// Figures attached to practice questions (Question.figure). Unlike the
// schematic geometry diagrams in lib/diagramTypes.ts, these are drawn to
// scale from the data itself: every point, bar, and dot is placed from the
// numbers below, so the figure can never disagree with the question's key.
// Axis ranges are authored (not auto-fit) so gridlines land on the round
// values a student would read off a real SAT figure.

export interface Axis {
  label: string;
  min: number;
  max: number;
  step: number; // gridline and tick spacing; must divide (max - min)
  plain?: boolean; // print ticks without thousands separators (years)
}

export interface TableFigure {
  kind: "table";
  title?: string;
  header: string[];
  rows: (string | number)[][];
}

export interface ScatterFigure {
  kind: "scatter";
  title?: string;
  x: Axis;
  y: Axis;
  points: [number, number][];
  // Line of best fit, drawn across the plot and clipped to it.
  line?: { slope: number; intercept: number };
  // Join the points in order: a line graph (e.g., a value over time).
  connect?: boolean;
}

export interface BarFigure {
  kind: "bar";
  title?: string;
  xLabel: string;
  y: Axis;
  bars: { label: string; value: number }[];
}

export interface HistogramFigure {
  kind: "histogram";
  title?: string;
  x: Axis; // bin edges fall on x ticks
  y: Axis;
  bins: { from: number; to: number; count: number }[];
}

export interface DotPlotFigure {
  kind: "dotplot";
  title?: string;
  x: Axis;
  values: number[];
}

// Plane geometry drawn from real coordinates, so every length and angle in
// the figure is the one the question states (the build checks each numeric
// side and angle label against the coordinates).
export interface GeometryFigure {
  kind: "geometry";
  title?: string;
  points: Record<string, [number, number]>;
  // Points drawn with a dot and/or a name. Unlisted points are construction
  // helpers (ray directions, line ends) and stay invisible.
  names?: string[];
  dots?: string[];
  // Override where a name sits: direction in degrees (0 = right, 90 = up).
  namePos?: Record<string, number>;
  segments?: {
    from: string;
    to: string;
    label?: string;
    side?: 1 | -1; // which side of the segment the label sits on (default: away from the figure's center)
    ticks?: number; // congruence marks
    dashed?: boolean;
    arrows?: boolean; // a line, not a segment: arrowheads at both ends
  }[];
  polygons?: { points: string[]; shade?: boolean }[];
  circles?: { center: string; radius: number; shade?: boolean; blank?: boolean }[];
  arcs?: { center: string; radius: number; from: number; to: number }[]; // degrees, counterclockwise
  angles?: { vertex: string; from: string; to: string; label?: string; right?: boolean; marks?: number }[];
  axes?: { x: [number, number]; y: [number, number]; step?: number; labelEvery?: number };
  // Graphs on the axes: polylines in problem units (a line is two points,
  // a curve is a dense sample), clipped to the axes window.
  paths?: { points: [number, number][]; dashed?: boolean; arrows?: boolean }[];
  // Shaded regions in problem units (e.g., an inequality's half-plane).
  regions?: [number, number][][];
  // Text placed at a spot in problem units (e.g., "y = f(x)" beside a curve).
  notes?: { at: [number, number]; text: string }[];
}

// Solids in oblique projection, drawn to their stated dimensions.
export interface SolidFigure {
  kind: "solid";
  title?: string;
  shape: "cylinder" | "cone" | "prism";
  // cylinder/cone: radius and height; prism: length (across), width (depth), height
  radius?: number;
  height: number;
  length?: number;
  width?: number;
  labels: { radius?: string; diameter?: string; height?: string; length?: string; width?: string; slant?: string };
}

export type FigureSpec =
  | TableFigure
  | ScatterFigure
  | BarFigure
  | HistogramFigure
  | DotPlotFigure
  | GeometryFigure
  | SolidFigure;
