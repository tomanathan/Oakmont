import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { AdminView, type AdminRow } from "./AdminView";

// The owner's view of the business: who signed up (email or Google), where
// they are in the free week, who pays, and who's actually studying. Visitor
// traffic (pages, referrers, countries) lives in Vercel Analytics instead.
// Gated by requireAdmin (Google sign-in + an admin email); 404 for anyone else.

export const metadata: Metadata = { title: "Admin · Oakmont", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function loadUsers(): Promise<AdminRow[]> {
  return prisma.user
    .findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      firstName: true,
      createdAt: true,
      passwordHash: true,
      googleSub: true,
      welcomeSeenAt: true,
      lastActiveDate: true,
      lastLoginAt: true,
      subscriptionStatus: true,
      accessExpiresAt: true,
      trialEndsAt: true,
      starterResult: true,
      firstStudiedAt: true,
      firstPaidAt: true,
      parentLinks: { select: { createdAt: true, parent: { select: { passwordHash: true, googleSub: true } } } },
      _count: {
        select: {
          itemAttempts: true,
          progress: { where: { passedAt: { not: null } } },
          parentLinks: true,
        },
      },
    },
  })
    .then((rows) =>
      rows.map(({ starterResult, parentLinks, ...r }) => ({
        ...r,
        viaStart: starterResult !== null,
        parentsConnectedAt: parentLinks.filter((l) => !!l.parent.passwordHash || !!l.parent.googleSub).map((l) => l.createdAt),
      }))
    );
}

export default async function AdminPage() {
  await requireAdmin();
  const [users, parentsTotal, parentsClaimed] = await Promise.all([
    loadUsers(),
    prisma.parent.count(),
    prisma.parent.count({ where: { passwordHash: { not: null } } }),
  ]);
  return <AdminView users={users} parentsTotal={parentsTotal} parentsClaimed={parentsClaimed} now={new Date()} />;
}

