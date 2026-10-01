import type { WorkedExample } from "@/data/curriculum";
import type { LessonVideoScript } from "@/lib/lessonVideos/types";
import { compileExpr } from "./math/expr";

// Turns a script into a timeline of beats. Everything the player draws is a
// pure function of (timeline, t), so it can be scrubbed, replayed, or
// captured frame by frame.

export type BeatKind = "hook" | "idea" | "question" | "step" | "answer" | "trap" | "recap";

export interface Beat {
  kind: BeatKind;
  i: number; // index within its kind
  start: number;
  end: number;
  say: string;
}

export interface Timeline {
  beats: Beat[];
  duration: number;
  // When the Polaroid lands and when Ozho reaches his spot.
  slapAt: number;
  walkStart: number;
  walkEnd: number;
  // The board text (passage + prompt) and every highlight with its range.
  passage: string;
  prompt: string;
  marks: { from: number; to: number; at: number }[];
  strikes: { choice: number; at: number }[];
  // Math: lines of work written onto the board, in order.
  work: { line: string; note?: string; at: number }[];
  spots: { label: string; at: number; until: number }[];
  // Each walkthrough step's cue time and end (scenes key off these).
  steps: { at: number; until: number }[];
  math: boolean;
}

const words = (s: string) => s.trim().split(/\s+/).length;
// Caption reading time: about 2.5 words a second, never under 2.4s.
const readTime = (s: string) => Math.max(2.4, words(s) / 2.5 + 0.9);

const QUESTION_SAY = "Here's one. Read it with me.";

/** Splits a question into the passage and the prompt at the end. */
export function splitQuestion(q: string): { passage: string; prompt: string } {
  const para = q.lastIndexOf("\n\n");
  if (para > 0) return { passage: q.slice(0, para).trim(), prompt: q.slice(para).trim() };
  const which = q.search(/\b(Which|What|Based on|According to)\b[^.?]*\?\s*$/);
  if (which > 0) return { passage: q.slice(0, which).trim(), prompt: q.slice(which).trim() };
  return { passage: q.trim(), prompt: "" };
}

/** A generated voice track: each beat's start and end, in beat order. */
export interface VoiceTrack {
  src: string;
  beats: [number, number][];
  duration: number;
}

export function buildTimeline(script: LessonVideoScript, ex: WorkedExample, voice?: VoiceTrack): Timeline {
  const split = splitQuestion(ex.q);
  const passage = script.excerpt ? `…${script.excerpt.trim()}…` : split.passage;
  const beats: Beat[] = [];
  const slapAt = 0.35;
  const walkStart = 0.6;
  const walkEnd = 2.0;
  let t = 1.7;
  const push = (kind: BeatKind, i: number, say: string, dur = readTime(say)) => {
    // With a voice track, each beat lasts exactly as long as its line.
    const v = voice?.beats[beats.length];
    if (v) {
      beats.push({ kind, i, start: v[0], end: v[1], say });
      t = v[1];
      return;
    }
    beats.push({ kind, i, start: t, end: t + dur, say });
    t += dur;
  };

  push("hook", 0, script.hook);
  script.idea.forEach((b, i) => push("idea", i, b.say));
  // Time to read the question itself, not just the caption.
  push("question", 0, QUESTION_SAY, Math.max(3.2, words(passage + " " + split.prompt) / 4.2));
  const marks: Timeline["marks"] = [];
  const strikes: Timeline["strikes"] = [];
  const work: Timeline["work"] = [];
  const spots: Timeline["spots"] = [];
  const steps: Timeline["steps"] = [];
  script.steps.forEach((s, i) => {
    const at = (voice?.beats[beats.length]?.[0] ?? t) + 0.35;
    for (const h of s.highlight ?? []) {
      const from = passage.indexOf(h);
      if (from >= 0) marks.push({ from, to: from + h.length, at });
    }
    for (const c of s.strike ?? []) strikes.push({ choice: c, at });
    if (s.work) work.push({ line: s.work, note: s.note, at: at - 0.1 });
    push("step", i, s.say);
    for (const label of s.spot ?? []) spots.push({ label, at, until: t });
    steps.push({ at, until: t });
  });
  push("answer", 0, script.answer, readTime(script.answer) + 0.4);
  push("trap", 0, script.trap.say);
  push("recap", 0, script.recap.say, readTime(script.recap.say) + 1.2);

  return { beats, duration: voice ? Math.max(voice.duration, t) : t, slapAt, walkStart, walkEnd, passage, prompt: split.prompt, marks: marks.sort((a, b) => a.from - b.from), strikes, work, spots, steps, math: script.subskillId.startsWith("m-") };
}

export function beatAt(tl: Timeline, t: number): Beat | null {
  if (t < tl.beats[0].start) return null;
  for (const b of tl.beats) if (t < b.end) return b;
  return tl.beats[tl.beats.length - 1];
}

/** Every problem the script checker cares about, as plain messages. */
export function checkScript(script: LessonVideoScript, ex: WorkedExample | undefined): string[] {
  const out: string[] = [];
  if (!ex) return [`${script.pattern}: example ${script.example} doesn't exist`];
  if (script.excerpt && !ex.q.includes(script.excerpt.trim())) out.push(`${script.pattern}: excerpt isn't in the question`);
  const shown = script.excerpt ?? ex.q;
  script.steps.forEach((s, i) => {
    for (const h of s.highlight ?? []) if (!shown.includes(h)) out.push(`${script.pattern}: step ${i + 1} highlight not found: "${h}"`);
    for (const c of s.strike ?? []) {
      if (c === ex.answer) out.push(`${script.pattern}: step ${i + 1} strikes the right answer`);
      if (c < 0 || c >= ex.choices.length) out.push(`${script.pattern}: step ${i + 1} strikes a choice that doesn't exist`);
    }
  });
  const isMath = script.subskillId.startsWith("m-");
  // It has to fit on Ozho's board.
  const { passage, prompt } = splitQuestion(ex.q);
  const shownWords = words(script.excerpt ?? passage) + words(prompt);
  const longest = Math.max(...ex.choices.map((c) => c.length));
  const budget = isMath ? 60 : longest > 110 ? 44 : longest > 60 ? 55 : longest > 32 ? 65 : 85;
  if (shownWords > budget)
    out.push(`${script.pattern}: board text is ${shownWords} words; with these choices it must be ${budget} or fewer (use a shorter example or an excerpt)`);
  if (longest > 200) out.push(`${script.pattern}: a choice is ${longest} characters; pick an example with shorter choices`);
  const struck = new Set(script.steps.flatMap((s) => s.strike ?? []));
  if (struck.size !== ex.choices.length - 1) out.push(`${script.pattern}: should strike all ${ex.choices.length - 1} wrong choices (strikes ${struck.size})`);
  if (script.idea.length < 2 || script.idea.length > 3) out.push(`${script.pattern}: idea needs 2-3 beats`);
  const maxSteps = isMath ? 6 : 4;
  if (script.steps.length < 2 || script.steps.length > maxSteps) out.push(`${script.pattern}: steps needs 2-${maxSteps} beats`);
  // Spoken lines must be words: symbols and digits read badly aloud.
  const spoken = [script.hook, script.answer, script.trap.say, script.recap.say, ...script.idea.map((b) => b.say), ...script.steps.map((s) => s.say)];
  for (const s of spoken) if (/[0-9=+×÷^²³√<>≤≥%π°∠△]/.test(s)) out.push(`${script.pattern}: spoken line has digits or symbols (say them in words): "${s.slice(0, 50)}…"`);
  const figText = JSON.stringify([ex.diagram ?? null, ex.figure ?? null]);
  for (const s of script.steps)
    for (const label of s.spot ?? []) if (!figText.includes(JSON.stringify(label).slice(1, -1))) out.push(`${script.pattern}: spot "${label}" isn't a label in this example's figure`);
  if (isMath) {
    const lines = script.steps.filter((s) => s.work);
    if (lines.length > 6) out.push(`${script.pattern}: more than 6 lines of work`);
    for (const s of lines) if ((s.work ?? "").length > 42) out.push(`${script.pattern}: work line over 42 characters: "${s.work}"`);
    for (const s of script.steps) if ((s.note ?? "").length > 22) out.push(`${script.pattern}: margin note over 22 characters: "${s.note}"`);
  }
  if (script.scene) out.push(...checkScene(script));
  const tooLong = [script.hook, script.answer, script.trap.say, script.recap.say, ...script.idea.map((b) => b.say), ...script.steps.map((s) => s.say)].filter((s) => words(s) > 26);
  for (const s of tooLong) out.push(`${script.pattern}: caption over 26 words: "${s.slice(0, 40)}…"`);
  // Board points: count real words only, so a formula's symbols and
  // single letters ("a² − b² = (a−b)(a+b)") don't count against it.
  const realWords = (s: string) => s.split(/\s+/).filter((w) => /[A-Za-z]{2,}/.test(w)).length;
  const points = [script.trap.point, script.recap.point, ...script.idea.map((b) => b.point)].filter((s) => realWords(s) > 8 || s.length > 60);
  for (const s of points) out.push(`${script.pattern}: board point over 8 words: "${s}"`);
  return out;
}

/** Scene problems: unknown ids, unreadable functions, points off the board. */
function checkScene(script: LessonVideoScript): string[] {
  const out: string[] = [];
  const sc = script.scene!;
  const name = script.pattern;
  const ids = new Set<string>();
  for (const o of sc.objects) {
    if (ids.has(o.id)) out.push(`${name}: scene id "${o.id}" is used twice`);
    ids.add(o.id);
  }
  const pt = (p: unknown, where: string) => {
    if (typeof p === "string") {
      const obj = sc.objects.find((o) => o.id === p);
      if (!sc.pts?.[p] && !(obj && obj.kind === "point")) out.push(`${name}: ${where} names "${p}", which isn't in pts or a point`);
    } else if (!Array.isArray(p) || p.length !== 2 || !p.every((v) => Number.isFinite(v))) out.push(`${name}: ${where} has a bad point`);
  };
  if (!(sc.x[1] > sc.x[0]) || !(sc.y[1] > sc.y[0])) out.push(`${name}: scene x/y windows must go low to high`);
  for (const o of sc.objects) {
    const w = `scene "${o.id}"`;
    if (o.kind === "point") pt(o.at, w);
    if (o.kind === "seg") (pt(o.from, w), pt(o.to, w));
    if (o.kind === "line") o.through.forEach((p) => pt(p, w));
    if (o.kind === "poly") o.pts.forEach((p) => pt(p, w));
    if (o.kind === "circle") pt(o.c, w);
    if (o.kind === "angle") [o.at, o.from, o.to].forEach((p) => pt(p, w));
    if (o.kind === "text") pt(o.at, w);
    if (o.kind === "fn") {
      try {
        const f = compileExpr(o.y);
        const xs = [sc.x[0], (sc.x[0] + sc.x[1]) / 2, sc.x[1]].map((x) => Math.min(Math.max(x, o.domain?.[0] ?? -Infinity), o.domain?.[1] ?? Infinity));
        if (!xs.some((x) => Number.isFinite(f(x, o.params ?? {})))) out.push(`${name}: ${w} never gives a number (missing params?)`);
      } catch (e) {
        out.push(`${name}: ${w} ${(e as Error).message}`);
      }
    }
    if ((o.kind === "axes" || o.kind === "numline") && "step" in o && !(o.step > 0)) out.push(`${name}: ${w} needs a positive step`);
  }
  script.steps.forEach((s, i) => {
    for (const id of [...(s.draw ?? []), ...(s.focus ?? []), ...(s.hide ?? []), ...(s.move ?? []).map((m) => m.id)])
      if (!ids.has(id)) out.push(`${name}: step ${i + 1} refers to scene id "${id}", which doesn't exist`);
    for (const st of s.set ?? []) if (st.id !== "view" && !ids.has(st.id)) out.push(`${name}: step ${i + 1} sets unknown scene id "${st.id}"`);
  });
  const drawn = script.steps.flatMap((s) => s.draw ?? []);
  if (new Set(drawn).size !== drawn.length) out.push(`${name}: a scene object is drawn on two steps`);
  return out;
}
