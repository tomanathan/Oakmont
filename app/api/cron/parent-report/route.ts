import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { displayName, loadParentReport } from "@/lib/parentReportData";
import { parentWeeklyEmail } from "@/lib/parentReportEmail";
import { ensureSetupLink } from "@/lib/parentSetup";
import { parentClaimed } from "@/lib/parentAuth";

// Sunday (see vercel.json): each parent with the weekly report on gets one
// email covering all their linked students. Protected by CRON_SECRET like
// the pet check; skips anyone already sent a report in the last 6 days, so
// a retry or manual run never doubles up.
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const now = new Date();
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
  return NextResponse.json({ ok: true, parents: parents.length, sent, failed });
}
