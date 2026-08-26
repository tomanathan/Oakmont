import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "No account found with this email. Sign up first." },
      { status: 404 }
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
