/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./resources/**/*.{js,ts,jsx,tsx,html}",   //  add this line
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
