import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { DAILY_UNTIL_DAYS, ENCOURAGE_EMAILS_ON, NUDGE_WITHIN_DAYS, STOP_AFTER_DAYS } from "@/lib/encourage/config";
import { runEncourage } from "@/lib/encourage/send";
import { EmailsView } from "./EmailsView";

// The daily emails, for the owner: whether they're on, who would get one
// right now, and what each one says.

export const metadata: Metadata = { title: "Emails · Admin · Oakmont", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminEmailsPage() {
  await requireAdmin();
  const now = new Date();
  const [morning, nudge] = await Promise.all([runEncourage("morning", now, { dryRun: true }), runEncourage("nudge", now, { dryRun: true })]);
  return (
    <div className="min-h-screen bg-[#faf6ec] font-sans text-ink">
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
        <Link href="/admin" className="text-[13px] font-semibold text-forest underline-offset-2 hover:underline">
          ← Admin
        </Link>
        <EmailsView
          on={ENCOURAGE_EMAILS_ON}
          counts={{ morning: { students: morning.students, parents: morning.parents }, nudge: { students: nudge.students, parents: nudge.parents } }}
          rules={{ dailyUntil: DAILY_UNTIL_DAYS, stopAfter: STOP_AFTER_DAYS, nudgeWithin: NUDGE_WITHIN_DAYS }}
        />
      </div>
    </div>
  );
}
