// Scripts for the short lesson videos: Ozho, inside a Polaroid taped onto
// the notebook page, explains one question type and then walks through one
// of that pattern's own worked examples (data/curriculum.ts), so every
// video teaches from content the lesson already contains.
//
// Captions are the soundtrack: every line Ozho "says" is shown in the
// Polaroid's white strip, so the video works with the sound off.

export interface LessonVideoScript {
  subskillId: string;
  // Must equal the Pattern's `name` in data/curriculum.ts.
  pattern: string;
  // Which of the pattern's worked examples to walk through (index into
  // Pattern.examples). Pick one whose passage fits on the board.
  example: number;
  // Optional: an exact substring of the example's question text to show on
  // the board instead of all of it (for long passages). The question
  // prompt at the end is always shown.
  excerpt?: string;
  // Ozho's opening line.
  hook: string;
  // The idea, 2-3 beats: a short point written on the board, and the
  // sentence Ozho says with it.
  idea: { point: string; say: string }[];
  // The walkthrough, 2-4 beats (up to 6 for math, which writes out work).
  // `highlight` lists exact substrings of the example's question text to
  // sweep a marker over; `strike` lists wrong choice indexes to cross out on
  // this beat.
  //
  // Math videos also write the work out: `work` adds one line to the board
  // (the app's plain math format, typeset like everywhere else: "3x + 5 = 20",
  // "x² − 9", "√2"), with an optional short margin `note` naming the move
  // ("−5 both sides"). The newest line is highlighted; earlier ones fade.
  // Spoken `say` lines are always in words ("three x plus five equals
  // twenty"), never symbols or digits, so the voice reads them cleanly.
  // `spot` lights up labels inside the example's diagram or graph (exact
  // label text as drawn, e.g. "40°", "x", "12"), in step with the words.
  //
  // Math videos can also draw a `scene` (below): each step can construct,
  // emphasise, move or re-shape its objects in step with the words, so the
  // picture carries the argument the way the algebra does.
  steps: {
    say: string;
    highlight?: string[];
    strike?: number[];
    work?: string;
    note?: string;
    spot?: string[];
    draw?: string[];
    focus?: string[];
    hide?: string[];
    move?: SceneMove[];
    set?: SceneSet[];
  }[];
  // Said as the right choice gets circled.
  answer: string;
  // The one trap to remember, and the one-line takeaway.
  trap: { point: string; say: string };
  recap: { point: string; say: string };
  // Math: an animated figure drawn on the board instead of the example's
  // static one (see SceneSpec). Objects no step `draw`s are built while the
  // question is read; the rest appear on their step.
  scene?: SceneSpec;
  // Math: colours for quantities, used everywhere they appear: equation
  // tokens whose text equals a key (or, for a single letter, contains it as
  // the variable) are drawn in that colour, so "x" on the figure and "x" in
  // the algebra are visibly the same thing.
  tint?: Record<string, SceneColor>;
}

// ---------- scenes ----------
// A scene is a little coordinate world (y points up) drawn in SVG and built
// up step by step, in the spirit of a 3Blue1Brown animation: lines draw
// themselves, angles sweep open, points drop onto curves, and pieces slide
// into place to show *why* a step is true.

export type SceneColor = "blue" | "yellow" | "pink" | "green" | "orange" | "purple" | "white" | "gray";

/** A point: coordinates, or the name of one of the scene's `pts`. */
export type ScenePt = [number, number] | string;

interface SceneObjBase {
  id: string;
  color?: SceneColor;
  // Text drawn beside the object (point/segment/angle/function labels).
  label?: string;
  // Nudge the label, in screen pixels (x right, y down).
  labelOffset?: [number, number];
}

export type SceneObj =
  | (SceneObjBase & { kind: "axes"; xStep?: number; yStep?: number; numbers?: boolean; grid?: boolean })
  | (SceneObjBase & { kind: "numline"; y?: number; min: number; max: number; step: number; numbers?: boolean })
  | (SceneObjBase & { kind: "point"; at: ScenePt; open?: boolean })
  | (SceneObjBase & { kind: "seg"; from: ScenePt; to: ScenePt; dash?: boolean; arrow?: boolean; width?: number })
  | (SceneObjBase & { kind: "line"; through: [ScenePt, ScenePt]; dash?: boolean })
  // y as a function of x: numbers, x, + − * / ^, parentheses, sqrt(), abs(),
  // and any names in `params` (which `set` can tween, e.g. a slope).
  | (SceneObjBase & { kind: "fn"; y: string; params?: Record<string, number>; domain?: [number, number]; dash?: boolean })
  | (SceneObjBase & { kind: "poly"; pts: ScenePt[]; fill?: boolean; open?: boolean; dash?: boolean })
  | (SceneObjBase & { kind: "circle"; c: ScenePt; r: number; fill?: boolean })
  // The angle at `at` swept from ray at→from to ray at→to (the smaller
  // side). `right` draws the little square instead of an arc.
  | (SceneObjBase & { kind: "angle"; at: ScenePt; from: ScenePt; to: ScenePt; r?: number; right?: boolean; fill?: boolean })
  | (SceneObjBase & { kind: "text"; at: ScenePt; text: string; size?: number });

export interface SceneSpec {
  // The visible window, in scene units. Geometry keeps equal x/y scale.
  x: [number, number];
  y: [number, number];
  pts?: Record<string, [number, number]>;
  objects: SceneObj[];
}

/** Slide (and turn) an object, e.g. a copied angle into place. Persists. */
export interface SceneMove {
  id: string;
  by?: [number, number];
  // Degrees, counter-clockwise, about `about` (default: the object's anchor:
  // an angle's vertex, a point, or the centre of anything else).
  turn?: number;
  about?: ScenePt;
}

/** Tween an object's numbers (a function's params, a point's position),
 *  or the camera: id "view" with x/y windows. Persists. */
export interface SceneSet {
  id: string;
  params?: Record<string, number>;
  at?: [number, number];
  x?: [number, number];
  y?: [number, number];
}
