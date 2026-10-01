import type { SceneColor } from "@/lib/lessonVideos/types";

// The board is dark, so every colour is a bright one. A quantity keeps its
// colour everywhere it appears: in the scene, in the algebra, in the labels.
export const COLOR: Record<SceneColor, string> = {
  blue: "#62C8F2",
  yellow: "#FFEE7C",
  pink: "#FF6FBD",
  green: "#6BE3A4",
  orange: "#FF9A4D",
  purple: "#C8B4FF",
  white: "#F3F1FF",
  gray: "#8E93C4",
};
export const BOARD = "#17193F";
