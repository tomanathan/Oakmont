import { prisma } from "@/lib/prisma";
import { ALL_SUBSKILLS, getSubskill } from "@/data/curriculum";
import { computePetState, type PetStage } from "@/lib/pet";

// Everything the admin pages read, loaded and shaped here so the views get
// plain rows (and so no password hash, token or Stripe secret ever leaves
// the server: only "has one / doesn't" flags do).

const DAY = 24 * 60 * 60 * 1000;

export interface ParentOfStudent {
  id: string;
  email: string;
  setUp: boolean;
  linkedAt: Date;
  nickname: string | null;
}

export interface StudentRow {
  id: string;
  email: string;
  firstName: string | null;
  createdAt: Date;
  hasPassword: boolean;
  hasGoogle: boolean;
  viaStart: boolean; // came in through the /start questions
  starter: { correct: number; total: number } | null;
  welcomeSeenAt: Date | null;
  lastLoginAt: Date | null;
  // billing
  subscriptionStatus: string | null;
  accessExpiresAt: Date | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  firstPaidAt: Date | null;
  hasStripe: boolean;
  // goals
  goalScore: number | null;
  baselineScore: number | null;
  targetTestDate: Date | null;
  // study
  firstStudiedAt: Date | null;
  lastActiveDate: Date | null;
  currentStreak: number;
  longestStreak: number;
  daysStudied: number;
  petStage: PetStage;
  questions: number;
  correct: number;
  questionMs: number;
  lessons: number;
  lessonMs: number;
  skillsPassed: number;
  skillsMastered: number;
  tests: number;
  latestTest: number | null;
  bestTest: number | null;
  // parents
  parents: ParentOfStudent[];
  parentInviteEmails: number;
}

export interface ParentRow {
  id: string;
  email: string;
  createdAt: Date;
  setUp: "Google" | "Password" | "Both" | "Not set up";
  setupEmailSentAt: Date | null;
  timeZone: string | null;
  weeklyReport: boolean;
  lastReportSentAt: Date | null;
  kids: { id: string; name: string | null; email: string; nickname: string | null; linkedAt: Date }[];
  openInvites: number;
}

export interface DayActivity {
  key: string; // YYYY-MM-DD (Central)
  questions: number;
  correct: number;
  lessons: number;
  students: number;
}

export interface AdminData {
  students: StudentRow[];
  parents: ParentRow[];
  activity: { key: string; questions: number; correct: number; lessons: number; students: number }[];
  totals: { questions: number; correct: number; lessons: number; tests: number; studyMs: number };
  // Feedback notes not yet marked handled (/admin/feedback).
  openFeedback: number;
}

const TZ = "America/Chicago";
export const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });

export async function loadAdminData(now: Date = new Date()): Promise<AdminData> {
  const since = new Date(now.getTime() - 30 * DAY);
  const [users, attemptGroups, lessonGroups, tests, parents, recentAttempts, recentLessons, openFeedback] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        createdAt: true,
        passwordHash: true,
        googleSub: true,
        starterResult: true,
        welcomeSeenAt: true,
        lastLoginAt: true,
        subscriptionStatus: true,
        accessExpiresAt: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        firstPaidAt: true,
        stripeCustomerId: true,
        goalScore: true,
        baselineScore: true,
        targetTestDate: true,
        firstStudiedAt: true,
        lastActiveDate: true,
        currentStreak: true,
        longestStreak: true,
        daysStudied: true,
        petBornAt: true,
        parentInviteEmailCount: true,
        progress: { select: { passedAt: true, masteredAt: true } },
        parentLinks: { select: { createdAt: true, nickname: true, parent: { select: { id: true, email: true, passwordHash: true, googleSub: true } } } },
      },
    }),
    prisma.itemAttempt.groupBy({ by: ["userId", "correct"], _count: { _all: true }, _sum: { ms: true } }),
    prisma.lessonView.groupBy({ by: ["userId"], _count: { _all: true }, _sum: { ms: true } }),
    prisma.practiceTest.findMany({ select: { userId: true, compositeScore: true }, orderBy: { takenAt: "asc" } }),
    prisma.parent.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        createdAt: true,
        passwordHash: true,
        googleSub: true,
        setupEmailSentAt: true,
        timeZone: true,
        weeklyReport: true,
        lastReportSentAt: true,
        links: { select: { createdAt: true, nickname: true, student: { select: { id: true, firstName: true, email: true } } } },
        invites: { select: { usedAt: true, expiresAt: true } },
      },
    }),
    prisma.itemAttempt.findMany({ where: { createdAt: { gte: since } }, select: { userId: true, correct: true, createdAt: true }, take: 100000 }),
    prisma.lessonView.findMany({ where: { createdAt: { gte: since } }, select: { userId: true, createdAt: true }, take: 100000 }),
    prisma.feedback.count({ where: { handledAt: null } }),
  ]);

  const att = new Map<string, { n: number; correct: number; ms: number }>();
  for (const g of attemptGroups) {
    const a = att.get(g.userId) ?? { n: 0, correct: 0, ms: 0 };
    a.n += g._count._all;
    if (g.correct) a.correct += g._count._all;
    a.ms += g._sum.ms ?? 0;
    att.set(g.userId, a);
  }
  const les = new Map(lessonGroups.map((g) => [g.userId, { n: g._count._all, ms: g._sum.ms ?? 0 }]));
  const tst = new Map<string, number[]>();
  for (const t of tests) tst.set(t.userId, [...(tst.get(t.userId) ?? []), t.compositeScore]);

  const students: StudentRow[] = users.map((u) => {
    const a = att.get(u.id) ?? { n: 0, correct: 0, ms: 0 };
    const l = les.get(u.id) ?? { n: 0, ms: 0 };
    const scores = tst.get(u.id) ?? [];
    const starter = u.starterResult as { items?: { correct: boolean }[] } | null;
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      createdAt: u.createdAt,
      hasPassword: !!u.passwordHash,
      hasGoogle: !!u.googleSub,
      viaStart: u.starterResult !== null,
      starter: starter?.items ? { correct: starter.items.filter((i) => i.correct).length, total: starter.items.length } : null,
      welcomeSeenAt: u.welcomeSeenAt,
      lastLoginAt: u.lastLoginAt,
      subscriptionStatus: u.subscriptionStatus,
      accessExpiresAt: u.accessExpiresAt,
      trialEndsAt: u.trialEndsAt,
      currentPeriodEnd: u.currentPeriodEnd,
      firstPaidAt: u.firstPaidAt,
      hasStripe: !!u.stripeCustomerId,
      goalScore: u.goalScore,
      baselineScore: u.baselineScore,
      targetTestDate: u.targetTestDate,
      firstStudiedAt: u.firstStudiedAt,
      lastActiveDate: u.lastActiveDate,
      currentStreak: u.currentStreak,
      longestStreak: u.longestStreak,
      daysStudied: u.daysStudied,
      petStage: computePetState(u.lastActiveDate, u.petBornAt, now).stage,
      questions: a.n,
      correct: a.correct,
      questionMs: a.ms,
      lessons: l.n,
      lessonMs: l.ms,
      skillsPassed: u.progress.filter((p) => p.passedAt).length,
      skillsMastered: u.progress.filter((p) => p.masteredAt).length,
      tests: scores.length,
      latestTest: scores.length ? scores[scores.length - 1] : null,
      bestTest: scores.length ? Math.max(...scores) : null,
      parents: u.parentLinks.map((pl) => ({
        id: pl.parent.id,
        email: pl.parent.email,
        setUp: !!pl.parent.passwordHash || !!pl.parent.googleSub,
        linkedAt: pl.createdAt,
        nickname: pl.nickname,
      })),
      parentInviteEmails: u.parentInviteEmailCount,
    };
  });

  const parentRows: ParentRow[] = parents.map((p) => ({
    id: p.id,
    email: p.email,
    createdAt: p.createdAt,
    setUp: p.googleSub && p.passwordHash ? "Both" : p.googleSub ? "Google" : p.passwordHash ? "Password" : "Not set up",
    setupEmailSentAt: p.setupEmailSentAt,
    timeZone: p.timeZone,
    weeklyReport: p.weeklyReport,
    lastReportSentAt: p.lastReportSentAt,
    kids: p.links.map((l) => ({ id: l.student.id, name: l.student.firstName, email: l.student.email, nickname: l.nickname, linkedAt: l.createdAt })),
    openInvites: p.invites.filter((i) => !i.usedAt && i.expiresAt > now).length,
  }));

  // The last 30 days, oldest first.
  const days = new Map<string, { questions: number; correct: number; lessons: number; who: Set<string> }>();
  for (let i = 29; i >= 0; i--) days.set(dayKey(new Date(now.getTime() - i * DAY)), { questions: 0, correct: 0, lessons: 0, who: new Set() });
  for (const r of recentAttempts) {
    const d = days.get(dayKey(r.createdAt));
    if (!d) continue;
    d.questions++;
    if (r.correct) d.correct++;
    d.who.add(r.userId);
  }
  for (const r of recentLessons) {
    const d = days.get(dayKey(r.createdAt));
    if (!d) continue;
    d.lessons++;
    d.who.add(r.userId);
  }

  return {
    students,
    parents: parentRows,
    openFeedback,
    activity: [...days.entries()].map(([key, d]) => ({ key, questions: d.questions, correct: d.correct, lessons: d.lessons, students: d.who.size })),
    totals: {
      questions: students.reduce((s, u) => s + u.questions, 0),
      correct: students.reduce((s, u) => s + u.correct, 0),
      lessons: students.reduce((s, u) => s + u.lessons, 0),
      tests: tests.length,
      studyMs: students.reduce((s, u) => s + u.questionMs + u.lessonMs, 0),
    },
  };
}

// ---------- one student, in full ----------

export interface SkillRow {
  id: string;
  name: string;
  domain: string;
  section: string;
  questions: number;
  correct: number;
  ms: number;
  lessons: number;
  lessonMs: number;
  bestScore: number | null;
  total: number | null;
  quizAttempts: number;
  passedAt: Date | null;
  masteredAt: Date | null;
  reviewDueAt: Date | null;
  lastAttempt: Date | null;
}

export interface StudentDetail {
  row: StudentRow;
  extra: {
    previousLoginAt: Date | null;
    streakFreezes: number;
    equippedCostume: string | null;
    firstSkill: string | null;
    parentOptOutAt: Date | null;
    onboardingChecklistDismissedAt: Date | null;
    passRetakeClaimedAt: Date | null;
    trialReminderSentAt: Date | null;
    parentInviteEmailedAt: Date | null;
    hasInviteCode: boolean;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    petMessage: string;
    daysInactive: number;
  };
  skills: SkillRow[];
  domains: { domain: string; section: string; questions: number; correct: number }[];
  days: { key: string; questions: number; correct: number; lessons: number; ms: number }[]; // last 60, oldest first
  tests: { takenAt: Date; composite: number; rw: number; math: number }[];
  confidence: { label: string; n: number; correct: number }[];
  sources: { label: string; n: number; correct: number }[];
  recent: { at: Date; kind: "question" | "lesson" | "test"; skill: string; detail: string; good: boolean | null }[];
  parents: (ParentOfStudent & { weeklyReport: boolean; lastReportSentAt: Date | null; timeZone: string | null })[];
}

export async function loadStudentDetail(id: string, now: Date = new Date()): Promise<StudentDetail | null> {
  const u = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      createdAt: true,
      passwordHash: true,
      googleSub: true,
      starterResult: true,
      firstSkillId: true,
      welcomeSeenAt: true,
      lastLoginAt: true,
      previousLoginAt: true,
      subscriptionStatus: true,
      accessExpiresAt: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
      firstPaidAt: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      passRetakeClaimedAt: true,
      trialReminderSentAt: true,
      goalScore: true,
      baselineScore: true,
      targetTestDate: true,
      firstStudiedAt: true,
      lastActiveDate: true,
      currentStreak: true,
      longestStreak: true,
      daysStudied: true,
      streakFreezes: true,
      petBornAt: true,
      equippedCostume: true,
      parentOptOutAt: true,
      onboardingChecklistDismissedAt: true,
      parentInviteCode: true,
      parentInviteEmailedAt: true,
      parentInviteEmailCount: true,
      progress: true,
      practiceTests: { orderBy: { takenAt: "asc" }, select: { takenAt: true, compositeScore: true, rwScore: true, mathScore: true } },
      parentLinks: {
        select: {
          createdAt: true,
          nickname: true,
          parent: { select: { id: true, email: true, passwordHash: true, googleSub: true, weeklyReport: true, lastReportSentAt: true, timeZone: true } },
        },
      },
    },
  });
  if (!u) return null;
  const [attempts, lessons] = await Promise.all([
    prisma.itemAttempt.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 20000,
      select: { subskillId: true, source: true, correct: true, confidence: true, ms: true, createdAt: true },
    }),
    prisma.lessonView.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 5000, select: { subskillId: true, ms: true, createdAt: true } }),
  ]);

  const name = (sid: string) => getSubskill(sid)?.name ?? sid;
  const skills = new Map<string, SkillRow>();
  const skill = (sid: string): SkillRow => {
    let s = skills.get(sid);
    if (!s) {
      const meta = getSubskill(sid);
      s = { id: sid, name: meta?.name ?? sid, domain: meta?.domain ?? "Other", section: meta?.section ?? "", questions: 0, correct: 0, ms: 0, lessons: 0, lessonMs: 0, bestScore: null, total: null, quizAttempts: 0, passedAt: null, masteredAt: null, reviewDueAt: null, lastAttempt: null };
      skills.set(sid, s);
    }
    return s;
  };
  const conf = new Map<string, { n: number; correct: number }>();
  const src = new Map<string, { n: number; correct: number }>();
  const days = new Map<string, { questions: number; correct: number; lessons: number; ms: number }>();
  for (let i = 59; i >= 0; i--) days.set(dayKey(new Date(now.getTime() - i * DAY)), { questions: 0, correct: 0, lessons: 0, ms: 0 });
  let correct = 0;
  let questionMs = 0;
  for (const a of attempts) {
    const s = skill(a.subskillId);
    s.questions++;
    s.ms += a.ms ?? 0;
    questionMs += a.ms ?? 0;
    if (a.correct) {
      s.correct++;
      correct++;
    }
    const c = conf.get(a.confidence ?? "not asked") ?? { n: 0, correct: 0 };
    c.n++;
    if (a.correct) c.correct++;
    conf.set(a.confidence ?? "not asked", c);
    const so = src.get(a.source) ?? { n: 0, correct: 0 };
    so.n++;
    if (a.correct) so.correct++;
    src.set(a.source, so);
    const d = days.get(dayKey(a.createdAt));
    if (d) {
      d.questions++;
      d.ms += a.ms ?? 0;
      if (a.correct) d.correct++;
    }
  }
  let lessonMs = 0;
  for (const l of lessons) {
    const s = skill(l.subskillId);
    s.lessons++;
    s.lessonMs += l.ms;
    lessonMs += l.ms;
    const d = days.get(dayKey(l.createdAt));
    if (d) {
      d.lessons++;
      d.ms += l.ms;
    }
  }
  for (const p of u.progress) {
    const s = skill(p.subskillId);
    s.bestScore = p.bestScore;
    s.total = p.total;
    s.quizAttempts = p.attempts;
    s.passedAt = p.passedAt;
    s.masteredAt = p.masteredAt;
    s.reviewDueAt = p.reviewDueAt;
    s.lastAttempt = p.lastAttempt;
  }
  // Curriculum order, touched skills only.
  const order = new Map(ALL_SUBSKILLS.map((s, i) => [s.id, i]));
  const skillRows = [...skills.values()].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
  const domains = new Map<string, { domain: string; section: string; questions: number; correct: number }>();
  for (const s of skillRows) {
    const d = domains.get(s.domain) ?? { domain: s.domain, section: s.section, questions: 0, correct: 0 };
    d.questions += s.questions;
    d.correct += s.correct;
    domains.set(s.domain, d);
  }

  const recent: StudentDetail["recent"] = [
    ...attempts.slice(0, 60).map((a) => ({
      at: a.createdAt,
      kind: "question" as const,
      skill: name(a.subskillId),
      detail: `${a.source === "review" ? "Review" : "Quiz"} question${a.confidence ? `, ${a.confidence}` : ""}${a.ms ? `, ${Math.round(a.ms / 1000)}s` : ""}`,
      good: a.correct,
    })),
    ...lessons.slice(0, 40).map((l) => ({ at: l.createdAt, kind: "lesson" as const, skill: name(l.subskillId), detail: `Read the lesson, ${Math.max(1, Math.round(l.ms / 60000))} min`, good: null })),
    ...u.practiceTests.map((t) => ({ at: t.takenAt, kind: "test" as const, skill: "Practice test", detail: `${t.compositeScore} (R&W ${t.rwScore}, Math ${t.mathScore})`, good: null })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 80);

  const pet = computePetState(u.lastActiveDate, u.petBornAt, now);
  const starter = u.starterResult as { items?: { correct: boolean }[] } | null;
  const scores = u.practiceTests.map((t) => t.compositeScore);
  const parents = u.parentLinks.map((pl) => ({
    id: pl.parent.id,
    email: pl.parent.email,
    setUp: !!pl.parent.passwordHash || !!pl.parent.googleSub,
    linkedAt: pl.createdAt,
    nickname: pl.nickname,
    weeklyReport: pl.parent.weeklyReport,
    lastReportSentAt: pl.parent.lastReportSentAt,
    timeZone: pl.parent.timeZone,
  }));

  return {
    row: {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      createdAt: u.createdAt,
      hasPassword: !!u.passwordHash,
      hasGoogle: !!u.googleSub,
      viaStart: u.starterResult !== null,
      starter: starter?.items ? { correct: starter.items.filter((i) => i.correct).length, total: starter.items.length } : null,
      welcomeSeenAt: u.welcomeSeenAt,
      lastLoginAt: u.lastLoginAt,
      subscriptionStatus: u.subscriptionStatus,
      accessExpiresAt: u.accessExpiresAt,
      trialEndsAt: u.trialEndsAt,
      currentPeriodEnd: u.currentPeriodEnd,
      firstPaidAt: u.firstPaidAt,
      hasStripe: !!u.stripeCustomerId,
      goalScore: u.goalScore,
      baselineScore: u.baselineScore,
      targetTestDate: u.targetTestDate,
      firstStudiedAt: u.firstStudiedAt,
      lastActiveDate: u.lastActiveDate,
      currentStreak: u.currentStreak,
      longestStreak: u.longestStreak,
      daysStudied: u.daysStudied,
      petStage: pet.stage,
      questions: attempts.length,
      correct,
      questionMs,
      lessons: lessons.length,
      lessonMs,
      skillsPassed: u.progress.filter((p) => p.passedAt).length,
      skillsMastered: u.progress.filter((p) => p.masteredAt).length,
      tests: scores.length,
      latestTest: scores.length ? scores[scores.length - 1] : null,
      bestTest: scores.length ? Math.max(...scores) : null,
      parents,
      parentInviteEmails: u.parentInviteEmailCount,
    },
    extra: {
      previousLoginAt: u.previousLoginAt,
      streakFreezes: u.streakFreezes,
      equippedCostume: u.equippedCostume,
      firstSkill: u.firstSkillId ? name(u.firstSkillId) : null,
      parentOptOutAt: u.parentOptOutAt,
      onboardingChecklistDismissedAt: u.onboardingChecklistDismissedAt,
      passRetakeClaimedAt: u.passRetakeClaimedAt,
      trialReminderSentAt: u.trialReminderSentAt,
      parentInviteEmailedAt: u.parentInviteEmailedAt,
      hasInviteCode: !!u.parentInviteCode,
      stripeCustomerId: u.stripeCustomerId,
      stripeSubscriptionId: u.stripeSubscriptionId,
      petMessage: pet.message,
      daysInactive: pet.daysInactive,
    },
    skills: skillRows,
    domains: [...domains.values()],
    days: [...days.entries()].map(([key, d]) => ({ key, ...d })),
    tests: u.practiceTests.map((t) => ({ takenAt: t.takenAt, composite: t.compositeScore, rw: t.rwScore, math: t.mathScore })),
    confidence: ["sure", "unsure", "guessed", "not asked"].filter((k) => conf.has(k)).map((k) => ({ label: k, ...conf.get(k)! })),
    sources: [...src.entries()].map(([label, v]) => ({ label, ...v })),
    recent,
    parents,
  };
}
