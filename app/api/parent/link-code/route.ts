import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentParent } from "@/lib/parentSession";
import { rateLimit } from "@/lib/rateLimit";

// A signed-in parent linking another student with the code from that
// student's Settings (the code itself is the student's consent).
export async function POST(req: NextRequest) {
  const parent = await getCurrentParent();
  if (!parent) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { code?: unknown; nickname?: unknown };
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const nickname = typeof body.nickname === "string" ? body.nickname.trim().slice(0, 40) : "";
  if (!code) return NextResponse.json({ error: "Enter the code from your student's Settings page." }, { status: 400 });
  if (!(await rateLimit(`code:parent:${parent.parentId}`, 10, 60 * 60))) {
    return NextResponse.json({ error: "Too many tries with a code. Wait an hour and try again." }, { status: 429 });
  }
  const student = await prisma.user.findUnique({ where: { parentInviteCode: code } });
  if (!student) return NextResponse.json({ error: "That code doesn't match a student account. Double-check it and try again." }, { status: 400 });
  const link = await prisma.parentLink.upsert({
    where: { parentId_studentId: { parentId: parent.parentId, studentId: student.id } },
    create: { parentId: parent.parentId, studentId: student.id, nickname: nickname || null },
    update: nickname ? { nickname } : {},
  });
  return NextResponse.json({ ok: true, studentId: link.studentId });
}
