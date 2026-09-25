"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApproveInvite({ token, studentEmail }: { token: string; studentEmail: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");

  async function approve() {
    setState("saving");
    setError("");
    const res = await fetch("/api/account/accept-parent-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setState("idle");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <div className="rounded-xl bg-[#eaf6ef] p-4 text-[14px] text-accent">
        Connected. Your parent's dashboard is live.{" "}
        <button onClick={() => router.push("/dashboard")} className="font-semibold underline">
          Go to your dashboard
        </button>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-3 text-[12.5px] text-stone-500">
        Signed in as <span className="font-medium text-ink">{studentEmail}</span>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button onClick={approve} disabled={state === "saving"} className="flex-1 rounded-lg bg-forest py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {state === "saving" ? "Connecting..." : "Connect"}
        </button>
        <button onClick={() => router.push("/dashboard")} className="flex-1 rounded-lg border border-[#ddd3bf] py-2.5 text-sm font-semibold text-ink hover:bg-[#eef3e9]">
          Not now
        </button>
      </div>
      {error && <div className="mt-2 text-sm text-red-700">{error}</div>}
    </div>
  );
}
