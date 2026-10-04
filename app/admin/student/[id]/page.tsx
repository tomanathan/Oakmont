import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { loadStudentDetail } from "../../data";
import { StudentView } from "../../StudentView";

// Everything about one student, for the owner. Same gate as /admin.

export const metadata: Metadata = { title: "Student · Admin · Oakmont", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminStudentPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const now = new Date();
  const detail = await loadStudentDetail(params.id, now);
  if (!detail) notFound();
  return <StudentView d={detail} now={now} />;
}
