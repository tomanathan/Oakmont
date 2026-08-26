"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PetAvatar } from "./PetAvatar";
import type { PetState } from "@/lib/pet";

const STAGE_BG: Record<string, string> = {
  thriving: "bg-[#eaf6ef] border-[#cde8d9]",
  content: "bg-[#eef0fc] border-[#d7dbf3]",
  hungry: "bg-[#fbf1df] border-[#f0ddb8]",
  critical: "bg-[#fbeaea] border-[#f0d0d0]",
  dead: "bg-[#f0eff2] border-[#e0dee6]",
};

export function PetCard({ petName, state }: { petName: string; state: PetState }) {
  const router = useRouter();
  const [reviving, setReviving] = useState(false);

  async function startNewPet() {
    setReviving(true);
    try {
      await fetch("/api/pet/revive", { method: "POST" });
      router.refresh();
    } finally {
      setReviving(false);
    }
  }

  return (
    <div className={`border rounded-xl p-4 mb-5 flex items-center gap-4 ${STAGE_BG[state.stage]}`}>
      <PetAvatar stage={state.stage} size={64} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink mb-0.5">{petName}</div>
        <div className="text-xs text-gray-600 leading-relaxed">{state.message}</div>
      </div>
      {state.stage === "dead" && (
        <button
          onClick={startNewPet}
          disabled={reviving}
          className="flex-shrink-0 px-3.5 py-2 rounded-lg bg-ink text-white text-xs font-semibold disabled:opacity-60"
        >
          {reviving ? "..." : "Start a new pet"}
        </button>
      )}
    </div>
  );
}
