import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats, shellStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { planWeekOf, weeksInARow } from "@/lib/weeklyReview";
import { ReviewClient } from "./ReviewClient";

export const metadata = { title: "Mixed review — Oakmont Study Center" };

export default async function ReviewPage({ searchParams }: { searchParams: { weekly?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // ?weekly=1: this week's weekly review, which also needs the weeks
  // already reviewed -- read alongside the stats rather than after them.
  const [stats, done] = await Promise.all([
    getUserStats(user.userId),
    searchParams.weekly === "1" ? prisma.weeklyReview.findMany({ where: { userId: user.userId }, select: { week: true } }) : null,
  ]);
  if (!hasActiveAccess(stats)) redirect("/subscribe");

  let weekly: { week: number; inARow: number } | null = null;
  if (done) {
    const week = planWeekOf(stats.createdAt ?? new Date());
    // One weekly review per plan week: once it's done, the link is plain
    // mixed review again. (The results screen never comes back through
    // here; see ReviewClient's submit.)
    if (done.some((d) => d.week === week)) redirect("/review");
    weekly = { week, inARow: weeksInARow(done.map((d) => d.week), week) };
  }

  return (
    <AppShell email={user.email} stats={shellStats(stats)}>
      <ReviewClient weekly={weekly} userId={user.userId} />
    </AppShell>
  );
}
