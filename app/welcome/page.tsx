import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { hasActiveAccess } from "@/lib/subscription";
import { upcomingSatDates, weeksUntil } from "@/lib/satDates";
import { ALL_DOMAINS, ALL_SUBSKILLS, NUM_FULL_LENGTH_TESTS, getSubskill } from "@/data/curriculum";
import { computeDomainMastery, orderSubskillsByWeakness } from "@/lib/mastery";
import { progressMapFromRows } from "@/lib/progressState";
import { leadWith } from "@/lib/planOrder";
import { WelcomeClient, type WelcomeStep } from "./WelcomeClient";
import { parentClaimed } from "@/lib/parentAuth";
import { localDayKey } from "@/lib/dateOnly";

const REVISIT_STEPS: WelcomeStep[] = ["name", "date", "score", "parent", "tour"];

// Onboarding. New students land here right after signup, before choosing
// a plan, so goals and parent setup happen while they're most engaged.
// `?step=` reopens a single step later (the dashboard checklist links here).
export default async function WelcomePage({ searchParams }: { searchParams: { step?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [stats, parent, rows, latestTest] = await Promise.all([
    getUserStats(user.userId),
    prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        parentOptOutAt: true,
        parentLinks: { select: { parent: { select: { id: true, email: true, passwordHash: true, googleSub: true } } }, orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.progress.findMany({ where: { userId: user.userId } }),
    prisma.practiceTest.findFirst({
      where: { userId: user.userId },
      orderBy: [{ takenAt: "desc" }, { createdAt: "desc" }],
      select: { domainScores: true },
    }),
  ]);
  const hasAccess = hasActiveAccess(stats);
  const single = REVISIT_STEPS.find((s) => s === searchParams.step) ?? null;
  if (stats.welcomeSeenAt && !single) redirect(hasAccess ? "/dashboard" : "/subscribe");

  // The plan's own skill order (weakest areas first, led by the skill the
  // starter questions picked out), built the way the dashboard and plan
  // pages build it, so the "Week 1" preview is the week 1 they land on.
  const subskillsByDomain: Record<string, string[]> = {};
  for (const s of ALL_SUBSKILLS) (subskillsByDomain[s.domain] ??= []).push(s.id);
  const domainMastery = computeDomainMastery(
    ALL_DOMAINS,
    subskillsByDomain,
    progressMapFromRows(rows),
    (latestTest?.domainScores as Record<string, number> | null) ?? null
  );
  const planOrder = leadWith(orderSubskillsByWeakness(ALL_SUBSKILLS, domainMastery), stats.firstSkillId);

  const now = new Date();
  return (
    <WelcomeClient
      email={user.email}
      single={single}
      hasAccess={hasAccess}
      initial={{
        firstName: stats.firstName ?? "",
        baselineScore: stats.baselineScore ?? null,
        goalScore: stats.goalScore ?? null,
        targetTestDate: stats.targetTestDate ? stats.targetTestDate.toISOString().slice(0, 10) : null,
      }}
      parents={(parent?.parentLinks ?? []).map((l) => ({ id: l.parent.id, email: l.parent.email, pending: !parentClaimed(l.parent) }))}
      optedOut={!!parent?.parentOptOutAt}
      satDates={upcomingSatDates(now).map((d) => ({ ...d, weeks: weeksUntil(d.date, now) }))}
      // The student's own today, the same day /api/account checks the test date against.
      today={localDayKey(now, stats.timeZone)}
      skills={planOrder.flatMap((id) => {
        const s = getSubskill(id);
        return s ? [{ id: s.id, name: s.name, section: s.section }] : [];
      })}
      practiceTests={NUM_FULL_LENGTH_TESTS}
    />
  );
}
