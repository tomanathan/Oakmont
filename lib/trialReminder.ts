import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { hasPaidAccess } from "./subscription";
import { emailParentsAboutPlan } from "./parentSetup";

const APP_URL = process.env.APP_URL || "https://oakmontsat.com";
const HOUR_MS = 60 * 60 * 1000;
const REMINDER_TIME_ZONE = "America/Chicago";

// One email per student, the day before their free week ends, if they
// haven't chosen a plan: what they'd keep, and that nothing happens
// otherwise. Runs from the daily cron (app/api/cron/pet-check), so the
// 36-hour window means each trial is caught exactly once, 12-36 hours out.
export async function sendTrialReminders(now: Date = new Date()): Promise<number> {
  const due = await prisma.user.findMany({
    where: {
      trialReminderSentAt: null,
      trialEndsAt: { gt: now, lte: new Date(now.getTime() + 36 * HOUR_MS) },
    },
    select: { id: true, email: true, firstName: true, trialEndsAt: true, subscriptionStatus: true, accessExpiresAt: true },
  });

  let sent = 0;
  for (const u of due) {
    // One student's failure is logged and skipped; the rest still go out.
    try {
      // Mark first, so a failed send is never retried into a duplicate.
      await prisma.user.update({ where: { id: u.id }, data: { trialReminderSentAt: now } });
      if (hasPaidAccess(u, now)) continue;
      const ends = u.trialEndsAt!.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: REMINDER_TIME_ZONE });
      const result = await sendEmail({
        to: u.email,
        subject: `Your Oakmont free trial ends ${endsWhen(u.trialEndsAt!, now, ends)}`,
        html: trialEndingHtml(u.firstName, ends),
      });
      if (result.sent) sent++;
      // Parents usually pay: every connected parent hears about it too.
      sent += await emailParentsAboutPlan(u.id, "trialEnding", ends);
    } catch (e) {
      console.error(`[trial-reminder] ${u.id}:`, e);
    }
  }
  return sent;
}

// "today" or "tomorrow", by the same calendar the email body's date uses:
// a trial caught 12 hours out can end later the same day. Anything else
// (a run at an odd hour) gets the date itself.
function endsWhen(endsAt: Date, now: Date, ends: string): string {
  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: REMINDER_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const daysOut = Math.round((Date.parse(day(endsAt)) - Date.parse(day(now))) / (24 * HOUR_MS));
  return daysOut === 0 ? "today" : daysOut === 1 ? "tomorrow" : ends;
}

function trialEndingHtml(firstName: string | null, ends: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1f2f5a;">${firstName ? `${escapeHtml(firstName)}, your` : "Your"} free week ends ${ends}</h2>
      <p style="color: #3b4763;">If Oakmont has been helping, choose a plan to keep your study plan, your progress, and Ozho going. Monthly is $14.99 and cancels anytime; the 6-month pass is one payment of $69.99.</p>
      <p style="color: #3b4763;">If it isn't for you, there's nothing to do: no card is on file, so nothing will be charged.</p>
      <p><a href="${APP_URL}/subscribe" style="display: inline-block; background:#3461c1; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Choose a plan</a></p>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
