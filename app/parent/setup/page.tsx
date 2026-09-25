import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { displayName } from "@/lib/parentReportData";
import { BrandMark } from "@/components/BrandMark";
import { SetupForm } from "./SetupForm";

export const dynamic = "force-dynamic";

// Where the "set your password" link in a parent's email lands.
export default async function ParentSetupPage({ searchParams }: { searchParams: { token?: string; decline?: string } }) {
  const token = searchParams.token ?? "";
  const parent = token
    ? await prisma.parent.findUnique({
        where: { setupToken: token },
        select: {
          email: true,
          passwordHash: true,
          setupTokenExpires: true,
          links: { select: { nickname: true, student: { select: { email: true, firstName: true } } } },
        },
      })
    : null;
  const valid = !!parent && !!parent.setupTokenExpires && parent.setupTokenExpires > new Date();
  const names = parent ? parent.links.map((l) => displayName(l.nickname || l.student.firstName, l.student.email)) : [];

  return (
    <div className="mx-auto max-w-[460px] px-6 py-12 font-sans">
      <BrandMark size={48} className="mb-4" />
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#2c4c3b]">Oakmont for Parents</div>
      {!valid || !parent ? (
        <>
          <h1 className="font-display text-[28px] font-semibold leading-tight text-ink">This link has expired</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
            Setup links only work for a while. Go to the parent log in page and use &ldquo;Forgot password?&rdquo; to get a new one.
          </p>
          <Link href="/parent/login" className="mt-6 inline-block rounded-lg bg-forest px-5 py-2.5 text-sm font-semibold text-white">
            Parent log in
          </Link>
        </>
      ) : (
        <SetupForm
          token={token}
          email={parent.email}
          claimed={!!parent.passwordHash}
          studentNames={names}
          startDeclining={searchParams.decline === "1" && !parent.passwordHash}
        />
      )}
    </div>
  );
}
