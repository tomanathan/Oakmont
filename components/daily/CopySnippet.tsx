"use client";

import { PenTick, seedOf } from "@/components/paper/Pencil";
import { useShareText } from "./useShareText";

const MANUAL_HINT = "Couldn't copy in this browser. The code is selected so you can copy it yourself.";

/** A block of code to paste elsewhere, in a read-only box with a Copy button. */
export function CopySnippet({ code, label }: { code: string; label: string }) {
  const { copied, manual, fieldRef, copy } = useShareText(code);
  return (
    <div>
      <textarea
        ref={fieldRef}
        readOnly
        rows={6}
        value={code}
        aria-label={label}
        spellCheck={false}
        onFocus={(e) => e.currentTarget.select()}
        className="block w-full resize-none rounded-lg border border-[#b4c5e6] bg-[#eef3fb] px-3 py-2.5 font-mono text-[14px] leading-relaxed text-ink focus:border-[#4a67a6] focus:outline-none"
      />
      <button
        type="button"
        onClick={copy}
        className="relative mt-3 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-forest px-6 text-[16px] font-semibold text-white transition-colors hover:bg-[#1f2f5a] sm:w-auto"
      >
        {/* Both labels share one grid cell so the button keeps its width. */}
        <span className="inline-grid">
          <span className={`col-start-1 row-start-1 ${copied ? "invisible" : ""}`}>Copy the code</span>
          <span className={`col-start-1 row-start-1 ${copied ? "" : "invisible"}`}>Copied</span>
        </span>
        <PenTick show={copied} seed={seedOf(code)} className="-right-3 -top-3.5 h-[24px] w-[28px]" />
      </button>
      <p aria-live="polite" className={manual ? "mt-2 text-[14px] text-stone-600" : "sr-only"}>
        {manual ? MANUAL_HINT : copied ? "Code copied." : ""}
      </p>
    </div>
  );
}
