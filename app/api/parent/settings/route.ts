import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentParent } from "@/lib/parentSession";
import { safeTimeZone } from "@/lib/parentReportData";

// A parent's own preferences: the weekly report email, and the time zone
// their reports are bucketed in (sent by the dashboard from the browser).
export async function PATCH(req: NextRequest) {
  const parent = await getCurrentParent();
  if (!parent) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { weeklyReport?: unknown; timeZone?: unknown };
  const data: { weeklyReport?: boolean; timeZone?: string } = {};
  if (typeof body.weeklyReport === "boolean") data.weeklyReport = body.weeklyReport;
  if (typeof body.timeZone === "string" && body.timeZone.length < 64) data.timeZone = safeTimeZone(body.timeZone);
  if (Object.keys(data).length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  await prisma.parent.update({ where: { id: parent.parentId }, data });
  return NextResponse.json({ ok: true });
}
