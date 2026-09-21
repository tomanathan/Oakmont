import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Excludes visually-ambiguous characters (0/O, 1/I) since this code gets
// read off one screen and typed into another.
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

function generateCode(): string {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  return code;
}

// Generates a fresh invite code, overwriting any previous one -- a parent
// who already linked with the old code keeps their access (the code is
// only ever checked at signup, never re-validated after), but the old code
// itself stops working for anyone new the instant this runs.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let code = generateCode();
  // A collision is vanishingly unlikely (8 chars from a 32-char alphabet)
  // but would otherwise surface as a raw 500 from the unique constraint.
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.user.findUnique({ where: { parentInviteCode: code } });
    if (!existing) break;
    code = generateCode();
  }

  await prisma.user.update({ where: { id: user.userId }, data: { parentInviteCode: code } });
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
