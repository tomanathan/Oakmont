import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { readUnsubscribeToken } from "@/lib/encourage/unsubscribe";
import { BrandMark } from "@/components/BrandMark";
import { UnsubscribeButtons } from "./UnsubscribeButtons";

// Where the "Turn these emails off" link in the daily emails lands. No
// login: the signed token in the link says whose emails these are.

export const metadata: Metadata = { title: "Email settings · Oakmont", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function UnsubscribePage({ searchParams }: { searchParams: { t?: string } }) {
  const who = await readUnsubscribeToken(searchParams.t);
  let on: boolean | null = null;
  if (who?.who === "student") on = (await prisma.user.findUnique({ where: { id: who.id }, select: { encourageEmails: true } }))?.encourageEmails ?? null;
  if (who?.who === "parent") on = (await prisma.parent.findUnique({ where: { id: who.id }, select: { dailyEmails: true } }))?.dailyEmails ?? null;

  return (
    <div className="min-h-screen bg-[#f3f6fc] px-4 py-16 font-sans text-ink">
      <div className="mx-auto max-w-[440px] rounded-2xl border border-[#c9d6ee] bg-white p-7 text-center">
        <BrandMark size={44} className="mx-auto mb-4" />
        {who && on !== null ? (
          <>
            <h1 className="font-display text-xl font-semibold">Daily emails</h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {who.who === "student"
                ? "The morning email with today's piece of your plan, and the reminder on days you haven't studied yet."
                : "The morning update on your student, and the reminder on days they haven't studied yet. Your weekly report is separate and isn't affected."}
            </p>
            <UnsubscribeButtons token={searchParams.t!} initialOn={on} />
          </>
        ) : (
          <>
            <h1 className="font-display text-xl font-semibold">That link didn&apos;t work</h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              It may have been cut off. You can turn the daily emails on or off in your settings after you{" "}
              <Link href="/login" className="font-semibold text-forest underline underline-offset-2">
                log in
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
