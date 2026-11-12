import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { trialEndFrom } from "@/lib/subscription";
import { START_COOKIE, applyStartOnSignup, clearStartCookie } from "@/lib/starter";
import { clientIp, isJsonRequest, rateLimit } from "@/lib/rateLimit";
import { readSignupSource, signupSourceFields } from "@/lib/signupSource";
import { SIGNUP_SOURCE_COOKIE } from "@/lib/signupSource.shared";
import { applyReferralOnSignup } from "@/lib/referral";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!isJsonRequest(req)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  let body: { email?: string; password?: string; firstName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  // Parent supervision is chosen in onboarding, right after this; the first
  // name is asked here so every greeting and parent email can use it.
  const firstName = (body.firstName || "").trim().replace(/\s+/g, " ").slice(0, 40) || null;

  if (!firstName) {
    return NextResponse.json({ error: "Enter your first name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }
  // Generous enough for a classroom signing up from one network; tight
  // enough that accounts can't be made by the thousand.
  if (!(await rateLimit(`signup:ip:${clientIp(req)}`, 40, 60 * 60))) {
    return NextResponse.json({ error: "Too many new accounts from this network. Try again in an hour." }, { status: 429 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try logging in instead." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  // The free week starts now: full access, no card, no checkout. Paying
  // is a choice made later from /subscribe, not a step in signing up.
  const now = new Date();
  // Where they found us, from their first visit (lib/signupSource.ts).
  const source = readSignupSource(req.cookies.get(SIGNUP_SOURCE_COOKIE)?.value);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastLoginAt: now, trialEndsAt: trialEndFrom(now), ...signupSourceFields(source) },
  });
  // Through a friend's invite: a free month on top of the free week.
  // The account exists by now, so a hiccup here mustn't fail the signup.
  // A code that did not apply (unknown, mistyped) is not an invite: label the visit as it would have been.
  await applyReferralOnSignup(user.id, source.ref)
    .then(async (applied) => {
      if (!applied && source.ref) await prisma.user.update({ where: { id: user.id }, data: { signupSource: source.sourceWithoutInvite } });
    })
    .catch((err) => console.error("Invite on signup failed", err));

  // Came through /start: their answers, test date, plan, and any parent invite come with them.
  const started = await applyStartOnSignup(user.id, req.cookies.get(START_COOKIE)?.value);

  const token = await createSessionToken({ userId: user.id, email: user.email });

  const res = NextResponse.json({ ok: true, email: user.email, started });
  if (started) clearStartCookie(res);
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
