import type { Metadata } from "next";

// The page itself is a client component, which can't export metadata.
export const metadata: Metadata = { title: "Set a new password · Oakmont", robots: { index: false, follow: false } };

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
