"use client";

import { useState } from "react";
import type { PlanId } from "@/lib/stripe";
import { formatPrice } from "@/lib/price";

export interface PlanOption {
  id: PlanId;
  amountCents: number;
  currency: string;
  interval: string | null;
}

// trialEndsOn: set while the student is still in their free week, so each
// plan can say when it actually starts.
export function SubscribeClient({
  plans,
  trialEndsOn,
  parentConnected = false,
}: {
  plans: PlanOption[];
  trialEndsOn: string | null;
  parentConnected?: boolean;
}) {
  const [asked, setAsked] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function askParent() {
    setAsked("sending");
    const res = await fetch("/api/account/ask-parent-pay", { method: "POST" }).catch(() => null);
    setAsked(res?.ok ? "sent" : "error");
  }
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
          <div className="bg-white border border-[#c9d6ee] rounded-2xl p-6 flex flex-col">
            <div className="mb-1 flex items-baseline gap-1.5">
              <span className="text-[36px] leading-none font-display font-semibold text-ink">
                {formatPrice(monthly.amountCents, monthly.currency)}
              </span>
              <span className="text-sm text-stone-500">/month</span>
            </div>
            <div className="text-sm text-stone-500 mb-5">
              Pay month to month, cancel anytime.
              {trialEndsOn ? ` Your first charge is on ${trialEndsOn}, when your free trial ends.` : ""}
            </div>
            <button
              onClick={() => startCheckout("monthly")}
              disabled={loadingPlan !== null}
              className="mt-auto w-full py-3 rounded-lg border border-[#b4c5e6] text-ink font-semibold text-sm disabled:opacity-60"
            >
              {loadingPlan === "monthly" ? "Redirecting..." : "Choose monthly"}
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
                {formatPrice(sixmonth.amountCents, sixmonth.currency)}
              </span>
              <span className="text-sm text-stone-500">one time</span>
            </div>
            <div className="text-sm text-stone-500 mb-5">
              6 months of access, paid once{trialEndsOn ? `, counted from ${trialEndsOn}` : ""}. Covered through a retake: if
              they sit the SAT again, access extends free.
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

      {/* Parents usually pay: one tap sends them straight to it. */}
      <div className="mt-6 rounded-2xl border border-[#c9d6ee] bg-[#f3f6fc] p-5 text-center">
        {parentConnected ? (
          asked === "sent" ? (
            <div className="text-sm font-semibold text-[#2f6f4f]">Sent. We emailed your parent a link to choose your plan.</div>
          ) : (
            <>
              <div className="text-sm text-stone-600">Is a parent paying?</div>
              <button
                onClick={askParent}
                disabled={asked === "sending"}
                className="mt-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-ink ring-1 ring-[#b4c5e6] disabled:opacity-60"
              >
                {asked === "sending" ? "Sending..." : "Ask my parent to choose my plan"}
              </button>
              {asked === "error" && <div className="mt-2 text-sm text-red-700">Couldn&apos;t send it. Please try again.</div>}
            </>
          )
        ) : (
          <div className="text-sm text-stone-600">
            Is a parent paying?{" "}
            <a href="/settings#parents" className="font-semibold text-forest underline underline-offset-4">
              Connect with your parents
            </a>{" "}
            and they can choose your plan from their dashboard.
          </div>
        )}
      </div>
    </div>
  );
}
