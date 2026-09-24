import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// The student approving a parent's invite link: links the two accounts.
// Only ever done by the signed-in student, from the approval page.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { token?: unknown };
  const token = typeof body.token === "string" ? body.token : "";
  const invite = token ? await prisma.parentInvite.findUnique({ where: { token } }) : null;
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invite link has expired or was already used. Ask for a new one." }, { status: 400 });
  }
  await prisma.$transaction([
    prisma.parentLink.upsert({
      where: { parentId_studentId: { parentId: invite.parentId, studentId: user.userId } },
      create: { parentId: invite.parentId, studentId: user.userId, nickname: invite.nickname },
      update: {},
    }),
    prisma.parentInvite.update({ where: { id: invite.id }, data: { usedAt: new Date() } }),
  ]);
  return NextResponse.json({ ok: true });
}
