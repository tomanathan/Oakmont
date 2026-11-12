import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { clientIp, isJsonRequest, keyPart, rateLimitAll } from "@/lib/rateLimit";

const TOO_MANY = "Too many tries. Wait a few minutes and try again, or use \"Forgot password?\".";

export async function POST(req: NextRequest) {
  if (!isJsonRequest(req)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";

  if (!email || !password) {
    return NextResponse.json({ error: "Enter both an email and password." }, { status: 400 });
  }

  // Before any lookup or password check: a cap per address, a tighter one
  // per account from that address, and one per account from anywhere.
  const ip = clientIp(req);
  const acct = keyPart(email);
  const allowed = await rateLimitAll([
    [`login:ip:${ip}`, 60, 15 * 60],
    [`login:acct:${acct}:${ip}`, 8, 15 * 60],
    [`login:acct:${acct}`, 30, 60 * 60],
  ]);
  if (!allowed) return NextResponse.json({ error: TOO_MANY }, { status: 429 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // A parent on the student page: point them at their own login.
    const parent = await prisma.parent.findUnique({ where: { email }, select: { id: true } });
    if (parent) {
      return NextResponse.json(
        { error: "This email has a parent account. Log in from the parent page.", parentLogin: true },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "No account found with this email. Sign up first." },
      { status: 404 }
    );
  }

  // Created with Google and never given a password.
  if (!user.passwordHash) {
    return NextResponse.json(
      { error: "This account uses Google sign-in. Choose \"Continue with Google\" above, or use \"Forgot password?\" to set a password." },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  // Shift the login timestamps so the dashboard can summarize "what you did
  // last time": lastLoginAt becomes the just-finished session's start, and
  // the prior lastLoginAt becomes previousLoginAt.
  await prisma.user.update({
    where: { id: user.id },
    data: { previousLoginAt: user.lastLoginAt, lastLoginAt: new Date() },
  });

  const token = await createSessionToken({ userId: user.id, email: user.email });

  const res = NextResponse.json({ ok: true, email: user.email });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
