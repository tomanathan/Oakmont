import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
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
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try logging in instead." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastLoginAt: new Date() },
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
