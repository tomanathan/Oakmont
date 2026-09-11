import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ScoutCompanion } from "@/components/ScoutCompanion";
import { SecondCompanion } from "@/components/SecondCompanion";
import { GlobalConfetti } from "@/components/GlobalConfetti";

// A characterful serif reserved for the brand wordmark and page titles
// (top bar, login/welcome/settle-back-in screens) -- everything else stays
// on the plain sans stack. Self-hosted at build time via next/font, so it
// never depends on a runtime font CDN.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oakmont Study Center",
  description: "A full 6-month SAT curriculum built around every official subskill.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fraunces.variable}>
      {/* Ozho, Mochi, and the confetti layer are mounted once here, above
          the per-page content: both companions persist across client-side
          navigation instead of resetting (position, mood, walk state)
          every time the route changes, and GlobalConfetti listens for
          "ozho:celebrate" from any page so nothing has to render its own
          confetti locally. SecondCompanion (Mochi) renders nothing at all
          until the streak that unlocks it is actually reached -- see its
          own file. */}
      <body className="bg-white text-ink font-sans antialiased">
        {/* The id here is a deliberate hook, not decoration: ScoutCompanion
            measures this element's own height (not document.documentElement's)
            to know how far down the *actual page content* goes. Ozho is a
            sibling of this div, positioned absolutely -- if his own
            wandering were ever measured against the whole document instead,
            his position would count toward that measurement, which is
            exactly the runaway-downward bug this id exists to prevent (see
            pageContentBottom() in ScoutCompanion.tsx for the full story). */}
        <div id="app-content">{children}</div>
        <ScoutCompanion />
        <SecondCompanion />
        <GlobalConfetti />
      </body>
    </html>
  );
}
