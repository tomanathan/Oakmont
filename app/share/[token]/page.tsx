import { prisma } from "@/lib/prisma";
import { BrandMark } from "@/components/BrandMark";
import { ParentReportView } from "@/components/parent/ParentReportView";
import { displayName, loadParentReport } from "@/lib/parentReportData";

export const dynamic = "force-dynamic";

// Public, no-login view -- anyone with the link sees the same
// report a linked parent account would (see app/parent/dashboard). A
// student generates or revokes this link from Settings; a wrong or revoked
// token gets the same generic "not valid" message either way -- never a
// hint that a token was once real, or that any particular token might be
// close. Days are shown in US Eastern time, since there's no viewer
// account to take a time zone from.
export default async function SharePage({ params }: { params: { token: string } }) {
  const student = await prisma.user.findUnique({ where: { parentShareToken: params.token }, select: { id: true, email: true, firstName: true } });

  if (!student) {
    return (
      <div className="nbk-page mx-auto my-6 w-[calc(100%-24px)] font-sans sm:my-8 md:w-[calc(100%-80px)] max-w-[570px] text-center">
        <span className="nbk-spiral" aria-hidden />
        <BrandMark size={48} className="mx-auto mb-4" />
        <div className="mb-2 text-lg font-semibold text-ink">This link isn&apos;t valid</div>
        <div className="text-sm text-stone-500">It may have been turned off, or the link might be mistyped. Ask your student for a fresh one.</div>
      </div>
    );
  }

  const report = await loadParentReport(student.id, { name: displayName(student.firstName, student.email) });

  return (
    <div className="mx-auto max-w-[1270px] px-3 pb-16 pt-2 font-sans sm:px-6 md:pl-10">
      <header className="mb-4 flex items-center gap-2.5 px-4 py-3">
        <BrandMark size={26} />
        <div className="font-display text-[14px] font-semibold text-ink">Oakmont Study Center</div>
        <span className="text-xs text-stone-500">&middot; shared study report</span>
      </header>
      <div className="nbk-page">
        <span className="nbk-spiral" aria-hidden />
      <ParentReportView
        report={report}
        footer={
          <p className="text-center text-[12px] leading-relaxed text-stone-600">
            For the Sunday email and times in your own time zone, <a href="/parent/login?mode=signup" className="text-[#26427e] underline">create a free parent account</a>.
          </p>
        }
      />
      </div>
    </div>
  );
}
