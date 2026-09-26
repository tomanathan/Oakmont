import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { safeTimeZone } from "@/lib/parentReportData";
import { sendParentSetupLink } from "@/lib/parentSetup";
import {
  createParentSessionToken,
  PARENT_SESSION_COOKIE_NAME,
  PARENT_SESSION_MAX_AGE,
  parentClaimed,
} from "@/lib/parentAuth";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; inviteCode?: string; nickname?: string; timeZone?: string };
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
  // The student's code is optional: a parent can sign up first and send
  // their student an invite link from the dashboard instead.
  const student = inviteCode ? await prisma.user.findUnique({ where: { parentInviteCode: inviteCode } }) : null;
  if (inviteCode && !student) {
    return NextResponse.json(
      { error: "That code doesn't match any student account. Double-check it and try again." },
      { status: 400 }
    );
  }

  const existing = await prisma.parent.findUnique({ where: { email } });
  if (existing && !parentClaimed(existing)) {
    // A student already created this account for them: the password has
    // to be set through the emailed link, which proves the address is theirs.
    await sendParentSetupLink(existing.id);
    return NextResponse.json(
      { error: "Your student already created this account for you. We've emailed you a link to set your password." },
      { status: 409 }
    );
  }
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
  const nickname = (body.nickname || "").trim().slice(0, 40) || null;
  const parent = await prisma.parent.create({
    data: {
      email,
      passwordHash,
      timeZone: body.timeZone ? safeTimeZone(body.timeZone) : null,
      ...(student ? { links: { create: { studentId: student.id, nickname } } } : {}),
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
