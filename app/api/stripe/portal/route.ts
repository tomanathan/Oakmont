import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";

const APP_URL = process.env.APP_URL || "https://oakmontsat.com";

// Opens Stripe's hosted Billing Portal for the logged-in student's
// Customer -- where a monthly subscriber cancels, updates their card, or
// downloads invoices. What the portal allows (cancellation in particular)
// is configured in the Stripe Dashboard, not here. Same shape as checkout:
// returns { url } and the client redirects to it.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { stripeCustomerId: true },
  });
  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found." }, { status: 404 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${APP_URL}/settings`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Billing portal session failed:", err);
    return NextResponse.json({ error: "Couldn't open billing. Please try again." }, { status: 502 });
  }
}
