import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/landing/notebook/SiteHeader";

export const metadata: Metadata = { title: "Page not found · Oakmont", robots: { index: false } };

// Any address the site doesn't have (and notFound() from a page): the
// homepage's top bar over a notebook page (see .nbk-page in globals.css),
// with the two places a visitor most likely wanted.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <div className="nbk-page mx-auto my-6 w-[calc(100%-24px)] font-sans sm:my-8 md:w-[calc(100%-80px)] max-w-[610px]">
        <span className="nbk-spiral" aria-hidden />
        <h1 className="font-display text-[28px] font-semibold leading-tight text-ink">This page isn&apos;t in the notebook</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-stone-600">The link may be old, or the address may be mistyped.</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href="/" className="rounded-lg bg-forest px-5 py-2.5 text-center text-sm font-semibold text-white">
            Back to the homepage
          </Link>
          <Link href="/start" className="rounded-lg border border-[#b4c5e6] bg-white px-5 py-2.5 text-center text-sm font-semibold text-ink hover:bg-[#e9effb]">
            Try 5 SAT questions
          </Link>
        </div>
      </div>
    </>
  );
}
