import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import {
  createParentSessionToken,
  PARENT_SESSION_COOKIE_NAME,
  PARENT_SESSION_MAX_AGE,
} from "@/lib/parentAuth";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; inviteCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  // Codes are generated uppercase (see /api/account/parent-invite), but
  // typing one in lowercase -- or with the odd stray space pasted in --
  // shouldn't be the reason it fails to match.
  const inviteCode = (body.inviteCode || "").trim().toUpperCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }
  if (!inviteCode) {
    return NextResponse.json(
      { error: "Enter the invite code from your student's Settings page." },
      { status: 400 }
    );
  }

  const student = await prisma.user.findUnique({ where: { parentInviteCode: inviteCode } });
  if (!student) {
    return NextResponse.json(
      { error: "That code doesn't match any student account. Double-check it and try again." },
      { status: 400 }
    );
  }

  const existing = await prisma.parent.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try logging in instead." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  // The nested `links.create` runs in the same transaction Prisma already
  // wraps a create-with-nested-write in -- the parent account and its first
  // link are never left half-created.
  const parent = await prisma.parent.create({
    data: {
      email,
      passwordHash,
      links: { create: { studentId: student.id } },
    },
  });

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
