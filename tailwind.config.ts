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
