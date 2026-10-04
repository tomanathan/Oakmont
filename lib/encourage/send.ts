import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { computePetState } from "@/lib/pet";
import { hasActiveAccess } from "@/lib/subscription";
import { utcDayDiff } from "@/lib/dateOnly";
import { displayName } from "@/lib/parentReportData";
import { parentClaimed } from "@/lib/parentAuth";
import { todayPlanFor, type TodayPlan } from "@/lib/todayPlan";
import { DAILY_UNTIL_DAYS, ENCOURAGE_EMAILS_ON, NEW_ACCOUNT_QUIET_HOURS, NUDGE_WITHIN_DAYS, STOP_AFTER_DAYS } from "./config";
import { parentMorning, parentNudge, studentMorning, studentNudge, type KidCtx, type StudentCtx } from "./templates";
import { unsubscribeLinks } from "./unsubscribe";

// Works out who gets which daily email and sends them. Two slots, each run
// once a day by a cron job (see vercel.json):
//   "morning": every eligible student and parent
//   "nudge":   mid-afternoon, only where the student hasn't studied yet
// Every send is stamped first, so a retried run never doubles up.

export type Slot = "morning" | "nudge";

export interface EncourageResult {
  on: boolean;
  slot: Slot;
  students: number;
  parents: number;
  failed: number;
  // Ran out of time before finishing (the rest go out on the next run).
  cutShort: boolean;
}

const sameUtcDay = (a: Date | null, b: Date) => !!a && utcDayDiff(a, b) === 0;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Daily while they're active, twice a week when they've gone quiet, then not at all. */
function dueToday(daysInactive: number, now: Date): boolean {
  if (daysInactive <= DAILY_UNTIL_DAYS) return true;
  if (daysInactive <= STOP_AFTER_DAYS) return now.getUTCDay() === 1 || now.getUTCDay() === 4;
  return false;
}

/**
 * `dryRun` counts who would be emailed without sending or stamping anything
 * (and regardless of the on/off switch), for the admin page.
 */
export async function runEncourage(slot: Slot, now: Date = new Date(), opts: { dryRun?: boolean; budgetMs?: number } = {}): Promise<EncourageResult> {
  const result: EncourageResult = { on: ENCOURAGE_EMAILS_ON, slot, students: 0, parents: 0, failed: 0, cutShort: false };
  if (!ENCOURAGE_EMAILS_ON && !opts.dryRun) return result;
  const started = Date.now();
  const budget = opts.budgetMs ?? 230_000;

  const all = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      createdAt: true,
      targetTestDate: true,
      firstSkillId: true,
      lastActiveDate: true,
      petBornAt: true,
      currentStreak: true,
      subscriptionStatus: true,
      accessExpiresAt: true,
      trialEndsAt: true,
      encourageEmails: true,
      lastMorningEmailAt: true,
      lastNudgeEmailAt: true,
    },
  });
  // Only students who can actually open the lesson the email points to.
  const students = all.filter((u) => hasActiveAccess(u, now));
  const ids = students.map((u) => u.id);
  if (ids.length === 0) return result;

  const dayAgo = new Date(now.getTime() - 24 * 3600 * 1000);
  const [progress, tests, attempts, lessons] = await Promise.all([
    prisma.progress.findMany({ where: { userId: { in: ids } } }),
    prisma.practiceTest.findMany({ where: { userId: { in: ids } }, orderBy: { takenAt: "desc" }, select: { userId: true, domainScores: true } }),
    prisma.itemAttempt.groupBy({ by: ["userId", "correct"], where: { userId: { in: ids }, createdAt: { gte: dayAgo } }, _count: { _all: true }, _sum: { ms: true } }),
    prisma.lessonView.groupBy({ by: ["userId"], where: { userId: { in: ids }, createdAt: { gte: dayAgo } }, _count: { _all: true }, _sum: { ms: true } }),
  ]);
  const progressBy = new Map<string, typeof progress>();
  for (const row of progress) progressBy.set(row.userId, [...(progressBy.get(row.userId) ?? []), row]);
  const scoresBy = new Map<string, Record<string, number> | null>();
  for (const t of tests) if (!scoresBy.has(t.userId)) scoresBy.set(t.userId, (t.domainScores as Record<string, number> | null) ?? null);
  const last24 = new Map<string, { questions: number; correct: number; ms: number; lessons: number }>();
  const day = (id: string) => last24.get(id) ?? last24.set(id, { questions: 0, correct: 0, ms: 0, lessons: 0 }).get(id)!;
  for (const g of attempts) {
    const d = day(g.userId);
    d.questions += g._count._all;
    if (g.correct) d.correct += g._count._all;
    d.ms += g._sum.ms ?? 0;
  }
  for (const g of lessons) {
    const d = day(g.userId);
    d.lessons += g._count._all;
    d.ms += g._sum.ms ?? 0;
  }

  // Everything the templates need about each student, worked out once.
  const facts = new Map<string, { plan: TodayPlan; daysInactive: number; everStudied: boolean; daysToTest: number | null; streak: number }>();
  for (const u of students) {
    const pet = computePetState(u.lastActiveDate, u.petBornAt, now);
    facts.set(u.id, {
      plan: todayPlanFor(u, progressBy.get(u.id) ?? [], scoresBy.get(u.id) ?? null, now),
      daysInactive: pet.daysInactive,
      everStudied: !!u.lastActiveDate,
      daysToTest: u.targetTestDate ? utcDayDiff(now, u.targetTestDate) : null,
      // A streak only counts if it's still alive (studied today or yesterday).
      streak: pet.daysInactive <= 1 ? u.currentStreak : 0,
    });
  }
  const wantsNudge = (f: { daysInactive: number; everStudied: boolean }) => f.everStudied && f.daysInactive >= 1 && f.daysInactive <= NUDGE_WITHIN_DAYS;
  const outOfTime = () => Date.now() - started > budget;

  // ---- students ----
  for (const u of students) {
    if (!u.encourageEmails) continue;
    const f = facts.get(u.id)!;
    const ctx: StudentCtx = { name: u.firstName, streak: f.streak, daysInactive: f.daysInactive, everStudied: f.everStudied, plan: f.plan, daysToTest: f.daysToTest };
    if (slot === "morning") {
      if (!dueToday(f.daysInactive, now) || sameUtcDay(u.lastMorningEmailAt, now)) continue;
      if (now.getTime() - u.createdAt.getTime() < NEW_ACCOUNT_QUIET_HOURS * 3600 * 1000) continue;
    } else if (!wantsNudge(f) || sameUtcDay(u.lastNudgeEmailAt, now)) continue;

    if (opts.dryRun) {
      result.students++;
      continue;
    }
    if (outOfTime()) {
      result.cutShort = true;
      break;
    }
    const links = await unsubscribeLinks({ who: "student", id: u.id });
    const email = slot === "morning" ? studentMorning(ctx, links.url) : studentNudge(ctx, links.url);
    await prisma.user.update({ where: { id: u.id }, data: slot === "morning" ? { lastMorningEmailAt: now } : { lastNudgeEmailAt: now } });
    const res = await sendEmail({ to: u.email, subject: email.subject, html: email.html, headers: links.headers }).catch(() => ({ sent: false }));
    if (res.sent) result.students++;
    else result.failed++;
    await sleep(550); // the mail service allows two sends a second
  }

  // ---- parents (only ones who've set up their account) ----
  const parents = await prisma.parent.findMany({
    where: { dailyEmails: true, links: { some: { studentId: { in: ids } } } },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      googleSub: true,
      lastMorningEmailAt: true,
      lastNudgeEmailAt: true,
      links: { select: { studentId: true, nickname: true, student: { select: { firstName: true, email: true } } } },
    },
  });
  const dayNumber = Math.floor(now.getTime() / 86400000);
  for (const par of parents) {
    if (!parentClaimed(par)) continue;
    if (sameUtcDay(slot === "morning" ? par.lastMorningEmailAt : par.lastNudgeEmailAt, now)) continue;
    const kids = par.links
      .filter((l) => facts.has(l.studentId))
      .map((l) => {
        const f = facts.get(l.studentId)!;
        const d = last24.get(l.studentId);
        const ctx: KidCtx = {
          name: displayName(l.nickname || l.student.firstName, l.student.email),
          last24: d && d.questions + d.lessons > 0 ? { questions: d.questions, correct: d.correct, lessons: d.lessons, minutes: Math.round(d.ms / 60000) } : null,
          streak: f.streak,
          daysInactive: f.daysInactive,
          everStudied: f.everStudied,
          plan: f.plan,
          daysToTest: f.daysToTest,
        };
        return { id: l.studentId, ctx, f };
      })
      .filter((k) => (slot === "morning" ? dueToday(k.f.daysInactive, now) : wantsNudge(k.f)));
    if (kids.length === 0) continue;

    if (opts.dryRun) {
      result.parents++;
      continue;
    }
    if (outOfTime()) {
      result.cutShort = true;
      break;
    }
    const links = await unsubscribeLinks({ who: "parent", id: par.id });
    // A different suggestion each day, and not the same one for every parent.
    const email = slot === "morning" ? parentMorning(kids, dayNumber + par.id.charCodeAt(par.id.length - 1), links.url) : parentNudge(kids, links.url);
    await prisma.parent.update({ where: { id: par.id }, data: slot === "morning" ? { lastMorningEmailAt: now } : { lastNudgeEmailAt: now } });
    const res = await sendEmail({ to: par.email, subject: email.subject, html: email.html, headers: links.headers }).catch(() => ({ sent: false }));
    if (res.sent) result.parents++;
    else result.failed++;
    await sleep(550);
  }

  return result;
}
