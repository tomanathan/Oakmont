import { AppShell } from "@/components/AppShell";
import { StackSkeleton } from "@/components/PageSkeleton";

export default function Loading() {
  return (
    <AppShell email="" loading wide>
      <StackSkeleton />
    </AppShell>
  );
}
