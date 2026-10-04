import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminView } from "./AdminView";
import { loadAdminData } from "./data";

// The owner's view of the business: every student and parent, where each is
// in the free week, who pays, and who's actually studying (and how). Visitor
// traffic (pages, referrers, countries) lives in Vercel Analytics instead.
// Gated by requireAdmin (Google sign-in + an admin email); 404 for anyone else.

export const metadata: Metadata = { title: "Admin · Oakmont", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const now = new Date();
  return <AdminView data={await loadAdminData(now)} now={now} />;
}
