"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { PixelDog } from "@/components/PixelDog";
import { LegalFooter } from "@/components/LegalFooter";
import { LoginCard } from "@/components/LoginCard";

function LoginPageContent({ googleEnabled, inApp }: { googleEnabled: boolean; inApp: boolean }) {
  // "Start free" on the landing page links here with ?mode=signup so a
  // visitor who just clicked "sign up" doesn't land on the login tab first.
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  return (
    <div className="nbk-page mx-auto my-6 w-[calc(100%-24px)] font-sans sm:my-8 md:w-[calc(100%-80px)] max-w-[510px]">
      {/* The notebook page (see .nbk-page in globals.css). */}
      <span className="nbk-spiral" aria-hidden />
      <Link href="/" className="inline-block text-sm text-stone-500 transition-colors hover:text-ink">
        &larr; Back to home
      </Link>
      <div className="text-center mb-8 mt-6">
        <Link href="/" aria-label="Oakmont Study Center home" className="inline-block">
          <BrandMark size={56} className="mx-auto mb-3" />
        </Link>
        <h1 className="font-display font-semibold text-[28px] text-ink mb-1">Oakmont Study Center</h1>
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
        <LoginCard
          initialMode={initialMode}
          next={searchParams.get("next")}
          googleEnabled={googleEnabled}
          inApp={inApp}
          initialError={searchParams.get("error")}
        />
      </div>
      {/* The homepage's "Log in" lands here, and parents click it too. */}
      <div className="mt-4 text-center text-sm text-stone-600">
        Parent?{" "}
        <Link href="/parent/login" className="inline-flex min-h-[44px] items-center font-semibold text-[#26427e] underline underline-offset-2">
          Log in to your parent dashboard
        </Link>
      </div>
      <div className="text-center text-xs text-stone-500 mt-1">
        Your progress is saved automatically and syncs whenever you log back in.
      </div>
      <LegalFooter className="mt-6" />
    </div>
  );
}

// `inApp`: opened inside another app's browser, where Google sign-in is
// hidden (see lib/inAppBrowser.ts) and the card says how to get it back.
export function LoginView({ googleEnabled, inApp = false }: { googleEnabled: boolean; inApp?: boolean }) {
  return (
    <Suspense fallback={null}>
      <LoginPageContent googleEnabled={googleEnabled} inApp={inApp} />
    </Suspense>
  );
}
