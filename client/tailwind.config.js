/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
    fontFamily: {
      'nunito': ['nunito', 'sans-serif'],
      'roboto': ['roboto', 'sans-serif'],
      'MyFont': ['"My Font"', 'serif'], // Ensure fonts with spaces have " " surrounding it.
    },
  },
  plugins: [],
};
