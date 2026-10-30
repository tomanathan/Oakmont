import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { planWeekOf, weeksInARow } from "@/lib/weeklyReview";
import { ReviewClient } from "./ReviewClient";

export const metadata = { title: "Mixed review — Oakmont Study Center" };

export default async function ReviewPage({ searchParams }: { searchParams: { weekly?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const stats = await getUserStats(user.userId);
  if (!hasActiveAccess(stats)) redirect("/subscribe");

  // ?weekly=1: this week's weekly review.
  let weekly: { week: number; inARow: number } | null = null;
  if (searchParams.weekly === "1") {
    const week = planWeekOf(stats.createdAt ?? new Date());
    const done = await prisma.weeklyReview.findMany({ where: { userId: user.userId }, select: { week: true } });
    weekly = { week, inARow: weeksInARow(done.map((d) => d.week), week) };
  }

  return (
    <AppShell email={user.email} stats={stats}>
      <ReviewClient weekly={weekly} />
    </AppShell>
  );
}
