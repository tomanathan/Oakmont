import { AppShell } from "@/components/AppShell";
import { DashboardSkeleton } from "@/components/PageSkeleton";

export default function Loading() {
  return (
    <AppShell email="" loading wide>
      <DashboardSkeleton />
    </AppShell>
  );
}
