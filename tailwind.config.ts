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
        // Homepage theme, "old money": an ivory ground with parchment for
        // alternating sections, hunter green for weight, and antique brass
        // as the single accent (rules, labels, ornaments, emphasis).
        ivory: "#faf6ec",
        parchment: "#f2eadb",
        forest: {
          DEFAULT: "#1f3b2d",
          600: "#2c4c3b",
          900: "#142219",
        },
        brass: {
          DEFAULT: "#a8834b",
          light: "#d9c7a0",
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
