import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Falls back to the known production URL so the reset link still points
// somewhere real if APP_URL isn't set -- same convention as the pet-alert
// emails in app/api/cron/pet-check/route.ts.
const APP_URL = process.env.APP_URL || "https://oakmont-chi.vercel.app";

function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Always the same response whether or not the email matches an account --
  // otherwise this endpoint becomes a way to check which emails have an
  // Oakmont account just by watching which response comes back.
  if (user) {
    let token = generateToken();
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await prisma.user.findUnique({ where: { passwordResetToken: token } });
      if (!existing) break;
      token = generateToken();
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });
    await sendEmail({
      to: user.email,
      subject: "Reset your Oakmont Study Center password",
      html: resetEmailHtml(`${APP_URL}/reset-password?token=${token}`),
    });
  }

  return NextResponse.json({ ok: true });
}

function resetEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Reset your password</h2>
      <p style="color: #444;">We got a request to reset your Oakmont Study Center password. This link works for 1 hour.</p>
      <p><a href="${resetUrl}" style="display: inline-block; background: #1a1a2e; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Reset password</a></p>
      <p style="color: #999; font-size: 13px;">If you didn't request this, you can safely ignore this email -- your password won't change.</p>
    </div>
  `;
}
