import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// "Not my student": someone whose email a student entered, before they've
// ever set a password, can remove the account (and its links) outright.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { token?: unknown };
  const token = typeof body.token === "string" ? body.token : "";
  const parent = token ? await prisma.parent.findUnique({ where: { setupToken: token } }) : null;
  if (!parent || parent.passwordHash) {
    return NextResponse.json({ error: "This link can't remove an account." }, { status: 400 });
  }
  await prisma.parent.delete({ where: { id: parent.id } });
  return NextResponse.json({ ok: true });
}
