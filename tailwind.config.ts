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
        // Homepage theme: one periwinkle family (700 is the brand's link
        // color) used in gradients and tinted shadows, a cream ground that
        // separates sections, and one highlighter accent for what matters.
        tint: {
          50: "#f6f5fe",
          100: "#eceafb",
          200: "#dcd8f6",
          300: "#c2bcee",
          400: "#9f98e0",
          700: "#4a5bb0",
          800: "#343f85",
        },
        cream: "#fbf8f1",
        hi: "#ffd15c",
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
