import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "Elevate SAT Prep",
  description: "A full 6-month SAT curriculum built around every official subskill.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
