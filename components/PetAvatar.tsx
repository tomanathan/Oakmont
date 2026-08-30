import type { PetStage } from "@/lib/pet";
import { PixelDog, type DogMood } from "./PixelDog";

export const MOOD_BY_STAGE: Record<PetStage, DogMood> = {
  thriving: "happy",
  content: "neutral",
  hungry: "tired",
  critical: "sad",
  dead: "sad",
};

export function PetAvatar({
  stage,
  size = 120,
  costume = null,
}: {
  stage: PetStage;
  size?: number;
  costume?: string | null;
}) {
  return (
    <PixelDog
      size={size}
      mood={MOOD_BY_STAGE[stage]}
      dead={stage === "dead"}
      costume={costume}
      className={stage === "thriving" ? "animate-flame-pulse" : ""}
    />
  );
}
