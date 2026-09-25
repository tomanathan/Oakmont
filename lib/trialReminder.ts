import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { hasPaidAccess } from "./subscription";

const APP_URL = process.env.APP_URL || "https://oakmontsat.com";
const HOUR_MS = 60 * 60 * 1000;

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
    // Mark first, so a failed send is never retried into a duplicate.
    await prisma.user.update({ where: { id: u.id }, data: { trialReminderSentAt: now } });
    if (hasPaidAccess(u, now)) continue;
    const ends = u.trialEndsAt!.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Chicago" });
    const result = await sendEmail({
      to: u.email,
      subject: "Your Oakmont free trial ends tomorrow",
      html: trialEndingHtml(u.firstName, ends),
    });
    if (result.sent) sent++;
  }
  return sent;
}

function trialEndingHtml(firstName: string | null, ends: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">${firstName ? `${escapeHtml(firstName)}, your` : "Your"} free week ends ${ends}</h2>
      <p style="color: #444;">If Oakmont has been helping, choose a plan to keep your study plan, your progress, and Ozho going. Monthly is $25 and cancels anytime; the 6-month pass is one payment of $100.</p>
      <p style="color: #444;">If it isn't for you, there's nothing to do: no card is on file, so nothing will be charged.</p>
      <p><a href="${APP_URL}/subscribe" style="display: inline-block; background: #1a1a2e; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Choose a plan</a></p>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
