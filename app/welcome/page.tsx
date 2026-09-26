import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { hasActiveAccess } from "@/lib/subscription";
import { upcomingSatDates, weeksUntil } from "@/lib/satDates";
import { ALL_SUBSKILLS, NUM_FULL_LENGTH_TESTS } from "@/data/curriculum";
import { WelcomeClient, type WelcomeStep } from "./WelcomeClient";
import { parentClaimed } from "@/lib/parentAuth";

const REVISIT_STEPS: WelcomeStep[] = ["name", "date", "score", "parent", "tour"];

// Onboarding. New students land here right after signup, before choosing
// a plan, so goals and parent setup happen while they're most engaged.
// `?step=` reopens a single step later (the dashboard checklist links here).
export default async function WelcomePage({ searchParams }: { searchParams: { step?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [stats, parent] = await Promise.all([
    getUserStats(user.userId),
    prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        parentOptOutAt: true,
        parentLinks: { select: { parent: { select: { id: true, email: true, passwordHash: true, googleSub: true } } }, orderBy: { createdAt: "asc" } },
      },
    }),
  ]);
  const hasAccess = hasActiveAccess(stats);
  const single = REVISIT_STEPS.find((s) => s === searchParams.step) ?? null;
  if (stats.welcomeSeenAt && !single) redirect(hasAccess ? "/dashboard" : "/subscribe");

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
      today={now.toISOString().slice(0, 10)}
      skills={ALL_SUBSKILLS.map((s) => ({ id: s.id, name: s.name, section: s.section }))}
      practiceTests={NUM_FULL_LENGTH_TESTS}
    />
  );
}
