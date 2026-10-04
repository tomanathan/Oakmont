"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PET_NAME } from "@/lib/pet";
import { PixelDog } from "./PixelDog";

// Shown on arrival whenever Ozho is cold (blue and shivering, a few days
// without study; see lib/pet.ts): says what's going on and that one session
// fixes it, so nobody is left wondering why their dog changed colour.
// Once per login and once per day (`sessionKey`), not on every page load.
export function ColdOzhoNotice({ sessionKey, daysInactive, href }: { sessionKey: string; daysInactive: number; href: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setOpen(window.localStorage.getItem("ozho-cold-seen") !== sessionKey);
    } catch {
      setOpen(true);
    }
  }, [sessionKey]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem("ozho-cold-seen", sessionKey);
    } catch {
      // Private browsing or storage disabled: it just shows again next load.
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/40 backdrop-blur-[2px] p-4" onClick={dismiss}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cold-ozho-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(38,34,24,0.25)] max-w-[440px] w-full p-7 text-center"
      >
        <div className="mx-auto mb-4 grid h-[120px] w-[168px] place-items-center rounded-2xl border border-[#b4cdea] bg-[#cfe1f5]">
          <PixelDog size={120} mood="tired" cold />
        </div>
        <div id="cold-ozho-title" className="font-display font-semibold text-xl text-ink mb-2">
          {PET_NAME} got cold while you were away
        </div>
        <p className="text-sm text-stone-600 leading-relaxed mb-4">
          It&apos;s been {daysInactive} days since your last lesson or quiz. When that happens, {PET_NAME} turns blue and starts to shiver.
        </p>
        <div className="bg-[#eaf1e5] border border-[#c9d8c2] rounded-xl p-4 mb-6 text-sm text-[#2c4c3b] leading-relaxed">
          He&apos;s okay. One lesson or a quick quiz warms him right back up, and your plan picks up where you left off.
        </div>
        <Link href={href} onClick={dismiss} className="block w-full py-3 rounded-lg bg-forest text-white font-semibold text-sm hover:opacity-90">
          Warm him up →
        </Link>
        <button onClick={dismiss} className="mt-3 text-sm font-semibold text-stone-500 hover:text-stone-700">
          Not right now
        </button>
      </div>
    </div>
  );
}
