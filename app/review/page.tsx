import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";
import { AppShell } from "@/components/AppShell";
import { ReviewClient } from "./ReviewClient";

export const metadata = { title: "Mixed review — Oakmont Study Center" };

export default async function ReviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const stats = await getUserStats(user.userId);
  if (!hasActiveAccess(stats)) redirect("/subscribe");

  return (
    <AppShell email={user.email} stats={stats}>
      <ReviewClient />
    </AppShell>
  );
}
