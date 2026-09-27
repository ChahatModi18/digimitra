/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spec tokens
        primary: {
          DEFAULT: "#F0592A",
          hover: "#D94A1F",
          light: "#FFE8DE",
        },
        secondary: {
          DEFAULT: "#1B7A6E",
          light: "#DCF2EE",
        },
        "bg-base": "#FDF8F3",
        "bg-surface": "#FFFFFF",
        "bg-surface-alt": "#FFF4ED",
        "bg-sidebar": "#FFFFFF",
        "border-color": "#EDE2D8",
        "border-strong": "#DCCFC2",
        "text-primary": "#241C15",
        "text-secondary": "#6B5D52",
        "text-muted": "#9C8F84",
        "text-on-primary": "#FFFFFF",
        // Semantic
        success: {
          DEFAULT: "#2E8B57",
          bg: "#E8F5EC",
        },
        warning: {
          DEFAULT: "#C88A1D",
          bg: "#FBF1DD",
        },
        error: {
          DEFAULT: "#C1432F",
          bg: "#FBEAE6",
        },
        info: {
          DEFAULT: "#2B6CB0",
          bg: "#E8F1FB",
        },
        // RBDL Levels
        level: {
          0: "#9C8F84",
          1: "#C88A1D",
          2: "#1B7A6E",
          3: "#F0592A",
        },
        // Compatibility brand scale
        brand: {
          50: "#FFF4ED",
          100: "#FFE8DE",
          200: "#FED0BC",
          300: "#FBAA8C",
          400: "#F68058",
          500: "#F0592A",
          600: "#D94A1F",
          700: "#B83A14",
          800: "#942F11",
          900: "#7A2810",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "sans-serif"],
        heading: ["Outfit", "Inter", "sans-serif"],
        devanagari: ["'Noto Sans Devanagari'", "Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        pill: "999px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(36, 28, 21, 0.04)",
        sm: "0 1px 2px rgba(36, 28, 21, 0.06)",
        md: "0 4px 12px rgba(36, 28, 21, 0.08)",
        lg: "0 12px 32px rgba(36, 28, 21, 0.12)",
        card: "0 2px 8px rgba(36, 28, 21, 0.05), 0 1px 2px rgba(36, 28, 21, 0.04)",
        "card-hover": "0 8px 24px rgba(36, 28, 21, 0.08), 0 2px 6px rgba(36, 28, 21, 0.04)",
        "orange-glow": "0 6px 20px -2px rgba(240, 89, 42, 0.35)",
      }
    },
  },
  plugins: [],
}
