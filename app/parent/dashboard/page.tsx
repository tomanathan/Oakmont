import { redirect } from "next/navigation";
import { getCurrentParent } from "@/lib/parentSession";
import { prisma } from "@/lib/prisma";
import { displayName, loadParentReport } from "@/lib/parentReportData";
import { ParentShell } from "@/components/ParentShell";
import { ParentReportView } from "@/components/parent/ParentReportView";
import { ParentControls } from "@/components/parent/ParentControls";
import { ConnectStudent } from "@/components/parent/ConnectStudent";
import { ParentPlanCard, type ParentPlanState } from "@/components/parent/ParentPlanCard";
import { hasPaidAccess, planEnded, trialDaysLeft, trialEnded } from "@/lib/subscription";
import { getPlanPrices, subscriptionCancelsAt } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: { student?: string; add?: string; name?: string };
}) {
  const session = await getCurrentParent();
  if (!session) redirect("/parent/login");

  const [account, links] = await Promise.all([
    prisma.parent.findUnique({ where: { id: session.parentId }, select: { timeZone: true, weeklyReport: true, dailyEmails: true } }),
    prisma.parentLink.findMany({
      where: { parentId: session.parentId },
      include: {
        student: {
          select: { id: true, email: true, firstName: true, subscriptionStatus: true, accessExpiresAt: true, trialEndsAt: true, firstPaidAt: true, stripeSubscriptionId: true, currentPeriodEnd: true },
        },
      },
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
  const st = active.student;
  const now = new Date();
  const dateZone = account.timeZone ?? "America/Chicago";
  // planEnded is checked before trialEnded: that one is also true for a
  // student whose paid plan ran out, and it isn't a free trial that ended.
  const planState: ParentPlanState =
    st.accessExpiresAt && st.accessExpiresAt > now
      ? { kind: "pass", until: st.accessExpiresAt.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: dateZone }) }
      : st.subscriptionStatus === "past_due"
        ? { kind: "pastDue" }
        : hasPaidAccess(st, now)
          ? { kind: "monthly" }
          : trialDaysLeft(st, now) !== null
            ? { kind: "trial", daysLeft: trialDaysLeft(st, now)! }
            : planEnded(st, now)
              ? { kind: "planEnded" }
              : trialEnded(st, now)
                ? { kind: "trialEnded" }
                : { kind: "none" };
  // Both Stripe reads are extras on this page: if either fails, the report
  // still loads (the plan card leaves out the prices, or the cancel date).
  const [report, prices, cancelsAt] = await Promise.all([
    loadParentReport(active.studentId, { name, timeZone: account.timeZone }),
    Promise.resolve()
      .then(() => getPlanPrices())
      .catch((err) => {
        console.error("Couldn't read plan prices from Stripe:", err);
        return null;
      }),
    // A monthly plan canceled in the billing portal stays "active" until the
    // period ends, so the pending cancellation is read live, as in Settings.
    planState.kind === "monthly" && st.stripeSubscriptionId
      ? subscriptionCancelsAt(st.stripeSubscriptionId, st.currentPeriodEnd).catch((err) => {
          console.error("Couldn't read subscription from Stripe:", err);
          return null;
        })
      : null,
  ]);
  if (cancelsAt) planState.cancelsOn = cancelsAt.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: dateZone });

  return (
    <ParentShell parentEmail={session.email} students={students} activeStudentId={active.studentId}>
      <ParentPlanCard
        studentId={active.studentId}
        name={name}
        state={planState}
        prices={prices ? { monthly: prices.monthly.amountCents / 100, sixmonth: prices.sixmonth.amountCents / 100 } : null}
      />
      <ParentReportView
        report={report}
        headerExtra={
          <ParentControls linkId={active.id} nickname={active.nickname} weeklyReport={account.weeklyReport} dailyEmails={account.dailyEmails} savedTimeZone={account.timeZone} />
        }
        footer={
          <p className="text-center text-[12px] leading-relaxed text-stone-600">
            Times are shown in {report.timeZone.replace(/_/g, " ")}.
          </p>
        }
      />
    </ParentShell>
  );
}
