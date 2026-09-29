import type { PetStage } from "@/lib/pet";
import { PixelDog, type DogMood } from "./PixelDog";

export const MOOD_BY_STAGE: Record<PetStage, DogMood> = {
  thriving: "happy",
  content: "neutral",
  hungry: "tired",
  napping: "tired",
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
      asleep={stage === "napping"}
      costume={costume}
      className={stage === "thriving" ? "animate-flame-pulse" : ""}
    />
  );
}
