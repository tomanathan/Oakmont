import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentParent } from "@/lib/parentSession";

const INVITE_DAYS = 14;

// Parent-first linking: creates a single-use link the parent sends to
// their student. The student opens it signed in and approves sharing
// (app/link/[token]); nothing is shared until they do.
export async function POST(req: NextRequest) {
  const parent = await getCurrentParent();
  if (!parent) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { nickname?: unknown };
  const nickname = typeof body.nickname === "string" ? body.nickname.trim().slice(0, 40) : "";
  const token = randomBytes(18).toString("base64url");
  await prisma.parentInvite.create({
    data: {
      parentId: parent.parentId,
      token,
      nickname: nickname || null,
      expiresAt: new Date(Date.now() + INVITE_DAYS * 86400000),
    },
  });
  const origin = process.env.APP_URL || req.nextUrl.origin;
  return NextResponse.json({ ok: true, url: `${origin}/link/${token}`, expiresInDays: INVITE_DAYS });
}
