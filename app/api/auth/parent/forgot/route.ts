import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendParentSetupLink } from "@/lib/parentSetup";

// Emails a parent a link to set or reset their password. Same response
// whether or not the email has an account.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email.includes("@")) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const parent = await prisma.parent.findUnique({ where: { email }, select: { id: true } });
  if (parent) await sendParentSetupLink(parent.id);
  return NextResponse.json({ ok: true });
}
