import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ScoutCompanion } from "@/components/ScoutCompanion";

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
      {/* Ozho is mounted once here, above the per-page content, so it
          persists across client-side navigation instead of resetting
          (position, mood, walk state) every time the route changes. */}
      <body className="bg-white text-ink font-sans antialiased">
        {children}
        <ScoutCompanion />
      </body>
    </html>
  );
}
