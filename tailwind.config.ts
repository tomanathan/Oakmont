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
        ink: "#1d2621",
        accent: "#2f6f4f",
        // Homepage theme, following 60-30-10: ivory and parchment grounds
        // (~60%), hunter green for type, buttons and a few panels (~30%),
        // and a small set of muted pastels (~10%) used only as fills behind
        // dark text -- never as text on light grounds, which fails contrast.
        // Sage (deep for small text, light for hairlines) does the quiet
        // structural work: labels, rules, ornaments.
        ivory: "#faf6ec",
        parchment: "#f2eadb",
        forest: {
          DEFAULT: "#1f3b2d",
          600: "#2c4c3b",
          900: "#142219",
        },
        sage: {
          DEFAULT: "#587356",
          light: "#c9d8c2",
        },
        pastel: {
          sage: "#dfe9d8",
          sky: "#dde8f1",
          blush: "#f4e1dc",
          butter: "#f5ecc9",
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
