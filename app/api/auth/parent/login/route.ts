import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import {
  createParentSessionToken,
  PARENT_SESSION_COOKIE_NAME,
  PARENT_SESSION_MAX_AGE,
} from "@/lib/parentAuth";

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

  const parent = await prisma.parent.findUnique({ where: { email } });
  if (!parent) {
    return NextResponse.json(
      { error: "No account found with this email. Sign up first." },
      { status: 404 }
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
