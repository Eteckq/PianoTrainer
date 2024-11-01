/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        pallet: {
          black: "#000000",
          primary: "#14213D",
          secondary: "#FCA311",
          text: "#E5E5E5",
          white: "#FFFFFF",
        }
      }
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
