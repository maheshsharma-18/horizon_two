import type { Config } from "tailwindcss";

// Base palette comes from the shipped marketing site (index.html's inline
// `tailwind.config`) so primary/secondary/tertiary/error stay identical to
// the landing page. Three tokens are corrected from that file's literal
// values — background, on-surface, on-surface-variant, and outline — to
// match what the validated dashboard prototype actually uses, which in
// turn matches DESIGN.md's original warm-off-white intent. index.html's
// own surface/text values (#ffffff / #000000 / #555555) had drifted from
// that intent; the dashboard restores it rather than propagating the
// drift further. Primary (#FF5E3A) is confirmed identical across the
// landing page AND the prototype, so it's untouched.
// corsair-blue / corsair-purple are new — both the landing page's hero
// gradient and the dashboard prototype use this exact pair for
// Corsair/agent-flavored accents, so they're promoted to named tokens.
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "on-tertiary-fixed": "#001f29",
        "on-tertiary-container": "#074457",
        "on-secondary-fixed-variant": "#3f4c00",
        "outline-variant": "#ddc0b8",
        surface: "#F7F1E6",
        "secondary-container": "#d6ed7a",
        "inverse-primary": "#ffb59e",
        "tertiary-container": "#80b1c7",
        "surface-bright": "#fffaf2",
        "on-surface-variant": "#56423c",
        tertiary: "#326578",
        "surface-container-highest": "#e8e2d7",
        "on-primary-fixed-variant": "#7f2a0d",
        "on-primary-fixed": "#3a0b00",
        primary: "#FF5E3A",
        "on-surface": "#1d1c15",
        "on-error-container": "#93000a",
        "surface-tint": "#9f4122",
        "surface-container-low": "#f9f3e8",
        "secondary-fixed": "#d6ed7a",
        secondary: "#556500",
        "on-secondary-fixed": "#181e00",
        "on-tertiary": "#ffffff",
        "primary-container": "#ff8a65",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-primary-container": "#752305",
        "tertiary-fixed-dim": "#9ccee4",
        "on-tertiary-fixed-variant": "#154d5f",
        "surface-container-lowest": "#fffdf9",
        background: "#F7F1E6",
        "on-secondary-container": "#5a6c00",
        "surface-container-high": "#ede8dd",
        "inverse-surface": "#333029",
        "on-primary": "#ffffff",
        "tertiary-fixed": "#bbe9ff",
        "primary-fixed-dim": "#ffb59e",
        "on-secondary": "#ffffff",
        "inverse-on-surface": "#f6f0e5",
        "surface-container": "#f3ede2",
        "primary-fixed": "#ffdbd0",
        "on-background": "#1d1c15",
        "secondary-fixed-dim": "#bbd062",
        error: "#ba1a1a",
        "surface-dim": "#dfd9cf",
        "surface-variant": "#f4f4f4",
        outline: "#89726b",
        "corsair-blue": "#38BDF8",
        "corsair-purple": "#C084FC",
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      spacing: {
        unit: "8px",
        gutter: "32px",
        "container-padding": "64px",
        "section-gap": "120px",
        "card-internal": "40px",
      },
      fontFamily: {
        "label-caps": ["Plus Jakarta Sans"],
        "headline-lg": ["Plus Jakarta Sans"],
        "body-lg": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"],
        "display-xl": ["Plus Jakarta Sans"],
        "body-md": ["Plus Jakarta Sans"],
      },
      fontSize: {
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "700" }],
        "headline-lg": ["40px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "display-xl": ["64px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "800" }],
        "body-md": ["16px", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" }],
        // Dashboard-only additions, same scale logic as the landing page tokens
        "headline-sm": ["20px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-sm": ["14px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "body-xs": ["12px", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "500" }],
      },
      animation: {
        gradient: "gradient-shift 15s ease infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-up": "fade-up 0.4s ease-out both",
      },
      keyframes: {
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
