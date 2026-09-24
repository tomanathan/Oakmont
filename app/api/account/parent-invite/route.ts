import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { newParentInviteCode } from "@/lib/parentCode";

// Generates a fresh invite code, overwriting any previous one -- a parent
// who already linked with the old code keeps their access (the code is
// only ever checked at signup, never re-validated after), but the old code
// itself stops working for anyone new the instant this runs.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const code = await newParentInviteCode(user.userId);
  return NextResponse.json({ ok: true, code });
}

// Turns the code off entirely, without generating a replacement -- for a
// student who wants to stop anyone new from linking without necessarily
// wanting a fresh code right away.
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }
  await prisma.user.update({ where: { id: user.userId }, data: { parentInviteCode: null } });
  return NextResponse.json({ ok: true });
}
