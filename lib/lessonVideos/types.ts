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
  steps: { say: string; highlight?: string[]; strike?: number[]; work?: string; note?: string; spot?: string[] }[];
  // Said as the right choice gets circled.
  answer: string;
  // The one trap to remember, and the one-line takeaway.
  trap: { point: string; say: string };
  recap: { point: string; say: string };
}
