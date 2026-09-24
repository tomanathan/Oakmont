import { ALL_SUBSKILLS, getSubskill } from "@/data/curriculum";
import { getItem, trapFor, PACE_SECONDS } from "@/lib/items";
import { progressMapFromRows, statusOf, type ProgressRowLike, type SubskillStatus } from "@/lib/progressState";
import { subskillWeight } from "@/lib/testWeights";
import type { Pacing } from "@/lib/pacing";

// Turns a student's raw records (every answered question, lesson reading
// time, mastery rows, practice tests) into what a parent actually wants to
// know: is my kid studying, how much, is it working, where are they
// stuck, and what can I say to help. Pure: the parent dashboard, the share
// view and the weekly email all build the same report from the same
// inputs, days bucketed in the parent's own time zone.

export interface AttemptLike {
  subskillId: string;
  itemId: string;
  source: string; // "quiz" | "review"
  correct: boolean;
  choice: number;
  confidence: string | null;
  ms: number | null;
  createdAt: Date;
}

export interface LessonViewLike {
  subskillId: string;
  ms: number;
  createdAt: Date;
}

export interface TestLike {
  id: string;
  takenAt: Date;
  compositeScore: number;
  rwScore: number;
  mathScore: number;
}

export interface StudentLike {
  createdAt: Date;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  baselineScore: number | null;
  goalScore: number | null;
  targetTestDate: Date | null;
}

export interface InsightInput {
  now: Date;
  timeZone: string;
  name: string;
  student: StudentLike;
  attempts: AttemptLike[];
  lessonViews: LessonViewLike[];
  progressRows: (ProgressRowLike & { lastAttempt: Date })[];
  tests: TestLike[];
  pacing: Pacing;
  thisWeekPlan: { done: number; total: number };
  daysUntilTest: number | null;
}

export type Tone = "good" | "watch" | "act";

export interface DayCell {
  day: string; // YYYY-MM-DD in the parent's zone
  minutes: number;
  questions: number;
}

export interface WeekPoint {
  weekStart: string; // YYYY-MM-DD (Monday)
  minutes: number;
  questions: number;
  accuracy: number | null; // 0-100
  activeDays: number;
}

export interface Session {
  start: string; // ISO
  minutes: number;
  questions: number;
  correct: number;
  lessonMinutes: number;
  subskills: string[]; // names
  kinds: ("quiz" | "review" | "lesson")[];
}

export interface FeedEvent {
  at: string; // ISO
  kind: "mastered" | "passed" | "quiz" | "review" | "test" | "lesson";
  title: string;
  detail: string;
}

export interface SkillRow {
  id: string;
  name: string;
  section: string;
  domain: string;
  status: SubskillStatus;
  accuracy: number | null; // all-time accuracy on its questions, 0-100
  recentAccuracy: number | null; // last 30 days
  questions: number;
  lastPracticed: string | null; // ISO
  weight: number; // share of the test this skill represents
}

export interface TrapRow {
  trap: string;
  skill: string;
  count: number;
}

export interface ConfidenceRow {
  level: "sure" | "unsure" | "guessed";
  count: number;
  accuracy: number | null;
}

export interface PaceRow {
  section: string;
  avgSeconds: number | null;
  targetSeconds: number;
  rushedShare: number | null; // share of answers under 40% of target time, 0-100
  rushedAccuracy: number | null;
  steadyAccuracy: number | null;
}

export interface TalkingPoint {
  kind: "celebrate" | "ask" | "nudge" | "plan";
  text: string;
}

export interface ParentReport {
  name: string;
  generatedAt: string;
  timeZone: string;
  verdict: { tone: Tone; headline: string; detail: string };
  lastActive: string | null; // ISO of the most recent activity
  daysSinceActive: number | null;
  week: {
    minutes: number;
    minutesPrev: number;
    questions: number;
    questionsPrev: number;
    accuracy: number | null;
    accuracyPrev: number | null;
    activeDays: number;
    activeDaysPrev: number;
    dayFlags: { day: string; label: string; active: boolean; minutes: number }[]; // last 7 days
  };
  streak: { current: number; longest: number };
  calendar: DayCell[]; // last 84 days, oldest first
  weeks: WeekPoint[]; // last 8 weeks, oldest first
  typicalTime: string | null;
  sessions: Session[]; // most recent first
  feed: FeedEvent[]; // most recent first
  skills: SkillRow[];
  strengths: SkillRow[];
  focus: SkillRow[];
  mastery: { mastered: number; passed: number; started: number; due: number; total: number };
  retention: { quizAccuracy: number | null; reviewAccuracy: number | null; reviewQuestions: number };
  confidence: ConfidenceRow[];
  confidentlyWrong: number;
  luckyGuesses: number;
  pace: PaceRow[];
  traps: TrapRow[];
  scores: {
    tests: { id: string; takenAt: string; composite: number; rw: number; math: number }[];
    baseline: number | null;
    goal: number | null;
    daysUntilTest: number | null;
    targetTestDate: string | null;
  };
  plan: { pacing: Pacing; thisWeek: { done: number; total: number } };
  talkingPoints: TalkingPoint[];
  hasActivity: boolean;
}

// ---- helpers ----------------------------------------------------------------

const MAX_QUESTION_MS = 4 * 60 * 1000; // a question left open longer than this wasn't 4+ minutes of work
const DEFAULT_QUESTION_MS = 60 * 1000;
const MAX_LESSON_MS = 30 * 60 * 1000;
const SESSION_GAP_MS = 30 * 60 * 1000;
const DAY_MS = 86400000;

function pct(n: number, d: number): number | null {
  return d > 0 ? Math.round((n / d) * 100) : null;
}

function questionMs(a: AttemptLike): number {
  return Math.min(a.ms ?? DEFAULT_QUESTION_MS, MAX_QUESTION_MS);
}

function lessonMs(v: LessonViewLike): number {
  return Math.min(v.ms, MAX_LESSON_MS);
}

export function dayKey(d: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function hourIn(d: Date, timeZone: string): number {
  const h = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(d);
  return parseInt(h, 10) % 24;
}

function addDaysKey(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d) + n * DAY_MS);
  return t.toISOString().slice(0, 10);
}

function weekdayOfKey(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday
}

function mondayOf(key: string): string {
  const wd = weekdayOfKey(key);
  return addDaysKey(key, -((wd + 6) % 7));
}

function shortDayLabel(key: string): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekdayOfKey(key)];
}

function skillName(id: string): string {
  return getSubskill(id)?.name ?? id;
}

// ---- the report ---------------------------------------------------------------

export function buildParentReport(input: InsightInput): ParentReport {
  const { now, timeZone, attempts, lessonViews, tests, student } = input;
  const today = dayKey(now, timeZone);
  const sortedAttempts = [...attempts].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const sortedLessons = [...lessonViews].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // -- per-day totals
  const byDay = new Map<string, { minutes: number; questions: number; correct: number }>();
  const bump = (key: string, ms: number, q: number, c: number) => {
    const cur = byDay.get(key) ?? { minutes: 0, questions: 0, correct: 0 };
    cur.minutes += ms / 60000;
    cur.questions += q;
    cur.correct += c;
    byDay.set(key, cur);
  };
  for (const a of sortedAttempts) bump(dayKey(a.createdAt, timeZone), questionMs(a), 1, a.correct ? 1 : 0);
  for (const v of sortedLessons) bump(dayKey(v.createdAt, timeZone), lessonMs(v), 0, 0);

  const calendar: DayCell[] = [];
  for (let i = 83; i >= 0; i--) {
    const k = addDaysKey(today, -i);
    const c = byDay.get(k);
    calendar.push({ day: k, minutes: Math.round(c?.minutes ?? 0), questions: c?.questions ?? 0 });
  }

  const sumRange = (fromBack: number, toBack: number) => {
    // days [today - fromBack, today - toBack], inclusive
    let minutes = 0, questions = 0, correct = 0, active = 0;
    for (let i = fromBack; i >= toBack; i--) {
      const c = byDay.get(addDaysKey(today, -i));
      if (!c) continue;
      minutes += c.minutes;
      questions += c.questions;
      correct += c.correct;
      if (c.minutes >= 1 || c.questions > 0) active++;
    }
    return { minutes: Math.round(minutes), questions, accuracy: pct(correct, questions), active };
  };
  const thisWeek = sumRange(6, 0);
  const prevWeek = sumRange(13, 7);
  const dayFlags = Array.from({ length: 7 }, (_, j) => {
    const k = addDaysKey(today, j - 6);
    const c = byDay.get(k);
    return { day: k, label: shortDayLabel(k), active: !!c && (c.minutes >= 1 || c.questions > 0), minutes: Math.round(c?.minutes ?? 0) };
  });

  // -- weekly trend (Monday-based weeks, last 8)
  const thisMonday = mondayOf(today);
  const weeks: WeekPoint[] = [];
  for (let w = 7; w >= 0; w--) {
    const start = addDaysKey(thisMonday, -7 * w);
    let minutes = 0, questions = 0, correct = 0, activeDays = 0;
    for (let d = 0; d < 7; d++) {
      const c = byDay.get(addDaysKey(start, d));
      if (!c) continue;
      minutes += c.minutes;
      questions += c.questions;
      correct += c.correct;
      if (c.minutes >= 1 || c.questions > 0) activeDays++;
    }
    weeks.push({ weekStart: start, minutes: Math.round(minutes), questions, accuracy: pct(correct, questions), activeDays });
  }

  // -- when they usually study
  const hourCounts = new Array(24).fill(0);
  for (const a of sortedAttempts) hourCounts[hourIn(a.createdAt, timeZone)]++;
  for (const v of sortedLessons) hourCounts[hourIn(v.createdAt, timeZone)] += Math.max(1, Math.round(lessonMs(v) / 60000));
  const totalHourWeight = hourCounts.reduce((s, n) => s + n, 0);
  let typicalTime: string | null = null;
  if (totalHourWeight >= 20) {
    const bands: [string, number[]][] = [
      ["early mornings (before 9 am)", [5, 6, 7, 8]],
      ["late mornings", [9, 10, 11]],
      ["afternoons, right after school", [12, 13, 14, 15, 16]],
      ["early evenings", [17, 18, 19]],
      ["evenings", [20, 21]],
      ["late at night (after 10 pm)", [22, 23, 0, 1, 2, 3, 4]],
    ];
    const scored = bands.map(([label, hrs]) => [label, hrs.reduce((s, h) => s + hourCounts[h], 0)] as const).sort((a, b) => b[1] - a[1]);
    if (scored[0][1] / totalHourWeight >= 0.4) typicalTime = scored[0][0];
  }

  // -- sessions
  type Ev = { t: number; kind: "q" | "l"; a?: AttemptLike; v?: LessonViewLike };
  const events: Ev[] = [
    ...sortedAttempts.map((a) => ({ t: a.createdAt.getTime(), kind: "q" as const, a })),
    ...sortedLessons.map((v) => ({ t: v.createdAt.getTime(), kind: "l" as const, v })),
  ].sort((x, y) => x.t - y.t);
  const sessions: Session[] = [];
  let cur: (Session & { endT: number; startT: number; skillSet: Set<string>; kindSet: Set<"quiz" | "review" | "lesson"> }) | null = null;
  for (const e of events) {
    const dur = e.kind === "q" ? questionMs(e.a!) : lessonMs(e.v!);
    // Each event is logged when it ends; its work began `dur` earlier.
    const startT = e.t - dur;
    if (!cur || startT - cur.endT > SESSION_GAP_MS) {
      if (cur) sessions.push(cur);
      cur = { start: new Date(startT).toISOString(), minutes: 0, questions: 0, correct: 0, lessonMinutes: 0, subskills: [], kinds: [], endT: e.t, startT, skillSet: new Set(), kindSet: new Set() };
    }
    cur.endT = Math.max(cur.endT, e.t);
    if (e.kind === "q") {
      cur.questions++;
      if (e.a!.correct) cur.correct++;
      cur.skillSet.add(e.a!.subskillId);
      cur.kindSet.add(e.a!.source === "review" ? "review" : "quiz");
    } else {
      cur.lessonMinutes += dur / 60000;
      cur.skillSet.add(e.v!.subskillId);
      cur.kindSet.add("lesson");
    }
  }
  if (cur) sessions.push(cur);
  const finishedSessions: Session[] = sessions
    .map((s) => {
      const x = s as Session & { endT: number; startT: number; skillSet: Set<string>; kindSet: Set<"quiz" | "review" | "lesson"> };
      return {
        start: x.start,
        minutes: Math.max(1, Math.round((x.endT - x.startT) / 60000)),
        questions: x.questions,
        correct: x.correct,
        lessonMinutes: Math.round(x.lessonMinutes),
        subskills: [...x.skillSet].map(skillName),
        kinds: [...x.kindSet],
      };
    })
    .reverse();

  // -- skills
  const progress = progressMapFromRows(input.progressRows, now);
  const thirtyAgo = now.getTime() - 30 * DAY_MS;
  const perSkill = new Map<string, { q: number; c: number; q30: number; c30: number; last: number }>();
  for (const a of sortedAttempts) {
    const s = perSkill.get(a.subskillId) ?? { q: 0, c: 0, q30: 0, c30: 0, last: 0 };
    s.q++;
    if (a.correct) s.c++;
    if (a.createdAt.getTime() >= thirtyAgo) {
      s.q30++;
      if (a.correct) s.c30++;
    }
    s.last = Math.max(s.last, a.createdAt.getTime());
    perSkill.set(a.subskillId, s);
  }
  for (const v of sortedLessons) {
    const s = perSkill.get(v.subskillId) ?? { q: 0, c: 0, q30: 0, c30: 0, last: 0 };
    s.last = Math.max(s.last, v.createdAt.getTime());
    perSkill.set(v.subskillId, s);
  }
  const rowsById = new Map(input.progressRows.map((r) => [r.subskillId, r]));
  const skills: SkillRow[] = ALL_SUBSKILLS.map((s) => {
    const st = perSkill.get(s.id);
    const row = rowsById.get(s.id);
    // Older quiz history predates per-question logging; fall back to the
    // best quiz score so those skills don't read as untouched.
    const legacyAcc = row && row.total > 0 ? Math.round((row.bestScore / row.total) * 100) : null;
    const last = Math.max(st?.last ?? 0, row ? new Date(row.lastAttempt).getTime() : 0);
    return {
      id: s.id,
      name: s.name,
      section: s.section,
      domain: s.domain,
      status: statusOf(progress[s.id]),
      accuracy: st && st.q > 0 ? pct(st.c, st.q) : legacyAcc,
      recentAccuracy: st && st.q30 > 0 ? pct(st.c30, st.q30) : null,
      questions: st?.q ?? 0,
      lastPracticed: last > 0 ? new Date(last).toISOString() : null,
      weight: subskillWeight(s),
    };
  });
  const measured = skills.filter((s) => s.accuracy !== null && (s.questions >= 5 || s.status !== "attempted"));
  const strengths = [...measured]
    .filter((s) => (s.accuracy ?? 0) >= 75 || s.status === "mastered")
    .sort((a, b) => (b.status === "mastered" ? 1 : 0) - (a.status === "mastered" ? 1 : 0) || (b.accuracy ?? 0) - (a.accuracy ?? 0) || b.weight - a.weight)
    .slice(0, 4);
  // Focus: where the points are -- weak accuracy weighted by how much of the
  // test the skill covers, plus anything mastered that's now due a refresher.
  const focus = [...skills]
    .filter((s) => (s.accuracy !== null && s.accuracy < 75 && s.status !== "mastered") || s.status === "due")
    .sort((a, b) => (100 - (b.accuracy ?? 60)) * b.weight - (100 - (a.accuracy ?? 60)) * a.weight)
    .slice(0, 4);

  const mastery = {
    mastered: skills.filter((s) => s.status === "mastered" || s.status === "due").length,
    passed: skills.filter((s) => s.status === "passed").length,
    started: skills.filter((s) => s.status !== "new").length,
    due: skills.filter((s) => s.status === "due").length,
    total: skills.length,
  };

  // -- retention: questions from mixed reviews don't say which skill they
  // test, so accuracy there is the honest measure of what's stuck.
  const recent = sortedAttempts.filter((a) => a.createdAt.getTime() >= thirtyAgo);
  const quiz30 = recent.filter((a) => a.source !== "review");
  const review30 = recent.filter((a) => a.source === "review");
  const retention = {
    quizAccuracy: pct(quiz30.filter((a) => a.correct).length, quiz30.length),
    reviewAccuracy: pct(review30.filter((a) => a.correct).length, review30.length),
    reviewQuestions: review30.length,
  };

  // -- confidence calibration
  const confidence: ConfidenceRow[] = (["sure", "unsure", "guessed"] as const).map((level) => {
    const xs = recent.filter((a) => a.confidence === level);
    return { level, count: xs.length, accuracy: pct(xs.filter((a) => a.correct).length, xs.length) };
  });
  const confidentlyWrong = recent.filter((a) => a.confidence === "sure" && !a.correct).length;
  const luckyGuesses = recent.filter((a) => a.confidence === "guessed" && a.correct).length;

  // -- pace
  const pace: PaceRow[] = Object.entries(PACE_SECONDS).map(([section, target]) => {
    const xs = recent.filter((a) => a.ms !== null && getSubskill(a.subskillId)?.section === section);
    const secs = xs.map((a) => Math.min(a.ms!, MAX_QUESTION_MS) / 1000);
    const rushed = xs.filter((a) => a.ms! / 1000 < target * 0.4);
    const steady = xs.filter((a) => a.ms! / 1000 >= target * 0.4);
    return {
      section,
      avgSeconds: secs.length ? Math.round(secs.reduce((s, n) => s + n, 0) / secs.length) : null,
      targetSeconds: target,
      rushedShare: pct(rushed.length, xs.length),
      rushedAccuracy: pct(rushed.filter((a) => a.correct).length, rushed.length),
      steadyAccuracy: pct(steady.filter((a) => a.correct).length, steady.length),
    };
  });

  // -- recurring mistakes: the lesson trap behind each wrong answer
  const trapCounts = new Map<string, TrapRow>();
  for (const a of recent) {
    if (a.correct) continue;
    const item = getItem(a.itemId);
    if (!item) continue;
    const t = trapFor(item, a.choice);
    if (!t) continue;
    const key = `${a.subskillId}|${t}`;
    const row = trapCounts.get(key) ?? { trap: t, skill: skillName(a.subskillId), count: 0 };
    row.count++;
    trapCounts.set(key, row);
  }
  const traps = [...trapCounts.values()].filter((t) => t.count >= 2).sort((a, b) => b.count - a.count).slice(0, 5);

  // -- activity feed
  const feed: FeedEvent[] = [];
  for (const r of input.progressRows) {
    const name = skillName(r.subskillId);
    if (r.masteredAt) feed.push({ at: new Date(r.masteredAt).toISOString(), kind: "mastered", title: `Mastered ${name}`, detail: "Answered it correctly in a mixed review, with nothing saying which skill was being tested." });
    if (r.passedAt) feed.push({ at: new Date(r.passedAt).toISOString(), kind: "passed", title: `Passed the ${name} quiz`, detail: "A perfect score. Mastery comes when it's answered right again later, mixed in with other skills." });
  }
  // One entry per quiz or review sitting: consecutive answers of the same
  // source (and, for quizzes, the same skill) within 30 minutes.
  let group: { source: string; skill: string; start: number; end: number; q: number; c: number } | null = null;
  const flush = () => {
    if (!group || group.q < 3) return;
    const score = `${group.c}/${group.q} correct (${pct(group.c, group.q)}%)`;
    if (group.source === "review") feed.push({ at: new Date(group.end).toISOString(), kind: "review", title: "Mixed review", detail: `${score}, across several skills` });
    else feed.push({ at: new Date(group.end).toISOString(), kind: "quiz", title: `${skillName(group.skill)} quiz`, detail: score });
  };
  for (const a of sortedAttempts) {
    const t = a.createdAt.getTime();
    const sameGroup = group && group.source === a.source && (a.source === "review" || group.skill === a.subskillId) && t - group.end < SESSION_GAP_MS;
    if (!sameGroup) {
      flush();
      group = { source: a.source, skill: a.subskillId, start: t, end: t, q: 0, c: 0 };
    }
    group!.q++;
    if (a.correct) group!.c++;
    group!.end = t;
  }
  flush();
  // Lesson reading: one entry per skill per day.
  const lessonByDay = new Map<string, { at: number; ms: number; skill: string }>();
  for (const v of sortedLessons) {
    const k = `${dayKey(v.createdAt, timeZone)}|${v.subskillId}`;
    const e = lessonByDay.get(k) ?? { at: 0, ms: 0, skill: v.subskillId };
    e.at = Math.max(e.at, v.createdAt.getTime());
    e.ms += lessonMs(v);
    lessonByDay.set(k, e);
  }
  for (const e of lessonByDay.values()) {
    const m = Math.round(e.ms / 60000);
    if (m >= 1) feed.push({ at: new Date(e.at).toISOString(), kind: "lesson", title: `Studied the ${skillName(e.skill)} lesson`, detail: `${m} minute${m === 1 ? "" : "s"} reading patterns and worked examples` });
  }
  for (const t of tests) {
    feed.push({ at: t.takenAt.toISOString(), kind: "test", title: `Logged a practice test: ${t.compositeScore}`, detail: `Reading and Writing ${t.rwScore}, Math ${t.mathScore}` });
  }
  feed.sort((a, b) => b.at.localeCompare(a.at));

  // -- last activity
  const lastT = Math.max(
    sortedAttempts.length ? sortedAttempts[sortedAttempts.length - 1].createdAt.getTime() : 0,
    sortedLessons.length ? sortedLessons[sortedLessons.length - 1].createdAt.getTime() : 0,
    student.lastActiveDate ? student.lastActiveDate.getTime() : 0
  );
  const lastActive = lastT > 0 ? new Date(lastT).toISOString() : null;
  let daysSinceActive: number | null = null;
  if (lastT > 0) {
    const lk = dayKey(new Date(lastT), timeZone);
    const [y1, m1, d1] = lk.split("-").map(Number);
    const [y2, m2, d2] = today.split("-").map(Number);
    daysSinceActive = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / DAY_MS);
  }

  const hasActivity = sortedAttempts.length > 0 || sortedLessons.length > 0 || input.progressRows.length > 0;

  // -- verdict
  const { pacing } = input;
  let tone: Tone;
  let headline: string;
  let detail: string;
  const name = input.name;
  if (!hasActivity) {
    tone = "watch";
    headline = `${name} hasn't started yet`;
    detail = "Nothing has been studied so far. The first lesson and quiz take about 20 minutes.";
  } else if (daysSinceActive !== null && daysSinceActive >= 5) {
    tone = "act";
    headline = `No studying in ${daysSinceActive} days`;
    detail = `${name}'s last session was ${daysSinceActive} days ago. Short, regular sessions matter more than long ones; even 15 minutes gets things moving again.`;
  } else if (thisWeek.active >= 4 && pacing.status !== "behind") {
    tone = "good";
    headline = pacing.status === "ahead" ? "Ahead of plan and studying consistently" : "Steady, consistent work";
    detail = `${thisWeek.active} study days and ${thisWeek.minutes} minutes in the last week${thisWeek.accuracy !== null ? `, answering ${thisWeek.accuracy}% correctly` : ""}.`;
  } else if (thisWeek.active >= 2 && pacing.status !== "behind") {
    tone = "good";
    headline = "Steady, with room for more";
    detail = `${thisWeek.active} study days in the last week. Four or more short sessions a week is the rhythm that sticks.`;
  } else if (pacing.status === "behind" && thisWeek.active >= 3) {
    tone = "watch";
    headline = "Studying regularly, but behind the plan";
    detail = `${thisWeek.active} study days last week, but ${Math.abs(pacing.unitsAhead)} skill${Math.abs(pacing.unitsAhead) === 1 ? "" : "s"} behind where the schedule expects by now.`;
  } else {
    tone = pacing.status === "behind" ? "act" : "watch";
    headline = pacing.status === "behind" ? "Falling behind the plan" : "Light week";
    detail = `${thisWeek.active} study day${thisWeek.active === 1 ? "" : "s"} in the last week${pacing.status === "behind" ? `, and ${Math.abs(pacing.unitsAhead)} skill${Math.abs(pacing.unitsAhead) === 1 ? "" : "s"} behind schedule` : ""}.`;
  }

  // -- how a parent can help
  const talkingPoints: TalkingPoint[] = [];
  const weekAgo = now.getTime() - 7 * DAY_MS;
  const justMastered = input.progressRows.filter((r) => r.masteredAt && new Date(r.masteredAt).getTime() >= weekAgo).map((r) => skillName(r.subskillId));
  if (justMastered.length) talkingPoints.push({ kind: "celebrate", text: `Celebrate: ${name} mastered ${justMastered.slice(0, 2).join(" and ")}${justMastered.length > 2 ? ` and ${justMastered.length - 2} more` : ""} this week.` });
  else if (thisWeek.active >= 4) talkingPoints.push({ kind: "celebrate", text: `Say something about the effort: ${thisWeek.active} study days this week is exactly the habit that works.` });
  if (daysSinceActive !== null && daysSinceActive >= 3) talkingPoints.push({ kind: "nudge", text: `It's been ${daysSinceActive} days. Rather than asking whether they studied, try asking what they'll do today; the next item on their plan takes about 20 minutes.` });
  const topFocus = focus.find((s) => s.questions >= 5 && s.accuracy !== null);
  if (topFocus) talkingPoints.push({ kind: "ask", text: `Ask about ${topFocus.name}: ${topFocus.accuracy}% correct over ${topFocus.questions} questions. It's ${Math.round(topFocus.weight * 100 * 10) / 10}% of the test, so it's worth a second pass through the lesson's worked examples.` });
  if (traps[0]) talkingPoints.push({ kind: "ask", text: `A mistake that keeps coming back in ${traps[0].skill}: "${traps[0].trap}" (${traps[0].count} times this month). Asking them to explain it back to you is one of the best ways to fix it.` });
  const guessed = confidence.find((c) => c.level === "guessed")!;
  const answered = confidence.reduce((s, c) => s + c.count, 0);
  if (answered >= 20 && guessed.count / answered >= 0.2) talkingPoints.push({ kind: "ask", text: `${Math.round((guessed.count / answered) * 100)}% of answers this month were marked as guesses. That's honest and useful; those questions come back in mixed review until they're solid.` });
  const rushedMath = pace.find((p) => p.section === "Math");
  if (rushedMath && rushedMath.rushedShare !== null && rushedMath.rushedShare >= 30 && rushedMath.rushedAccuracy !== null && rushedMath.steadyAccuracy !== null && rushedMath.rushedAccuracy + 10 < rushedMath.steadyAccuracy) {
    talkingPoints.push({ kind: "ask", text: `Rushing costs points in Math: quick answers are right ${rushedMath.rushedAccuracy}% of the time versus ${rushedMath.steadyAccuracy}% when they take their time.` });
  }
  if (input.daysUntilTest !== null && input.daysUntilTest > 0 && input.daysUntilTest <= 60) talkingPoints.push({ kind: "plan", text: `${input.daysUntilTest} days until the SAT. A full-length practice test every two weeks from here keeps test day familiar.` });
  if (pacing.status === "behind" && Math.abs(pacing.unitsAhead) >= 2) talkingPoints.push({ kind: "plan", text: `${Math.abs(pacing.unitsAhead)} skills behind schedule. Two extra 20-minute sessions a week closes that gap in about a month.` });

  return {
    name,
    generatedAt: now.toISOString(),
    timeZone,
    verdict: { tone, headline, detail },
    lastActive,
    daysSinceActive,
    week: {
      minutes: thisWeek.minutes,
      minutesPrev: prevWeek.minutes,
      questions: thisWeek.questions,
      questionsPrev: prevWeek.questions,
      accuracy: thisWeek.accuracy,
      accuracyPrev: prevWeek.accuracy,
      activeDays: thisWeek.active,
      activeDaysPrev: prevWeek.active,
      dayFlags,
    },
    streak: { current: student.currentStreak, longest: student.longestStreak },
    calendar,
    weeks,
    typicalTime,
    sessions: finishedSessions.slice(0, 15),
    feed: feed.slice(0, 30),
    skills,
    strengths,
    focus,
    mastery,
    retention,
    confidence,
    confidentlyWrong,
    luckyGuesses,
    pace,
    traps,
    scores: {
      tests: [...tests]
        .sort((a, b) => a.takenAt.getTime() - b.takenAt.getTime())
        .map((t) => ({ id: t.id, takenAt: t.takenAt.toISOString(), composite: t.compositeScore, rw: t.rwScore, math: t.mathScore })),
      baseline: student.baselineScore,
      goal: student.goalScore,
      daysUntilTest: input.daysUntilTest,
      targetTestDate: student.targetTestDate ? student.targetTestDate.toISOString() : null,
    },
    plan: { pacing, thisWeek: input.thisWeekPlan },
    talkingPoints: talkingPoints.slice(0, 5),
    hasActivity,
  };
}
