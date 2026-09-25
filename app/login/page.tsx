"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { PixelDog } from "@/components/PixelDog";
import { LegalFooter } from "@/components/LegalFooter";
import { LoginCard } from "@/components/LoginCard";

function LoginPageContent() {
  // "Start free" on the landing page links here with ?mode=signup so a
  // visitor who just clicked "sign up" doesn't land on the login tab first.
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  return (
    <div className="max-w-[420px] mx-auto px-6 py-8 font-sans">
      <Link href="/" className="inline-block text-sm text-stone-500 transition-colors hover:text-ink">
        &larr; Back to home
      </Link>
      <div className="text-center mb-8 mt-6">
        <Link href="/" aria-label="Oakmont Study Center home" className="inline-block">
          <BrandMark size={56} className="mx-auto mb-3" />
        </Link>
        <div className="font-display font-semibold text-[28px] text-ink mb-1">Oakmont Study Center</div>
        <div className="text-sm text-stone-500">
          A complete SAT plan, paced to your test date.
        </div>
      </div>
      {/* Ozho doesn't roam on this page (see ScoutCompanion's HIDDEN_ON),
          so he waits on top of the form instead -- the first glimpse of
          him for someone signing up, a familiar face for someone back. */}
      <div className="relative">
        <div className="pointer-events-none absolute -top-[37px] right-6 z-10" aria-hidden>
          <PixelDog size={52} sitting mood="happy" facing={-1} shadow={false} />
        </div>
        <LoginCard initialMode={initialMode} next={searchParams.get("next")} />
      </div>
      <div className="text-center text-xs text-stone-500 mt-4">
        Your progress is saved automatically and syncs whenever you log back in.
      </div>
      <LegalFooter className="mt-6" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
