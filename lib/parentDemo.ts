import { buildParentReport, type AttemptLike, type LessonViewLike } from "@/lib/parentInsights";
import { itemsForSubskill } from "@/lib/items";
import { ALL_SUBSKILLS } from "@/data/curriculum";

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// A sample student ("Maya", invented) for the parent-report demo on the
// homepage. Deterministic: the same seeded history every time, laid out
// relative to `now` so it always reads as current.
export function sampleParentReport(now: Date = new Date(), mode?: "idle") {
  const searchParams = { mode };
  const r = rng(7);
  const attempts: AttemptLike[] = [];
  const lessons: LessonViewLike[] = [];
  const skillsInOrder = ALL_SUBSKILLS.slice(0, 16);
  const gap = searchParams.mode === "idle" ? 7 : 0;
  for (let dBack = 75; dBack >= gap; dBack--) {
    const weekday = (now.getDay() - dBack + 700) % 7;
    // The latest week reads as a student hitting their stride (more days,
    // a bit more accurate) against a patchier week before it, whatever
    // weekday it happens to be viewed on.
    const p = dBack < 7 ? 0.95 : dBack < 14 ? 0.5 : weekday === 0 || weekday === 6 ? 0.35 : 0.7;
    if (r() > p || (dBack > 40 && dBack < 46)) continue;
    const day = new Date(now.getTime() - dBack * 86400000);
    day.setHours(19 + Math.floor(r() * 3), Math.floor(r() * 60), 0, 0);
    if (day.getTime() > now.getTime() - 3600000) continue; // nothing in the future
    let t = day.getTime();
    const skill = skillsInOrder[Math.min(skillsInOrder.length - 1, Math.floor((75 - dBack) / 5))];
    if (r() < 0.6) {
      const ms = (6 + r() * 14) * 60000;
      t += ms;
      lessons.push({ subskillId: skill.id, ms, createdAt: new Date(t) });
    }
    const review = r() < 0.3;
    const n = 8 + Math.floor(r() * 10);
    for (let i = 0; i < n; i++) {
      const s = review ? skillsInOrder[Math.floor(r() * Math.max(1, Math.floor((75 - dBack) / 5)))] ?? skill : skill;
      const items = itemsForSubskill(s.id);
      const item = items[Math.floor(r() * items.length)];
      const base = s.section === "Math" ? 95 : 71;
      const ms = base * 1000 * (0.25 + r() * 1.3);
      const rushed = ms < base * 400;
      const skillBias = s.id.includes("boundaries") || s.id.includes("inference") ? -0.25 : 0;
      const correct = r() < 0.72 + skillBias - (rushed ? 0.2 : 0) + (75 - dBack) * 0.002 + (dBack < 7 ? 0.09 : dBack < 14 ? -0.06 : 0);
      const wrongChoices = item.choices.map((_, k) => k).filter((k) => k !== item.answer);
      const choice = correct ? item.answer : wrongChoices[Math.floor(r() * wrongChoices.length)];
      const cr = r();
      const confidence = correct ? (cr < 0.7 ? "sure" : cr < 0.9 ? "unsure" : "guessed") : cr < 0.35 ? "sure" : cr < 0.7 ? "unsure" : "guessed";
      t += ms;
      attempts.push({ subskillId: s.id, itemId: item.id, source: review ? "review" : "quiz", correct, choice, confidence, ms, createdAt: new Date(t) });
    }
  }
  const progressRows = skillsInOrder.slice(0, 13).map((s, i) => ({
    subskillId: s.id,
    bestScore: i < 9 ? 15 : 11,
    total: 15,
    lastAttempt: new Date(now.getTime() - (70 - i * 5) * 86400000),
    passedAt: i < 9 ? new Date(now.getTime() - (68 - i * 5) * 86400000) : null,
    masteredAt: i < 6 ? new Date(now.getTime() - (60 - i * 9) * 86400000) : null,
    reviewDueAt: i === 1 ? new Date(now.getTime() - 86400000) : i < 6 ? new Date(now.getTime() + 10 * 86400000) : null,
  }));
  const tests = [
    { id: "t1", takenAt: new Date(now.getTime() - 60 * 86400000), compositeScore: 1180, rwScore: 600, mathScore: 580 },
    { id: "t2", takenAt: new Date(now.getTime() - 32 * 86400000), compositeScore: 1230, rwScore: 620, mathScore: 610 },
    { id: "t3", takenAt: new Date(now.getTime() - 6 * 86400000), compositeScore: 1290, rwScore: 650, mathScore: 640 },
  ];
  const report = buildParentReport({
    now,
    timeZone: "America/New_York",
    name: "Maya",
    student: { createdAt: new Date(now.getTime() - 80 * 86400000), currentStreak: gap ? 0 : 4, longestStreak: 11, lastActiveDate: null, baselineScore: 1120, goalScore: 1400, targetTestDate: new Date(now.getTime() + 51 * 86400000) },
    attempts,
    lessonViews: lessons,
    progressRows,
    tests,
    pacing: { totalUnits: 29, completedUnits: 9, dayOfCourse: 80, totalDays: 131, totalWeeks: 19, pctExpected: 61, pctComplete: 31, unitsAhead: -3, status: gap ? "behind" : "onTrack" },
    thisWeekPlan: { done: 1, total: 2 },
    daysUntilTest: 51,
  });
  return report;
}
