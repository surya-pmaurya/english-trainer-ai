/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: { ink: "#172033", mint: "#15b886", lavender: "#7469ee" },
      boxShadow: { soft: "0 16px 45px -22px rgb(28 39 63 / 28%)" },
    },
  },
  plugins: [],
};
