"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SatDate } from "@/lib/satDates";

export interface RetakeCoverProps {
  claimedAt: string | null;
  accessExpiresAt: string | null;
  options: SatDate[];
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

// The 6-month pass's retake cover (see lib/retakeCover.ts): pick the retake
// sitting, access extends through it. In Settings it sits in "Your pass";
// on /subscribe it's offered to a pass holder whose access has lapsed, and
// a successful claim sends them straight back to the dashboard.
export function RetakeCover({ claimedAt, accessExpiresAt, options, after = "refresh" }: RetakeCoverProps & { after?: "refresh" | "dashboard" }) {
  const router = useRouter();
  const [picked, setPicked] = useState<string | null>(options[0]?.date ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (claimedAt && accessExpiresAt) {
    return (
      <p className="text-[13.5px] text-stone-600">
        <span className="font-semibold text-accent">Retake covered.</span> Access runs through {fmt(accessExpiresAt)}.
      </p>
    );
  }
  if (!options.length) return null;

  async function claim() {
    if (!picked) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account/retake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: picked }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Couldn't extend your pass. Try again.");
        setBusy(false);
        return;
      }
      if (after === "dashboard") router.push("/dashboard");
      else router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
      setBusy(false);
    }
  }

  const label = options.find((o) => o.date === picked)?.label;
  return (
    <div>
      <div className="text-[14px] font-semibold text-ink">Retaking the SAT? Your pass covers it.</div>
      <p className="mt-0.5 text-[13px] text-stone-600">Pick the retake date. Access extends through test day, free. One retake per pass.</p>
      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Retake date">
        {options.map((o) => (
          <button
            key={o.date}
            role="radio"
            aria-checked={picked === o.date}
            onClick={() => setPicked(o.date)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              picked === o.date ? "bg-forest text-white" : "bg-white text-ink ring-1 ring-[#d5c8ae] hover:ring-[#587356]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <button
        onClick={claim}
        disabled={!picked || busy}
        className="mt-3 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Extending…" : `Extend through ${label ?? "that date"}`}
      </button>
      {error && <p className="mt-2 text-[13px] text-[#b23b3b]">{error}</p>}
    </div>
  );
}
