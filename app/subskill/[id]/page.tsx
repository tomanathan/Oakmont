import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { getSubskill } from "@/data/curriculum";
import { itemsForSubskill } from "@/lib/items";
import { pickQuizItems } from "@/lib/quizSet";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { SubskillClient } from "./SubskillClient";

export default async function SubskillPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sub = getSubskill(params.id);
  if (!sub) notFound();

  const [attempts, stats] = await Promise.all([
    prisma.itemAttempt.findMany({
      where: { userId: user.userId, subskillId: params.id },
      select: { itemId: true, correct: true, confidence: true, createdAt: true },
    }),
    getUserStats(user.userId),
  ]);
  if (!hasActiveAccess(stats)) redirect("/subscribe");
  const questions = pickQuizItems(itemsForSubskill(params.id), attempts);

  return (
    <AppShell email={user.email} stats={stats} wide>
      <SubskillClient subskill={sub} questions={questions} />
    </AppShell>
  );
}
