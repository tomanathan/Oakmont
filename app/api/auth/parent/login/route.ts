import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { sendParentSetupLink } from "@/lib/parentSetup";
import {
  createParentSessionToken,
  PARENT_SESSION_COOKIE_NAME,
  PARENT_SESSION_MAX_AGE,
} from "@/lib/parentAuth";
import { clientIp, isJsonRequest, keyPart, rateLimitAll } from "@/lib/rateLimit";

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

  const ip = clientIp(req);
  const acct = keyPart(email);
  const allowed = await rateLimitAll([
    [`plogin:ip:${ip}`, 60, 15 * 60],
    [`plogin:acct:${acct}:${ip}`, 8, 15 * 60],
    [`plogin:acct:${acct}`, 30, 60 * 60],
  ]);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many tries. Wait a few minutes and try again, or use \"Forgot password?\"." },
      { status: 429 }
    );
  }

  const parent = await prisma.parent.findUnique({ where: { email } });
  if (!parent) {
    return NextResponse.json(
      { error: "No account found with this email. Sign up first." },
      { status: 404 }
    );
  }

  if (!parent.passwordHash && parent.googleSub) {
    return NextResponse.json(
      { error: "This account uses Google sign-in. Choose \"Continue with Google\", or use \"Forgot password?\" to set a password." },
      { status: 401 }
    );
  }
  if (!parent.passwordHash) {
    await sendParentSetupLink(parent.id);
    return NextResponse.json(
      { error: "Your account isn't set up yet. We've emailed you a link to set your password." },
      { status: 403 }
    );
  }
  const valid = await verifyPassword(password, parent.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createParentSessionToken({ parentId: parent.id, email: parent.email });

  const res = NextResponse.json({ ok: true, email: parent.email });
  res.cookies.set(PARENT_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PARENT_SESSION_MAX_AGE,
  });
  return res;
}
