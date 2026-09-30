import type { LessonVideoScript } from "./types";
import { BOUNDARIES } from "./scripts/boundaries";
import { CENTRAL_IDEAS } from "./scripts/centralIdeas";
import { CROSS_TEXT } from "./scripts/crossText";
import { EVIDENCE } from "./scripts/evidence";
import { FORM_STRUCTURE } from "./scripts/formStructure";
import { INFERENCES } from "./scripts/inferences";
import { RHETORICAL_SYNTHESIS } from "./scripts/rhetoricalSynthesis";
import { TEXT_STRUCTURE } from "./scripts/textStructure";
import { TRANSITIONS } from "./scripts/transitions";
import { WORDS_CONTEXT } from "./scripts/wordsContext";
import { MATH } from "./scripts/math";

// Every lesson video script: one per question type, Reading and Writing and Math.
export const LESSON_VIDEOS: LessonVideoScript[] = [
  ...CENTRAL_IDEAS,
  ...EVIDENCE,
  ...INFERENCES,
  ...WORDS_CONTEXT,
  ...TEXT_STRUCTURE,
  ...CROSS_TEXT,
  ...RHETORICAL_SYNTHESIS,
  ...TRANSITIONS,
  ...BOUNDARIES,
  ...FORM_STRUCTURE,
  ...MATH,
];

export function lessonVideoFor(subskillId: string, pattern: string): LessonVideoScript | undefined {
  return LESSON_VIDEOS.find((v) => v.subskillId === subskillId && v.pattern === pattern);
}

/** Stable id for a video's audio files: subskill + pattern, slugged. */
export function videoSlug(v: { subskillId: string; pattern: string }): string {
  return `${v.subskillId}--${v.pattern.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}
