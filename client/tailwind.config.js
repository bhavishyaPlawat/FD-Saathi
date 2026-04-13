/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ── Primary: Digital Saathi green ──────────────────────
        primary: {
          50: "#E8F7F2",
          100: "#C5EAD9",
          200: "#9FDDC0",
          300: "#6DCCA3",
          400: "#3DBD88",
          500: "#1D9E75", // ← main brand green
          600: "#0F7A59",
          700: "#0A5C42",
          800: "#063D2C",
          900: "#031F16",
        },
        // ── Secondary: warm gold ────────────────────────────────
        secondary: {
          50: "#FDF5E8",
          100: "#F9E5BE",
          200: "#F4D090",
          300: "#EDBA62",
          400: "#E6A43A",
          500: "#C8963E", // ← brand gold
          600: "#9E7130",
          700: "#784F22",
          800: "#523216",
          900: "#2C180A",
        },
        // ── Tertiary: dark navy ─────────────────────────────────
        tertiary: {
          500: "#0F1C2E",
          600: "#0A1420",
          700: "#060D15",
        },
        // ── Neutral background ──────────────────────────────────
        neutral: "#F8F6F1",
        surface: "#F8F6F1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        headline: ['"Be Vietnam Pro"', "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
