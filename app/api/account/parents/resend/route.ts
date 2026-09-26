import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { sendParentSetupLink } from "@/lib/parentSetup";
import { parentClaimed } from "@/lib/parentAuth";

// Re-sends the setup email to a parent the student added who hasn't set a
// password yet.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { parentId?: unknown };
  const parentId = typeof body.parentId === "string" ? body.parentId : "";
  const link = parentId
    ? await prisma.parentLink.findUnique({
        where: { parentId_studentId: { parentId, studentId: user.userId } },
        select: { parent: { select: { passwordHash: true, googleSub: true } }, student: { select: { firstName: true } } },
      })
    : null;
  if (!link) return NextResponse.json({ error: "Parent not found." }, { status: 404 });
  if (parentClaimed(link.parent)) return NextResponse.json({ error: "They've already set up their account." }, { status: 400 });
  const res = await sendParentSetupLink(parentId, link.student.firstName ?? "Your student");
  if (res.throttled) return NextResponse.json({ error: "Just sent. Give it a minute." }, { status: 429 });
  if (!res.sent) return NextResponse.json({ error: "The email didn't go through. Try again later." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
