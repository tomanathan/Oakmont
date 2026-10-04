import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { PET_NAME, shouldNudge } from "@/lib/pet";
import { sendTrialReminders } from "@/lib/trialReminder";

// Runs once a day (see vercel.json). Also sends the "free trial ends
// tomorrow" emails (lib/trialReminder.ts), since the plan allows only two
// cron jobs. The pet check itself sends the one gentle "Ozho misses you"
// email a few days into a break. Ozho never dies (see lib/pet.ts), so
// there's nothing else to do here. Protected by CRON_SECRET so the endpoint
// can't be triggered by anyone who finds the URL -- if that env var isn't
// set, the route refuses all requests rather than silently running
// unauthenticated.
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
    select: { id: true, email: true, lastActiveDate: true, petBornAt: true, petWarningEmailSentAt: true },
  });

  let nudged = 0;
  for (const user of users) {
    const alreadyToday = user.petWarningEmailSentAt && user.petWarningEmailSentAt.toDateString() === now.toDateString();
    if (alreadyToday || !shouldNudge(user.lastActiveDate, user.petBornAt, now)) continue;
    await prisma.user.update({ where: { id: user.id }, data: { petWarningEmailSentAt: now } });
    await sendEmail({ to: user.email, subject: `${PET_NAME} is cold without you`, html: nudgeEmailHtml() });
    nudged++;
  }

  const trialReminders = await sendTrialReminders(now);

  return NextResponse.json({ ok: true, checked: users.length, nudged, trialReminders });
}

// Falls back to the known production URL so emails still link somewhere
// sensible if APP_URL isn't set, but prefers the env var so this keeps
// working if the domain ever changes.
const APP_URL = process.env.APP_URL || "https://oakmontsat.com";

function nudgeEmailHtml(): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">${PET_NAME} is cold without you</h2>
      <p style="color: #444;">It's been a few days since your last session, and ${PET_NAME} has gone a bit blue and shivery. One lesson or a quick quiz warms him right up, and your plan picks up right where you left off.</p>
      <p><a href="${APP_URL}/dashboard" style="display: inline-block; background: #1a1a2e; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Open Oakmont</a></p>
    </div>
  `;
}
