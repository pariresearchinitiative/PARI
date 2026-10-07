import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1915",
        muted: "#5c574e",
        paper: "#f4efe6",
        "paper-2": "#ebe4d6",
        rule: "#d7cfc0",
        accent: "#7a2e2e",
        pine: "#1f4a42"
      },
      fontFamily: {
        serif: ['"Source Serif 4"', "Georgia", "serif"],
        sans: ['"Source Sans 3"', "ui-sans-serif", "system-ui", "sans-serif"]
      },
      maxWidth: {
        page: "72rem"
      }
    }
  },
  plugins: []
};

export default config;
