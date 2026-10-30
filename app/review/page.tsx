import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { AppShell } from "@/components/AppShell";
import { getSubskill } from "@/data/curriculum";
import { ReviewClient } from "./ReviewClient";

export const metadata = { title: "Mixed review — Oakmont Study Center" };

export default async function ReviewPage({ searchParams }: { searchParams: { warmup?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const stats = await getUserStats(user.userId);
  if (!hasActiveAccess(stats)) redirect("/subscribe");

  // ?warmup=<subskill>: the short warm-up before that lesson.
  const lesson = searchParams.warmup ? getSubskill(searchParams.warmup) : null;

  return (
    <AppShell email={user.email} stats={stats}>
      <ReviewClient warmup={lesson ? { id: lesson.id, name: lesson.name } : null} />
    </AppShell>
  );
}
