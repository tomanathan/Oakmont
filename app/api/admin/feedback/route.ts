import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// Marks a piece of feedback handled (or not), from /admin/feedback.
export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = (await req.json().catch(() => ({}))) as { id?: unknown; handled?: unknown };
  if (typeof body.id !== "string") return NextResponse.json({ error: "Missing id." }, { status: 400 });
  await prisma.feedback.updateMany({ where: { id: body.id }, data: { handledAt: body.handled === false ? null : new Date() } });
  return NextResponse.json({ ok: true });
}
