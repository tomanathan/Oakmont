"use client";

import { useState } from "react";
import type { PlanId } from "@/lib/stripe";

export interface PlanOption {
  id: PlanId;
  amountCents: number;
  currency: string;
  interval: string | null;
}

function formatAmount(cents: number, currency: string): string {
  const amount = cents / 100;
  const formatted = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
  const symbol = currency.toLowerCase() === "usd" ? "$" : `${currency.toUpperCase()} `;
  return `${symbol}${formatted}`;
}

export function SubscribeClient({ plans }: { plans: PlanOption[] }) {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  const monthly = plans.find((p) => p.id === "monthly");
  const sixmonth = plans.find((p) => p.id === "sixmonth");

  async function startCheckout(plan: PlanId) {
    setError("");
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Couldn't start checkout. Please try again.");
        setLoadingPlan(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {monthly && (
          <div className="bg-white border border-[#e2d7c1] rounded-2xl p-6 flex flex-col">
            <div className="mb-1 flex items-baseline gap-1.5">
              <span className="text-[36px] leading-none font-display font-semibold text-ink">
                {formatAmount(monthly.amountCents, monthly.currency)}
              </span>
              <span className="text-sm text-stone-500">/month</span>
            </div>
            <div className="text-sm text-stone-500 mb-5">
              Pay month to month, cancel anytime. Starts with a 7-day free trial — your card isn&apos;t
              charged until it ends.
            </div>
            <button
              onClick={() => startCheckout("monthly")}
              disabled={loadingPlan !== null}
              className="mt-auto w-full py-3 rounded-lg border border-[#d5c8ae] text-ink font-semibold text-sm disabled:opacity-60"
            >
              {loadingPlan === "monthly" ? "Redirecting..." : "Start free trial"}
            </button>
          </div>
        )}

        {/* Full Course Access, second after Monthly -- one payment, nothing to cancel, and
            enough runway (6 months) for nearly any student's whole prep
            window, so it's framed as the primary way to get this rather
            than a discount alternative to the subscription. */}
        {sixmonth && (
          <div className="relative bg-white border-2 border-ink rounded-2xl p-6 flex flex-col">
            <div className="absolute -top-3 left-6 bg-forest text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
              Full course access
            </div>
            <div className="mt-2 mb-1 flex items-baseline gap-1.5">
              <span className="text-[36px] leading-none font-display font-semibold text-ink">
                {formatAmount(sixmonth.amountCents, sixmonth.currency)}
              </span>
              <span className="text-sm text-stone-500">one time</span>
            </div>
            <div className="text-sm text-stone-500 mb-5">
              6 months of access, paid once. Covered through a retake: if they sit the SAT again, access extends free.
            </div>
            <button
              onClick={() => startCheckout("sixmonth")}
              disabled={loadingPlan !== null}
              className="mt-auto w-full py-3 rounded-lg bg-forest text-white font-semibold text-sm disabled:opacity-60"
            >
              {loadingPlan === "sixmonth" ? "Redirecting..." : "Get full access"}
            </button>
          </div>
        )}
      </div>

      {error && <div className="text-red-700 text-sm mt-4 text-center">{error}</div>}
    </div>
  );
}
