import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SiteHeader } from "@/components/landing/notebook/SiteHeader";
import { findInviter } from "@/lib/referral";
import { getCurrentUser } from "@/lib/session";
import { TRIAL_DAYS } from "@/lib/subscription";

// A friend's invite link (lib/referral.ts). Signing up through it gives the
// new student a free month on top of the free week, and the friend who sent
// it a free month once they've studied a few days. The code itself is
// remembered for signup by components/SourceCapture.tsx; the button carries
// it too, for browsers that drop the cookie.

export const dynamic = "force-dynamic";

// Metadata and the page both need the inviter: one lookup per request.
const inviterFor = cache((code: string) => findInviter(code));

function invitedBy(firstName: string | null | undefined): string {
  return firstName ? `${firstName} invited you` : "A friend invited you";
}

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const inviter = await inviterFor(params.code);
  return {
    title: `${invitedBy(inviter?.firstName)} to Oakmont SAT Prep`,
    description: "Try 5 quick SAT questions, then sign up through this invite and you both get an extra free month.",
    robots: { index: false, follow: false },
  };
}

export default async function InvitePage({ params }: { params: { code: string } }) {
  const inviter = await inviterFor(params.code);
  if (!inviter) redirect("/start");
  if (await getCurrentUser()) redirect("/dashboard");
  const code = params.code.trim().toUpperCase();

  return (
    <>
      <SiteHeader />
      <div className="nbk-page mx-auto my-6 w-[calc(100%-24px)] font-sans sm:my-8 md:w-[calc(100%-80px)] max-w-[610px]">
        <span className="nbk-spiral" aria-hidden />
        <h1 className="font-display text-[28px] font-semibold leading-tight text-ink">{invitedBy(inviter.firstName)} to Oakmont</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
          Sign up through this invite and you both get an extra free month, on top of the {TRIAL_DAYS} free days everyone gets. No card needed.
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-stone-600">It starts with 5 quick SAT questions.</p>
        <div className="mt-6 flex flex-col sm:flex-row">
          <Link href={`/start?r=${encodeURIComponent(code)}`} className="rounded-lg bg-forest px-5 py-2.5 text-center text-sm font-semibold text-white">
            Try 5 SAT questions
          </Link>
        </div>
      </div>
    </>
  );
}
