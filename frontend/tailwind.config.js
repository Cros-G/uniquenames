/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0F1419',
        'card-bg': '#1A202C',
        'accent': '#8B5CF6',
        'text-primary': '#F7FAFC',
        'text-secondary': '#A0AEC0',
      },
    },
  },
  plugins: [],
}

