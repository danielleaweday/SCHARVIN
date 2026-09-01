/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cabinet Grotesk"', '"Manrope"', "sans-serif"],
        sans: ['"Manrope"', '"General Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        ccdp: {
          black: "#0a0a0b",
          charcoal: "#141417",
          surface: "#1a1a1e",
          cream: "#f4f1ea",
          white: "#ffffff",
          blue: "#2e7bff",
          purple: "#7a3ff2",
          magenta: "#e0349e",
          gold: "#f5a524",
        },
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
