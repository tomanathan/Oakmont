import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a2e",
        accent: "#2f6f4f",
        // Homepage pastels: a soft ground plus a deeper ink of the same hue
        // for numbers, icons and labels that sit on it.
        pastel: {
          lilac: "#ece8fb",
          sky: "#e2effb",
          mint: "#dff3e7",
          butter: "#fcf1c9",
          peach: "#fde5d6",
          blush: "#fbe2ec",
        },
        pastelInk: {
          lilac: "#4a5bb0",
          sky: "#2b6497",
          mint: "#2f6f4f",
          butter: "#8a6510",
          peach: "#a44d23",
          blush: "#a23d69",
        },
      },
      fontFamily: {
        // Reserved for the brand wordmark and page titles -- see
        // app/layout.tsx. Tailwind's built-in `stone` palette (warm
        // neutral grays) is used alongside this for the same brand chrome,
        // no override needed there.
        display: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
