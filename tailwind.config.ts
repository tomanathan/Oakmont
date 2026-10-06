import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The app's palette, shared with the homepage's notebook
        // (components/landing/notebook/notebook.css): a soft royal blue for
        // actions, links and lines; navy for reading text; cool paper
        // grounds. The names are historical (the app used to be hunter
        // green on ivory) and are kept so every existing class still works:
        // "forest" is the brand blue, "sage" its quiet companion for labels
        // and hairlines, "ivory"/"parchment" the paper grounds.
        ink: "#1f2f5a",
        accent: "#3461c1",
        ivory: "#f3f6fc",
        parchment: "#e9effb",
        forest: {
          DEFAULT: "#3461c1",
          600: "#2a4f9f",
          900: "#1f2f5a",
        },
        sage: {
          DEFAULT: "#4a67a6",
          light: "#c2d1ee",
        },
        pastel: {
          sage: "#dde7f7",
          sky: "#dde8f1",
          blush: "#f4e1dc",
          butter: "#fbeec0",
        },
        // Tailwind's warm "stone" grays, swapped for the cool "slate" ones
        // so every neutral in the app sits with the blue.
        stone: colors.slate,
      },
      fontFamily: {
        // Reserved for the brand wordmark and page titles -- see
        // app/layout.tsx. Tailwind's built-in `stone` palette (warm
        // neutral grays) is used alongside this for the same brand chrome,
        // no override needed there.
        display: ["var(--font-display)", "Georgia", "serif"],
        // Instrument Sans, the notebook's reading face (loaded in
        // app/layout.tsx), for all app text.
        sans: ["var(--font-ui)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
