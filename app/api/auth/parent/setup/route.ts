import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { safeTimeZone } from "@/lib/parentReportData";
import { createParentSessionToken, PARENT_SESSION_COOKIE_NAME, PARENT_SESSION_MAX_AGE } from "@/lib/parentAuth";

// Sets a parent's password from their emailed setup (or reset) link, then
// logs them in. The link proves they own the email address.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { token?: unknown; password?: unknown; timeZone?: unknown };
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

  const parent = token ? await prisma.parent.findUnique({ where: { setupToken: token } }) : null;
  if (!parent || !parent.setupTokenExpires || parent.setupTokenExpires < new Date()) {
    return NextResponse.json({ error: "This link has expired. Request a new one from the log in page." }, { status: 400 });
  }

  await prisma.parent.update({
    where: { id: parent.id },
    data: {
      passwordHash: await hashPassword(password),
      setupToken: null,
      setupTokenExpires: null,
      ...(typeof body.timeZone === "string" && body.timeZone ? { timeZone: safeTimeZone(body.timeZone) } : {}),
    },
  });

  const session = await createParentSessionToken({ parentId: parent.id, email: parent.email });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PARENT_SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PARENT_SESSION_MAX_AGE,
  });
  return res;
}
