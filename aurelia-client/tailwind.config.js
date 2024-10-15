/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html, js, ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          main: "#4e7837",
          dark: "#365426",
        },
        secondary: "#4b4847",
      },
    },
  },
  plugins: [],
}
