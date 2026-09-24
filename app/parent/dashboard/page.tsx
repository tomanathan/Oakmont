import { redirect } from "next/navigation";
import { getCurrentParent } from "@/lib/parentSession";
import { prisma } from "@/lib/prisma";
import { displayName, loadParentReport } from "@/lib/parentReportData";
import { ParentShell } from "@/components/ParentShell";
import { ParentReportView } from "@/components/parent/ParentReportView";
import { ParentControls } from "@/components/parent/ParentControls";
import { ConnectStudent } from "@/components/parent/ConnectStudent";

export const dynamic = "force-dynamic";

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: { student?: string; add?: string; name?: string };
}) {
  const session = await getCurrentParent();
  if (!session) redirect("/parent/login");

  const [account, links] = await Promise.all([
    prisma.parent.findUnique({ where: { id: session.parentId }, select: { timeZone: true, weeklyReport: true } }),
    prisma.parentLink.findMany({
      where: { parentId: session.parentId },
      include: { student: { select: { id: true, email: true, firstName: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  if (!account) redirect("/parent/login");

  const students = links.map((l) => ({ id: l.studentId, name: displayName(l.nickname || l.student.firstName, l.student.email) }));

  if (links.length === 0 || searchParams.add) {
    return (
      <ParentShell parentEmail={session.email} students={students} activeStudentId="">
        <ConnectStudent initialName={searchParams.name ?? ""} />
      </ParentShell>
    );
  }

  const active = links.find((l) => l.studentId === searchParams.student) ?? links[0];
  const name = displayName(active.nickname || active.student.firstName, active.student.email);
  const report = await loadParentReport(active.studentId, { name, timeZone: account.timeZone });

  return (
    <ParentShell parentEmail={session.email} students={students} activeStudentId={active.studentId}>
      <ParentReportView
        report={report}
        headerExtra={
          <ParentControls linkId={active.id} nickname={active.nickname} weeklyReport={account.weeklyReport} savedTimeZone={account.timeZone} />
        }
        footer={
          <p className="text-center text-[12px] leading-relaxed text-gray-400">
            {name} approved sharing this report and can see that it&apos;s on in their Settings. It&apos;s read-only: nothing you do here
            changes their account. Times are shown in {report.timeZone.replace(/_/g, " ")}.
          </p>
        }
      />
    </ParentShell>
  );
}
