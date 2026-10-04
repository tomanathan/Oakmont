import { NextRequest, NextResponse } from "next/server";
import { sendParentReports } from "@/lib/parentReportSend";

// A manual run of the Sunday parent report (the scheduled one happens in
// the morning cron, app/api/cron/pet-check, since the plan allows only two
// cron jobs). Protected by CRON_SECRET; safe to call twice (see
// lib/parentReportSend.ts).
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ ok: true, ...(await sendParentReports()) });
}
