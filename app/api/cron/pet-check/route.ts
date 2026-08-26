import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { PET_NAME, shouldDie, shouldWarn } from "@/lib/pet";

// Runs once a day (see vercel.json) to check every user's study-streak pet:
// send a warning email 2 days before it would die, mark it dead and send a
// death email once a full week of inactivity passes. Protected by
// CRON_SECRET so the endpoint can't be triggered by anyone who finds the
// URL -- if that env var isn't set, the route refuses all requests rather
// than silently running unauthenticated.
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
    where: { petDiedAt: null },
    select: {
      id: true,
      email: true,
      lastActiveDate: true,
      petBornAt: true,
      petDiedAt: true,
      petWarningEmailSentAt: true,
      petDeathEmailSentAt: true,
    },
  });

  let warned = 0;
  let died = 0;

  for (const user of users) {
    const alreadyWarnedToday =
      user.petWarningEmailSentAt &&
      user.petWarningEmailSentAt.toDateString() === now.toDateString();

    if (shouldDie(user.lastActiveDate, user.petBornAt, user.petDiedAt, now)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { petDiedAt: now, petDeathEmailSentAt: now },
      });
      await sendEmail({
        to: user.email,
        subject: `${PET_NAME} didn't make it \u{1F494}`,
        html: deathEmailHtml(),
      });
      died++;
      continue;
    }

    if (!alreadyWarnedToday && shouldWarn(user.lastActiveDate, user.petBornAt, user.petDiedAt, now)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { petWarningEmailSentAt: now },
      });
      await sendEmail({
        to: user.email,
        subject: `${PET_NAME} is getting hungry \u{1F41F}`,
        html: warningEmailHtml(),
      });
      warned++;
    }
  }

  return NextResponse.json({ ok: true, checked: users.length, warned, died });
}

// Falls back to the known production URL so emails still link somewhere
// sensible if APP_URL isn't set, but prefers the env var so this keeps
// working if the domain ever changes.
const APP_URL = process.env.APP_URL || "https://oakmont-chi.vercel.app";

function warningEmailHtml(): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">${PET_NAME} misses you</h2>
      <p style="color: #444;">It's been a few days since your last practice session. ${PET_NAME} has 2 days left before it's gone for good -- complete one quiz on Oakmont Study Center today to bring it back to full health.</p>
      <p><a href="${APP_URL}/dashboard" style="display: inline-block; background: #1a1a2e; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Open Oakmont Study Center</a></p>
    </div>
  `;
}

function deathEmailHtml(): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">${PET_NAME} has passed away</h2>
      <p style="color: #444;">A full week went by without a practice session, and ${PET_NAME} couldn't hang on. The good news: you can start over with a new study pet any time, and your SAT progress is completely untouched.</p>
      <p><a href="${APP_URL}/dashboard" style="display: inline-block; background: #1a1a2e; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Start a new pet</a></p>
    </div>
  `;
}
