import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { trialEndFrom } from "@/lib/subscription";
import { GOOGLE_STATE_COOKIE, googleRedirectUri, identityFromCode, safeNext } from "@/lib/googleAuth";

// Step 2 of "Continue with Google": Google sends the browser back here with
// a one-time code. Check it's the sign-in we started, learn who they are,
// then sign them in to the matching account -- or create one, exactly as
// the email signup would (same free week, then onboarding).
export async function GET(req: NextRequest) {
  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`/login?error=${reason}`, req.url));
    res.cookies.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth/google" });
    return res;
  };

  const params = req.nextUrl.searchParams;
  // They backed out on Google's screen: just return to the login page.
  if (params.get("error")) return fail("google_cancelled");

  let saved: { state?: string; nonce?: string; next?: string | null } = {};
  try {
    saved = JSON.parse(req.cookies.get(GOOGLE_STATE_COOKIE)?.value ?? "{}");
  } catch {
    saved = {};
  }
  const code = params.get("code");
  if (!code || !saved.state || !saved.nonce || params.get("state") !== saved.state) return fail("google");

  const identity = await identityFromCode(code, googleRedirectUri(req.nextUrl.origin), saved.nonce);
  if (!identity) return fail("google");

  const now = new Date();
  let user = await prisma.user.findUnique({ where: { googleSub: identity.sub } });
  let isNew = false;
  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email: identity.email } });
    if (byEmail) {
      // The same address signed up with a password earlier. Google has
      // verified they own it, so link the two -- unless this account is
      // already tied to a different Google account.
      if (byEmail.googleSub && byEmail.googleSub !== identity.sub) return fail("google_other_account");
      user = await prisma.user.update({ where: { id: byEmail.id }, data: { googleSub: identity.sub } });
    } else {
      user = await prisma.user.create({
        data: {
          email: identity.email,
          googleSub: identity.sub,
          firstName: identity.givenName,
          lastLoginAt: now,
          trialEndsAt: trialEndFrom(now),
        },
      });
      isNew = true;
    }
  }
  if (!isNew) {
    await prisma.user.update({ where: { id: user.id }, data: { previousLoginAt: user.lastLoginAt, lastLoginAt: now } });
  }

  const token = await createSessionToken({ userId: user.id, email: user.email, method: "google" });
  const dest = safeNext(saved.next) ?? (isNew ? "/welcome?via=google" : "/dashboard");
  const res = NextResponse.redirect(new URL(dest, req.url));
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  res.cookies.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth/google" });
  return res;
}
