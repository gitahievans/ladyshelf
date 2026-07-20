import type { Config } from "tailwindcss";

const config = {
  darkMode: false,
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#1A1009",
        mahogany: "#3D1F0D",
        bark: "#7A4522",
        sand: "#C9A87C",
        gold: "#D4A853",
        ivory: "#FAF6F0",
        cream: "#F2EAD8",
        "border-warm": "#E0D5C5",
        "text-primary": "#1A1009",
        "text-secondary": "#5C3D1E",
        "text-muted": "#9C7E5F",
        success: "#3A6B4A",
        error: "#8B2E2E",
        warning: "#C47F17",
      },
      fontFamily: {
        cormorant: ["Cormorant Garamond", "Georgia", "serif"],
        "dm-sans": ["DM Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["96px", { lineHeight: "1.0" }],
        "display-xl": ["72px", { lineHeight: "1.05" }],
        "display-lg": ["56px", { lineHeight: "1.1" }],
        h1: ["48px", { lineHeight: "1.15" }],
        h2: ["36px", { lineHeight: "1.2" }],
        h3: ["28px", { lineHeight: "1.25" }],
        h4: ["22px", { lineHeight: "1.3" }],
        "body-lg": ["18px", { lineHeight: "1.6" }],
        body: ["16px", { lineHeight: "1.6" }],
        "body-sm": ["14px", { lineHeight: "1.5" }],
        label: ["13px", { lineHeight: "1.4", letterSpacing: "0.08em" }],
        caption: ["12px", { lineHeight: "1.4" }],
        price: ["20px", { lineHeight: "1.2" }],
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
        24: "96px",
        32: "128px",
      },
      maxWidth: {
        container: "1280px",
        "auth-card": "420px",
      },
      inset: {
        "shop-sidebar": "calc(var(--navbar-height) + var(--spacing-4))",
      },
      maxHeight: {
        "shop-sidebar":
          "calc(100vh - var(--navbar-height) - var(--spacing-8))",
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 8px 32px rgba(26,16,9,0.12)",
        "card-hover": "0 16px 48px rgba(26,16,9,0.18)",
        drawer: "-4px 0 32px rgba(26,16,9,0.16)",
        "bottom-sheet": "0 -4px 32px rgba(26,16,9,0.12)",
      },
      aspectRatio: {
        product: "3 / 4",
        category: "4 / 3",
      },
    },
  },
} satisfies Config;

export default config;
