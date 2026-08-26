import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { AppShell } from "@/components/AppShell";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const stats = await getUserStats(user.userId);

  return (
    <AppShell email={user.email} stats={stats}>
      <SettingsClient
        email={user.email}
        baselineScore={stats.baselineScore}
        goalScore={stats.goalScore}
        targetTestDate={stats.targetTestDate ? stats.targetTestDate.toISOString().slice(0, 10) : null}
      />
    </AppShell>
  );
}
