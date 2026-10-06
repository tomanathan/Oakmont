import { PetAvatar } from "./PetAvatar";
import type { PetState } from "@/lib/pet";

const STAGE_BG: Record<string, string> = {
  thriving: "bg-[#eaf6ef] border-[#cde8d9]",
  content: "bg-[#e4ecfa] border-[#c2d1ee]",
  hungry: "bg-[#fbf1df] border-[#f0ddb8]",
  cold: "bg-[#e8f1fb] border-[#c9dcf2]",
};

export function PetCard({
  petName,
  state,
  costume = null,
}: {
  petName: string;
  state: PetState;
  costume?: string | null;
}) {
  return (
    <div className={`border rounded-xl p-4 mb-5 flex items-center gap-4 ${STAGE_BG[state.stage]}`}>
      <PetAvatar stage={state.stage} size={64} costume={costume} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink mb-0.5">{petName}</div>
        <div className="text-xs text-stone-600 leading-relaxed">{state.message}</div>
      </div>
    </div>
  );
}
