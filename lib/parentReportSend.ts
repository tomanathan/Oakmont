import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { displayName, loadParentReport } from "@/lib/parentReportData";
import { parentWeeklyEmail } from "@/lib/parentReportEmail";
import { ensureSetupLink } from "@/lib/parentSetup";
import { parentClaimed } from "@/lib/parentAuth";

// The Sunday report: each parent with the weekly report on gets one email
// covering all their linked students. Skips anyone already sent a report
// in the last 6 days, so a retry or manual run never doubles up. Called by
// the morning cron on Sundays (app/api/cron/pet-check) and by
// app/api/cron/parent-report for a manual run.
export async function sendParentReports(now: Date = new Date()): Promise<{ parents: number; sent: number; failed: number }> {
  const cutoff = new Date(now.getTime() - 6 * 86400000);
  const parents = await prisma.parent.findMany({
    where: { weeklyReport: true, links: { some: {} }, OR: [{ lastReportSentAt: null }, { lastReportSentAt: { lt: cutoff } }] },
    select: { id: true, email: true, timeZone: true, passwordHash: true, googleSub: true, setupToken: true, setupTokenExpires: true, links: { select: { studentId: true, nickname: true, student: { select: { email: true, firstName: true } } } } },
  });

  let sent = 0;
  let failed = 0;
  for (const p of parents) {
    try {
      const students = [];
      for (const l of p.links) {
        const report = await loadParentReport(l.studentId, { name: displayName(l.nickname || l.student.firstName, l.student.email), timeZone: p.timeZone, now });
        students.push({ id: l.studentId, report });
      }
      // Not set up yet: the email carries a fresh set-password link.
      const setupUrl = parentClaimed(p) ? undefined : await ensureSetupLink(p);
      const { subject, html } = parentWeeklyEmail(students, { setupUrl });
      const res = await sendEmail({ to: p.email, subject, html });
      if (res.sent) {
        await prisma.parent.update({ where: { id: p.id }, data: { lastReportSentAt: now } });
        sent++;
      } else failed++;
    } catch (e) {
      console.error(`[parent-report] ${p.id}:`, e);
      failed++;
    }
  }
  return { parents: parents.length, sent, failed };
}
