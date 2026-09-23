import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { getSubskill } from "@/data/curriculum";
import { itemsForSubskill } from "@/lib/items";
import { AppShell } from "@/components/AppShell";
import { SubskillClient } from "./SubskillClient";

export default async function SubskillPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sub = getSubskill(params.id);
  if (!sub) notFound();

  const questions = itemsForSubskill(params.id);
  const stats = await getUserStats(user.userId);
  if (!hasActiveAccess(stats.subscriptionStatus, stats.accessExpiresAt)) redirect("/subscribe");

  return (
    <AppShell email={user.email} stats={stats} wide>
      <SubskillClient subskill={sub} questions={questions} />
    </AppShell>
  );
}
