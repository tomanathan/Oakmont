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
    <div className="nbk-page mx-auto my-6 w-[calc(100%-24px)] font-sans sm:my-8 md:w-[calc(100%-80px)] max-w-[610px]">
      <span className="nbk-spiral" aria-hidden />
      <BrandMark size={48} className="mx-auto mb-4" />
      {!valid ? (
        <div className="text-center">
          <h1 className="font-display text-[26px] font-semibold text-ink">This link has expired</h1>
          <p className="mt-2 text-sm text-stone-500">
            It may have been used already, or it&apos;s more than 14 days old. Ask your parent to create a new one from their dashboard.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#c9d6ee] bg-white p-7 shadow-[3px_3px_0_rgba(52,97,193,0.13)]">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#26427e]">Connect your parent</div>
          <h1 className="mt-1 font-display text-[24px] font-semibold leading-snug text-ink">
            {invite.parent.email} wants to follow your SAT prep
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-stone-600">Once you connect, their dashboard follows your progress:</p>
          <ul className="mt-3 flex flex-col gap-2">
            {SHARED.map((s) => (
              <li key={s} className="flex gap-2.5 text-[13.5px] leading-snug text-stone-700">
                <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#3d7a56]" />
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {user ? (
              <ApproveInvite token={params.token} studentEmail={user.email} />
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href={`/login?next=${back}`} className="flex-1 rounded-lg bg-forest py-2.5 text-center text-sm font-semibold text-white">
                  Log in to connect
                </Link>
                <Link
                  href={`/start?invite=${params.token}`}
                  className="flex-1 rounded-lg border border-[#b4c5e6] py-2.5 text-center text-sm font-semibold text-ink hover:bg-[#e9effb]"
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
