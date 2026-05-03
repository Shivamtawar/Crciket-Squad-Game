/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        'game-dark': '#0f172a',
        'game-sidebar': '#ffffff',
        'game-accent': '#6366f1',
        'neon-purple': '#a855f7'
      }
    },
  },
  plugins: [],
}
