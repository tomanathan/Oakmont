import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { createParentSessionToken, PARENT_SESSION_COOKIE_NAME, PARENT_SESSION_MAX_AGE } from "@/lib/parentAuth";
import { safeTimeZone } from "@/lib/parentReportData";
import { trialEndFrom } from "@/lib/subscription";
import { GOOGLE_STATE_COOKIE, googleRedirectUri, identityFromCode, safeNext, type GoogleIdentity } from "@/lib/googleAuth";

// Step 2 of "Continue with Google": Google sends the browser back here with
// a one-time code. Check it's the sign-in we started, learn who they are,
// then sign them in to the matching account -- or create one, exactly as
// the email signup would. Students and parents are separate accounts with
// separate sessions; the start route recorded which one this is.

interface ParentContext {
  code: string | null; // student's parent-invite code, from the signup form
  name: string | null; // student's first name, from the signup form
  tz: string | null;
  setup: string | null; // token from a "finish setting up your account" email
}

interface Saved {
  state?: string;
  nonce?: string;
  next?: string | null;
  parent?: ParentContext | null;
}

export async function GET(req: NextRequest) {
  let saved: Saved = {};
  try {
    saved = JSON.parse(req.cookies.get(GOOGLE_STATE_COOKIE)?.value ?? "{}");
  } catch {
    saved = {};
  }
  const loginPage = saved.parent ? "/parent/login" : "/login";
  const fail = (reason: string) => {
    const res = NextResponse.redirect(new URL(`${loginPage}?error=${reason}`, req.url));
    res.cookies.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth/google" });
    return res;
  };

  const params = req.nextUrl.searchParams;
  // They backed out on Google's screen: just return to the login page.
  if (params.get("error")) return fail("google_cancelled");

  const code = params.get("code");
  if (!code || !saved.state || !saved.nonce || params.get("state") !== saved.state) return fail("google");

  const identity = await identityFromCode(code, googleRedirectUri(req.nextUrl.origin), saved.nonce);
  if (!identity) return fail("google");

  const done = saved.parent ? await signInParent(identity, saved.parent) : await signInStudent(identity, saved.next ?? null);
  if ("error" in done) return fail(done.error);

  const res = NextResponse.redirect(new URL(done.dest, req.url));
  res.cookies.set(done.cookie, done.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: done.maxAge,
  });
  res.cookies.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth/google" });
  return res;
}

type Outcome = { dest: string; cookie: string; token: string; maxAge: number } | { error: string };

async function signInStudent(identity: GoogleIdentity, next: string | null): Promise<Outcome> {
  const now = new Date();
  let user = await prisma.user.findUnique({ where: { googleSub: identity.sub } });
  let isNew = false;
  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email: identity.email } });
    if (byEmail) {
      // The same address signed up with a password earlier. Google has
      // verified they own it, so link the two -- unless this account is
      // already tied to a different Google account.
      if (byEmail.googleSub && byEmail.googleSub !== identity.sub) return { error: "google_other_account" };
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
  return {
    dest: safeNext(next) ?? (isNew ? "/welcome?via=google" : "/dashboard"),
    cookie: SESSION_COOKIE_NAME,
    token: await createSessionToken({ userId: user.id, email: user.email, method: "google" }),
    maxAge: SESSION_MAX_AGE,
  };
}

async function signInParent(identity: GoogleIdentity, ctx: ParentContext): Promise<Outcome> {
  const now = new Date();
  let parent = await prisma.parent.findUnique({ where: { googleSub: identity.sub } });
  let welcomeName: string | null = null;

  if (ctx.setup) {
    // From a "finish setting up" email: the link proves they own that
    // account's address, so attach this Google account to it -- even if the
    // Google account uses a different email. That claims the account.
    const target = await prisma.parent.findUnique({ where: { setupToken: ctx.setup } });
    if (!target || !target.setupTokenExpires || target.setupTokenExpires < now) return { error: "google_setup_expired" };
    if ((parent && parent.id !== target.id) || (target.googleSub && target.googleSub !== identity.sub)) {
      return { error: "google_other_account" };
    }
    parent = await prisma.parent.update({
      where: { id: target.id },
      data: { googleSub: identity.sub, setupToken: null, setupTokenExpires: null },
    });
  }

  if (!parent) {
    const byEmail = await prisma.parent.findUnique({ where: { email: identity.email } });
    if (byEmail) {
      // Same verified address: sign in, and claim the account if a student
      // created it for them and it was still waiting on a password.
      if (byEmail.googleSub && byEmail.googleSub !== identity.sub) return { error: "google_other_account" };
      parent = await prisma.parent.update({ where: { id: byEmail.id }, data: { googleSub: identity.sub } });
    } else {
      // A new parent account, linked to the student if they entered a code.
      const student = ctx.code ? await prisma.user.findUnique({ where: { parentInviteCode: ctx.code } }) : null;
      if (ctx.code && !student) return { error: "parent_code" };
      parent = await prisma.parent.create({
        data: {
          email: identity.email,
          googleSub: identity.sub,
          timeZone: ctx.tz ? safeTimeZone(ctx.tz) : null,
          ...(student ? { links: { create: { studentId: student.id, nickname: ctx.name } } } : {}),
        },
      });
      // No code yet: the dashboard offers an invite link for this student.
      if (!student && ctx.name) welcomeName = ctx.name;
    }
  }

  return {
    dest: `/parent/dashboard${welcomeName ? `?name=${encodeURIComponent(welcomeName)}` : ""}`,
    cookie: PARENT_SESSION_COOKIE_NAME,
    token: await createParentSessionToken({ parentId: parent.id, email: parent.email }),
    maxAge: PARENT_SESSION_MAX_AGE,
  };
}
