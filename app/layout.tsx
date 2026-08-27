import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ScoutCompanion } from "@/components/ScoutCompanion";

export const metadata: Metadata = {
  title: "Oakmont Study Center",
  description: "A full 6-month SAT curriculum built around every official subskill.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Scout is mounted once here, above the per-page content, so it
          persists across client-side navigation instead of resetting
          (position, mood, walk state) every time the route changes. */}
      <body className="bg-white text-ink font-sans antialiased">
        {children}
        <ScoutCompanion />
      </body>
    </html>
  );
}
