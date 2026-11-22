/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b1512",
        surface: "#111f1a",
        "surface-2": "#16261f",
        border: "#223a30",
        brand: {
          DEFAULT: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        muted: "#8aa399",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};
