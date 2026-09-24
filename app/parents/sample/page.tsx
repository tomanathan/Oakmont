import Link from "next/link";
import type { Metadata } from "next";
import { sampleParentReport } from "@/lib/parentDemo";
import { ParentReportView } from "@/components/parent/ParentReportView";
import { BrandMark } from "@/components/BrandMark";

export const metadata: Metadata = {
  title: "Sample parent report | Oakmont",
  description: "The full parent report, filled in with an invented sample student.",
};

// The whole parent report with sample data, linked from the homepage's
// parent section.
export default function SampleParentReportPage() {
  const report = sampleParentReport(new Date());
  return (
    <div className="min-h-screen bg-[#fbfaff] font-sans">
      <div className="border-b border-[#ece9f7] bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <Link href="/#parents" className="flex items-center gap-2 text-sm text-gray-500 hover:text-ink">
            <BrandMark size={24} />
            &larr; Back
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#fbf1df] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-[#9a6a12]">Sample data</span>
            <Link href="/parent/login?mode=signup" className="rounded-lg bg-ink px-3.5 py-1.5 text-[13px] font-semibold text-white">
              Create a parent account
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-6">
        <ParentReportView
          report={report}
          frozen
          footer={
            <p className="text-center text-[12px] text-gray-400">
              Sample report. &ldquo;Maya&rdquo; is invented, and her numbers are generated to show what a real report looks like.
            </p>
          }
        />
      </div>
    </div>
  );
}
