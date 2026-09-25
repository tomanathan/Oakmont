// Grant (or take back) complimentary access for a student, by email.
//
//   npx tsx scripts/grant-access.ts student@example.com            # 182 days (a 6-month pass)
//   npx tsx scripts/grant-access.ts student@example.com 30         # 30 days
//   npx tsx scripts/grant-access.ts student@example.com --until 2027-06-05
//   npx tsx scripts/grant-access.ts student@example.com --revoke
//
// Works the same way a 6-month pass does: it sets User.accessExpiresAt,
// which lib/subscription.ts treats as paid access until that moment. It
// never shortens existing access (unless --revoke), never touches Stripe,
// and doesn't affect a real subscription the student may also have.
//
// Uses DATABASE_URL from .env -- in this repo that's the PRODUCTION
// database, so this changes a real account. Prints the before and after.

import { PrismaClient } from "@prisma/client";

const DAY = 24 * 60 * 60 * 1000;

function usage(msg?: string): never {
  if (msg) console.error(`Error: ${msg}\n`);
  console.error("Usage: npx tsx scripts/grant-access.ts <email> [days | --until YYYY-MM-DD | --revoke]");
  process.exit(1);
}

async function main() {
  const [rawEmail, ...rest] = process.argv.slice(2);
  if (!rawEmail || !rawEmail.includes("@")) usage("give the student's email.");
  const email = rawEmail.trim().toLowerCase();

  let until: Date | null = null;
  let revoke = false;
  if (rest[0] === "--revoke") {
    revoke = true;
  } else if (rest[0] === "--until") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rest[1] ?? "")) usage("--until needs a date like 2027-06-05.");
    until = new Date(`${rest[1]}T23:59:59Z`);
  } else {
    const days = rest[0] === undefined ? 182 : Number(rest[0]);
    if (!Number.isFinite(days) || days <= 0 || days > 3650) usage("days must be a number between 1 and 3650.");
    until = new Date(Date.now() + days * DAY);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, accessExpiresAt: true, subscriptionStatus: true },
    });
    if (!user) usage(`no student account with the email ${email}.`);

    const before = user.accessExpiresAt;
    let next: Date | null;
    if (revoke) {
      next = null;
    } else {
      // Never shorten access someone already has.
      next = before && before.getTime() > until!.getTime() ? before : until;
    }

    await prisma.user.update({ where: { id: user.id }, data: { accessExpiresAt: next } });

    const fmt = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "none");
    console.log(`${user.firstName ?? "Student"} <${user.email}>`);
    console.log(`  access until: ${fmt(before)} -> ${fmt(next)}`);
    if (!revoke && before && next === before) console.log("  (already had access past that date, so it was left as is)");
    if (user.subscriptionStatus) console.log(`  note: also has a Stripe subscription (${user.subscriptionStatus}); that's unchanged.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
