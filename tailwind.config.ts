import type { Config } from "tailwindcss";

/**
 * Tailwind config for SKO-LA.
 * Colors are exposed as CSS variables in index.css and swap automatically
 * via [data-mode="junior"|"cyber"] on <html>. Components must use semantic
 * token classes (bg-primary, text-foreground, …) — never hardcoded colors.
 */
export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        coin: {
          DEFAULT: "hsl(var(--coin))",
          foreground: "hsl(var(--coin-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in":        { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "scale-in":       { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        "coin-spin":      { "0%": { transform: "rotateY(0deg)" }, "100%": { transform: "rotateY(360deg)" } },
        "float":          { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        "pulse-glow":     { "0%,100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.5)" }, "50%": { boxShadow: "0 0 0 12px hsl(var(--primary) / 0)" } },
        "glitch":         { "0%,100%": { transform: "translate(0)" }, "20%": { transform: "translate(-2px, 1px)" }, "40%": { transform: "translate(2px, -1px)" }, "60%": { transform: "translate(-1px, -2px)" }, "80%": { transform: "translate(1px, 2px)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":        "fade-in 0.4s var(--ease-bounce)",
        "scale-in":       "scale-in 0.3s var(--ease-bounce)",
        "coin-spin":      "coin-spin 1.6s linear infinite",
        "float":          "float 3s ease-in-out infinite",
        "pulse-glow":     "pulse-glow 2s ease-in-out infinite",
        "glitch":         "glitch 0.3s linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
