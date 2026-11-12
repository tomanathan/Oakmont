import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendParentSetupLink } from "@/lib/parentSetup";
import { clientIp, keyPart, rateLimitAll } from "@/lib/rateLimit";

// Emails a parent a link to set or reset their password. Same response
// whether or not the email has an account.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email.includes("@")) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  // Same limits, and the same silent "ok" past them, as the student reset.
  const allowed = await rateLimitAll([
    [`pforgot:ip:${clientIp(req)}`, 10, 60 * 60],
    [`pforgot:acct:${keyPart(email)}`, 3, 60 * 60],
  ]);
  if (!allowed) return NextResponse.json({ ok: true });
  const parent = await prisma.parent.findUnique({ where: { email }, select: { id: true } });
  if (parent) await sendParentSetupLink(parent.id);
  return NextResponse.json({ ok: true });
}
