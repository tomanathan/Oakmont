import { AppShell } from "@/components/AppShell";
import { LessonSkeleton } from "@/components/PageSkeleton";

export default function Loading() {
  return (
    <AppShell email="" loading wide>
      <LessonSkeleton />
    </AppShell>
  );
}
