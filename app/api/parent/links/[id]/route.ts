import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentParent } from "@/lib/parentSession";

// A parent renaming (PATCH) or removing (DELETE) one of their own linked
// students. `id` is the ParentLink id; both check it belongs to this parent.
async function ownLink(id: string) {
  const parent = await getCurrentParent();
  if (!parent) return { error: NextResponse.json({ error: "Not logged in." }, { status: 401 }) };
  const link = await prisma.parentLink.findUnique({ where: { id } });
  if (!link || link.parentId !== parent.parentId) return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) };
  return { link };
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const r = await ownLink(params.id);
  if ("error" in r) return r.error;
  const body = (await req.json().catch(() => ({}))) as { nickname?: unknown };
  const nickname = typeof body.nickname === "string" ? body.nickname.trim().slice(0, 40) : "";
  await prisma.parentLink.update({ where: { id: params.id }, data: { nickname: nickname || null } });
  return NextResponse.json({ ok: true, nickname: nickname || null });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const r = await ownLink(params.id);
  if ("error" in r) return r.error;
  await prisma.parentLink.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
