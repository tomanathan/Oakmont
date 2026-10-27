import Link from "next/link";
import type { Metadata } from "next";
import { sampleParentReport } from "@/lib/parentDemo";
import { ParentReportView } from "@/components/parent/ParentReportView";
import { SiteHeader } from "@/components/landing/notebook/SiteHeader";

export const metadata: Metadata = {
  title: "What parents see | Oakmont",
  description:
    "The full parent view: every study session, every skill and every score, as it happens.",
};

// The whole parent report with sample data, linked from the homepage's
// parent section.
export default function SampleParentReportPage() {
  const report = sampleParentReport(new Date());
  return (
    <div className="min-h-screen bg-[#f1f5fc] font-sans">
      <SiteHeader />
      <div className="mx-auto max-w-[1180px] px-4 pb-16 pt-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-pastel-sage px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-forest">
            Sample parent view
          </span>
          <Link
            href="/parent/login?mode=signup"
            className="rounded-lg bg-forest px-3.5 py-1.5 text-[13px] font-semibold text-white"
          >
            Create a parent account
          </Link>
        </div>
        <ParentReportView
          report={report}
          frozen
          footer={
            <p className="text-center text-[13px] text-stone-500">
              This is the view you&apos;ll have of your child&apos;s prep,
              updated every time they practice.
            </p>
          }
        />
      </div>
    </div>
  );
}
