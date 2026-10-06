import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { PET_NAME, shouldNudge } from "@/lib/pet";
import { sendTrialReminders } from "@/lib/trialReminder";
import { sendParentReports } from "@/lib/parentReportSend";
import { runEncourage } from "@/lib/encourage/send";
import { ENCOURAGE_EMAILS_ON } from "@/lib/encourage/config";
import { unsubscribeLinks } from "@/lib/encourage/unsubscribe";

// The morning job, once a day (see vercel.json). The plan allows only two
// cron jobs, so this one carries everything that belongs to the morning:
//   - the "free trial ends tomorrow" emails (lib/trialReminder.ts)
//   - the daily morning emails to students and parents (lib/encourage)
//   - on Sundays, the weekly parent report (lib/parentReportSend.ts)
//   - the one gentle "Ozho is cold" email a few days into a break, for
//     as long as the daily emails are off (once they're on, the morning
//     email says it instead)
// The other job (app/api/cron/nudge) is the mid-afternoon reminder.
// Protected by CRON_SECRET so the endpoint can't be triggered by anyone who
// finds the URL -- if that env var isn't set, the route refuses all
// requests rather than silently running unauthenticated.
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();
  const users = await prisma.user.findMany({
    select: { id: true, email: true, lastActiveDate: true, petBornAt: true, petWarningEmailSentAt: true, encourageEmails: true },
  });

  let nudged = 0;
  for (const user of users) {
    const alreadyToday = user.petWarningEmailSentAt && user.petWarningEmailSentAt.toDateString() === now.toDateString();
    // Not for anyone who turned encouragement emails off, and not once the
    // daily emails are on (the morning one covers it).
    if (ENCOURAGE_EMAILS_ON || !user.encourageEmails) continue;
    if (alreadyToday || !shouldNudge(user.lastActiveDate, user.petBornAt, now)) continue;
    await prisma.user.update({ where: { id: user.id }, data: { petWarningEmailSentAt: now } });
    const links = await unsubscribeLinks({ who: "student", id: user.id });
    await sendEmail({ to: user.email, subject: `${PET_NAME} is cold without you`, html: nudgeEmailHtml(links.url), headers: links.headers });
    nudged++;
  }

  const trialReminders = await sendTrialReminders(now);
  // Sunday: the weekly parent report. Before the daily emails, so a slow
  // day never squeezes it out.
  const parentReports = now.getUTCDay() === 0 ? await sendParentReports(now).catch((e) => ({ error: String(e) })) : null;
  const encourage = await runEncourage("morning", now, { budgetMs: 150_000 }).catch((e) => ({ error: String(e) }));

  return NextResponse.json({ ok: true, checked: users.length, nudged, trialReminders, parentReports, encourage });
}

// Falls back to the known production URL so emails still link somewhere
// sensible if APP_URL isn't set, but prefers the env var so this keeps
// working if the domain ever changes.
const APP_URL = process.env.APP_URL || "https://oakmontsat.com";

function nudgeEmailHtml(unsubscribeUrl: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1f2f5a;">${PET_NAME} is cold without you</h2>
      <p style="color: #3b4763;">It's been a few days since your last session, and ${PET_NAME} has gone a bit blue and shivery. One lesson or a quick quiz warms him right up, and your plan picks up right where you left off.</p>
      <p><a href="${APP_URL}/dashboard" style="display: inline-block; background:#3461c1; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Open Oakmont</a></p>
      <p style="color: #7f8aa6; font-size: 12px;"><a href="${unsubscribeUrl}" style="color: #7f8aa6;">Turn these emails off</a>.</p>
    </div>
  `;
}
