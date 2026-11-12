"use client";

import { useEffect } from "react";
import { BrandMark } from "@/components/BrandMark";

// What a visitor sees when a page throws while rendering, instead of
// Next's bare default. Kept to the notebook page and the brand mark (no
// top bar, no data), so there is as little here as possible that could
// fail a second time. The root layout still wraps it; app/global-error.tsx
// covers the layout itself failing.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="nbk-page mx-auto my-6 w-[calc(100%-24px)] font-sans sm:my-8 md:w-[calc(100%-80px)] max-w-[610px]">
      <span className="nbk-spiral" aria-hidden />
      <BrandMark size={48} className="mb-4" />
      <h1 className="font-display text-[28px] font-semibold leading-tight text-ink">Something went wrong on our end</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-stone-600">This page didn&apos;t load. Try again, and if it keeps happening, come back in a few minutes.</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button onClick={() => reset()} className="rounded-lg bg-forest px-5 py-2.5 text-center text-sm font-semibold text-white">
          Try again
        </button>
        {/* A full page load, not a client-side turn: start clean. */}
        <a href="/" className="rounded-lg border border-[#b4c5e6] bg-white px-5 py-2.5 text-center text-sm font-semibold text-ink hover:bg-[#e9effb]">
          Back to the homepage
        </a>
      </div>
    </div>
  );
}
