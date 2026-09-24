import crypto from "crypto";
import { prisma } from "./prisma";
import { sendEmail } from "./email";

// Parent accounts a student creates at signup start without a password.
// The parent sets one through an emailed link (/parent/setup?token=...);
// the same link is how any parent resets a forgotten password.

const APP_URL = process.env.APP_URL || "https://oakmontsat.com";
const UNCLAIMED_TTL_MS = 30 * 86400000;
const RESET_TTL_MS = 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function newSetupToken(claimed: boolean): { setupToken: string; setupTokenExpires: Date } {
  return {
    setupToken: crypto.randomBytes(32).toString("base64url"),
    setupTokenExpires: new Date(Date.now() + (claimed ? RESET_TTL_MS : UNCLAIMED_TTL_MS)),
  };
}

export function setupUrl(token: string): string {
  return `${APP_URL}/parent/setup?token=${encodeURIComponent(token)}`;
}

// A current setup link for an unclaimed parent, issuing a fresh token when
// the old one is missing or has under a week left. Used by the Sunday email.
export async function ensureSetupLink(parent: { id: string; setupToken: string | null; setupTokenExpires: Date | null }): Promise<string> {
  if (parent.setupToken && parent.setupTokenExpires && parent.setupTokenExpires.getTime() - Date.now() > 7 * 86400000) {
    return setupUrl(parent.setupToken);
  }
  const t = newSetupToken(false);
  await prisma.parent.update({ where: { id: parent.id }, data: t });
  return setupUrl(t.setupToken);
}

const WHAT_YOU_SEE = [
  "Every study session: when, for how long, and what was covered",
  "All 29 SAT skills, from not started to mastered",
  "Accuracy, pacing, and the mistakes that keep repeating",
  "Practice test scores against the goal",
  "A summary email every Sunday",
];

function shell(inner: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#faf8f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a2e;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6d7fd6;">Oakmont for Parents</div>
  ${inner}
</div></body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">${esc(label)}</a>`;
}

// The email a parent gets when a student adds them at signup (or later).
export function parentAddedEmail({
  studentName,
  claimed,
  token,
}: {
  studentName: string;
  claimed: boolean;
  token: string | null;
}): { subject: string; html: string } {
  const who = esc(studentName);
  const list = `<ul style="font-size:14px;line-height:1.7;color:#4b4b63;padding-left:20px;margin:0 0 20px;">${WHAT_YOU_SEE.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  if (claimed || !token) {
    return {
      subject: `${studentName} connected their Oakmont account to yours`,
      html: shell(`
  <h1 style="font-size:24px;line-height:1.25;margin:10px 0 12px;">${who} is now on your parent dashboard</h1>
  <p style="font-size:15px;line-height:1.6;color:#4b4b63;margin:0 0 20px;">${who} signed up for Oakmont SAT prep and listed you as their parent, so their report is now in your account next to any other students you follow.</p>
  ${button(`${APP_URL}/parent/dashboard`, "Open your dashboard")}
  <p style="font-size:12px;line-height:1.6;color:#8a8aa0;margin:28px 0 0;">Don't recognize this student? Remove them from your dashboard, or reply and we'll help.</p>`),
    };
  }
  const url = setupUrl(token);
  return {
    subject: `${studentName} added you as their parent on Oakmont`,
    html: shell(`
  <h1 style="font-size:24px;line-height:1.25;margin:10px 0 12px;">${who} is studying for the SAT and added you as their parent</h1>
  <p style="font-size:15px;line-height:1.6;color:#4b4b63;margin:0 0 16px;">Your free parent account is ready. Set a password to see a live report of ${who}'s studying:</p>
  ${list}
  ${button(url, "Set your password")}
  <p style="font-size:13px;line-height:1.6;color:#4b4b63;margin:18px 0 0;">The link works for 30 days. Parent accounts are free.</p>
  <p style="font-size:12px;line-height:1.6;color:#8a8aa0;margin:28px 0 0;">Not ${who}'s parent? <a href="${esc(url)}&amp;decline=1" style="color:#4a5bb0;">Remove this account</a> and you won't hear from us again.</p>`),
  };
}

export function parentResetEmail(token: string, claimed: boolean): { subject: string; html: string } {
  return {
    subject: claimed ? "Reset your Oakmont parent password" : "Set up your Oakmont parent account",
    html: shell(`
  <h1 style="font-size:24px;line-height:1.25;margin:10px 0 12px;">${claimed ? "Reset your password" : "Set your password"}</h1>
  <p style="font-size:15px;line-height:1.6;color:#4b4b63;margin:0 0 20px;">Use this link to ${claimed ? "choose a new password" : "finish setting up your parent account"}. It works for ${claimed ? "1 hour" : "30 days"}.</p>
  ${button(setupUrl(token), claimed ? "Choose a new password" : "Set your password")}
  <p style="font-size:12px;line-height:1.6;color:#8a8aa0;margin:28px 0 0;">If you didn't ask for this, you can ignore it.</p>`),
  };
}

// Sends a parent their setup (or reset) link, at most once a minute.
// With a studentName, an unclaimed parent gets the "added you" email again
// (the student resending it); otherwise the plain setup/reset email.
export async function sendParentSetupLink(parentId: string, studentName?: string): Promise<{ sent: boolean; throttled: boolean }> {
  const parent = await prisma.parent.findUnique({ where: { id: parentId } });
  if (!parent) return { sent: false, throttled: false };
  if (parent.setupEmailSentAt && Date.now() - parent.setupEmailSentAt.getTime() < RESEND_COOLDOWN_MS) {
    return { sent: false, throttled: true };
  }
  const claimed = !!parent.passwordHash;
  // An unclaimed parent's long-lived link is reused so an earlier email
  // keeps working; a password reset always gets a fresh, short one.
  const reuse = !claimed && parent.setupToken && parent.setupTokenExpires && parent.setupTokenExpires.getTime() - Date.now() > 7 * 86400000;
  const t = reuse ? { setupToken: parent.setupToken!, setupTokenExpires: parent.setupTokenExpires! } : newSetupToken(claimed);
  await prisma.parent.update({ where: { id: parent.id }, data: { ...t, setupEmailSentAt: new Date() } });
  const { subject, html } =
    studentName && !claimed ? parentAddedEmail({ studentName, claimed, token: t.setupToken }) : parentResetEmail(t.setupToken, claimed);
  const res = await sendEmail({ to: parent.email, subject, html });
  return { sent: res.sent, throttled: false };
}

// A student adding their parent by email: finds or creates the parent's
// account, links it, and emails them. New (and not-yet-set-up) parents get
// a link to set their password; parents who already have an account are
// told the student now appears on their dashboard.
export async function addParentForStudent({
  studentId,
  studentName,
  parentEmail,
  timeZone,
}: {
  studentId: string;
  studentName: string;
  parentEmail: string;
  timeZone: string | null;
}): Promise<{ parentId: string; linkId: string; alreadyLinked: boolean; claimed: boolean; sent: boolean }> {
  let parent = await prisma.parent.findUnique({ where: { email: parentEmail } });
  if (!parent) {
    // The student's time zone is the best first guess for the parent's;
    // their dashboard corrects it on the first visit.
    parent = await prisma.parent.create({ data: { email: parentEmail, timeZone, ...newSetupToken(false) } });
  }
  const existingLink = await prisma.parentLink.findUnique({
    where: { parentId_studentId: { parentId: parent.id, studentId } },
  });
  const link = existingLink ?? (await prisma.parentLink.create({ data: { parentId: parent.id, studentId, nickname: studentName || null } }));

  const claimed = !!parent.passwordHash;
  let token: string | null = null;
  if (!claimed) {
    if (parent.setupToken && parent.setupTokenExpires && parent.setupTokenExpires.getTime() - Date.now() > 7 * 86400000) {
      token = parent.setupToken;
    } else {
      const t = newSetupToken(false);
      await prisma.parent.update({ where: { id: parent.id }, data: t });
      token = t.setupToken;
    }
  }
  const { subject, html } = parentAddedEmail({ studentName: studentName || "Your student", claimed, token });
  const res = await sendEmail({ to: parent.email, subject, html }).catch(() => ({ sent: false }));
  await prisma.parent.update({ where: { id: parent.id }, data: { setupEmailSentAt: new Date() } });
  return { parentId: parent.id, linkId: link.id, alreadyLinked: !!existingLink, claimed, sent: res.sent };
}
