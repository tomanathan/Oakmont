import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { FeedbackList, type FeedbackRow } from "./FeedbackList";

// What students have told us through the Feedback tab, newest first.

export const metadata: Metadata = { title: "Feedback · Admin · Oakmont", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  await requireAdmin();
  const rows = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: { id: true, kind: true, rating: true, message: true, path: true, userAgent: true, createdAt: true, handledAt: true, user: { select: { id: true, firstName: true, email: true } } },
  });
  const items: FeedbackRow[] = rows.map((r) => ({ ...r, handled: !!r.handledAt }));
  return (
    <div className="min-h-screen font-sans text-ink">
      <div className="mx-auto max-w-[980px] px-4 py-8 sm:px-6">
        <Link href="/admin" className="text-[13px] font-semibold text-forest underline-offset-2 hover:underline">
          ← Admin
        </Link>
        <FeedbackList items={items} now={new Date()} />
      </div>
    </div>
  );
}
