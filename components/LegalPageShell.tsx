import Link from "next/link";
import { BrandMark } from "./BrandMark";

// Shared chrome for /terms and /privacy: both are public (no auth, no
// AppShell -- a logged-out visitor or a parent should be able to read
// these without a session) but should still look like the rest of the
// app, not a plain unstyled document dump.
export function LegalPageShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-12 font-sans">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <BrandMark size={28} />
          <span className="font-display font-semibold text-sm text-ink">Oakmont Study Center</span>
        </Link>
        <h1 className="font-display font-semibold text-[28px] text-ink mb-1">{title}</h1>
        <div className="text-xs text-gray-400">Last updated {updated}</div>
      </div>
      <div className="space-y-6 text-[14.5px] leading-relaxed text-gray-700 [&_h2]:font-display [&_h2]:font-semibold [&_h2]:text-[17px] [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-3 [&_strong]:text-ink [&_strong]:font-semibold [&_a]:text-[#4a5bb0] [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
