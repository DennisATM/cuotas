/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3b82f6',
        'secondary': '#10b981',
        'background-light': '#ffffff',
        'background-dark': '#1f2937',
      },
      fontFamily: {
        'display': 'system-ui, Avenir, Helvetica, Arial, sans-serif',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
