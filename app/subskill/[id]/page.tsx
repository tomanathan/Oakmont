import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { getSubskill } from "@/data/curriculum";
import { QUESTIONS } from "@/data/questions";
import { AppShell } from "@/components/AppShell";
import { SubskillClient } from "./SubskillClient";

export default async function SubskillPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sub = getSubskill(params.id);
  if (!sub) notFound();

  const questions = QUESTIONS[params.id] || [];
  const stats = await getUserStats(user.userId);

  return (
    <AppShell email={user.email} stats={stats}>
      <SubskillClient subskill={sub} questions={questions} />
    </AppShell>
  );
}
