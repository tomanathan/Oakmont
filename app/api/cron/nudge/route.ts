import { NextRequest, NextResponse } from "next/server";
import { runEncourage } from "@/lib/encourage/send";

// The afternoon job, once a day (see vercel.json): a short reminder to
// students who haven't studied yet today, and to their parents. It runs a
// few hours before the streak day rolls over (midnight UTC), so there's
// still time to act on it. Sends nothing while the daily emails are off
// (lib/encourage/config.ts). Protected by CRON_SECRET like the morning job.
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ ok: true, ...(await runEncourage("nudge")) });
}
