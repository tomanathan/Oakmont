import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Long and URL-safe -- unlike the invite code, this is never manually
// typed, only pasted/clicked, so there's no reason to keep it short.
function generateToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

// Generates a fresh share link, overwriting any previous one -- the old
// link stops resolving (app/share/[token]/page.tsx) the instant this runs.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let token = generateToken();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.user.findUnique({ where: { parentShareToken: token } });
    if (!existing) break;
    token = generateToken();
  }

  await prisma.user.update({ where: { id: user.userId }, data: { parentShareToken: token } });
  return NextResponse.json({ ok: true, token });
}

// Turns sharing off entirely -- the previously-shared link stops working
// immediately, with no replacement generated.
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }
  await prisma.user.update({ where: { id: user.userId }, data: { parentShareToken: null } });
  return NextResponse.json({ ok: true });
}
