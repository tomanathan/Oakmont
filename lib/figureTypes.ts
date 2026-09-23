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

export type FigureSpec = TableFigure | ScatterFigure | BarFigure | HistogramFigure | DotPlotFigure;
