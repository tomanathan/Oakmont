import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats, shellStats } from "@/lib/user";
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
  const bank = itemsForSubskill(params.id);
  const questions = pickQuizItems(bank, attempts);

  return (
    <AppShell email={user.email} stats={shellStats(stats)} wide>
      {/* The bank's current ids (ids only, they're short) let the page drop
          a saved draft that holds a question since reworded; the user id
          keeps drafts apart on a shared computer. */}
      <SubskillClient subskill={sub} questions={questions} userId={user.userId} validItemIds={bank.map((q) => q.id)} />
    </AppShell>
  );
}
