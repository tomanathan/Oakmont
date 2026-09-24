import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { BrandMark } from "@/components/BrandMark";
import { ApproveInvite } from "./ApproveInvite";

export const dynamic = "force-dynamic";

// A parent's invite link, opened by the student while signed in, which
// connects the two accounts.
const SHARED = [
  "When you study, for how long, and which lessons and quizzes",
  "How many questions you answer and how many you get right",
  "Your progress on each of the 29 skills",
  "The confidence you mark on answers, and mistakes that repeat",
  "Practice test scores you log, your goal, and your test date",
];

export default async function LinkInvitePage({ params }: { params: { token: string } }) {
  const invite = await prisma.parentInvite.findUnique({
    where: { token: params.token },
    include: { parent: { select: { email: true } } },
  });
  const user = await getCurrentUser();
  const valid = invite && !invite.usedAt && invite.expiresAt > new Date();
  const back = encodeURIComponent(`/link/${params.token}`);

  return (
    <div className="mx-auto max-w-[520px] px-6 py-12 font-sans">
      <BrandMark size={48} className="mx-auto mb-4" />
      {!valid ? (
        <div className="text-center">
          <h1 className="font-display text-[26px] font-semibold text-ink">This link has expired</h1>
          <p className="mt-2 text-sm text-gray-500">
            It may have been used already, or it&apos;s more than 14 days old. Ask your parent to create a new one from their dashboard.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#ece9f7] bg-white p-7 shadow-[0_1px_2px_rgba(26,26,46,0.04),0_8px_24px_rgba(26,26,46,0.06)]">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#4a5bb0]">Connect your parent</div>
          <h1 className="mt-1 font-display text-[24px] font-semibold leading-snug text-ink">
            {invite.parent.email} wants to follow your SAT prep
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-gray-600">Once you connect, their dashboard follows your progress:</p>
          <ul className="mt-3 flex flex-col gap-2">
            {SHARED.map((s) => (
              <li key={s} className="flex gap-2.5 text-[13.5px] leading-snug text-gray-700">
                <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#6d7fd6]" />
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {user ? (
              <ApproveInvite token={params.token} studentEmail={user.email} />
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href={`/login?next=${back}`} className="flex-1 rounded-lg bg-ink py-2.5 text-center text-sm font-semibold text-white">
                  Log in to connect
                </Link>
                <Link
                  href={`/login?mode=signup&next=${back}`}
                  className="flex-1 rounded-lg border border-[#e0defa] py-2.5 text-center text-sm font-semibold text-ink hover:bg-[#f3f2fc]"
                >
                  I&apos;m new: sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
