import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getUserStats } from "@/lib/user";
import { hasActiveAccess } from "@/lib/subscription";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const stats = await getUserStats(user.userId);
  if (!hasActiveAccess(stats.subscriptionStatus, stats.accessExpiresAt)) redirect("/subscribe");

  redirect("/dashboard");
}
