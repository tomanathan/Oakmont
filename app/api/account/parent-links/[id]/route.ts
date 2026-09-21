import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Unlinks one parent. Scoped to the student's own id in the query itself
// (not just checked after the fact) so a student can only ever delete
// their own ParentLink rows, never someone else's by guessing an id.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const result = await prisma.parentLink.deleteMany({
    where: { id: params.id, studentId: user.userId },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Link not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
