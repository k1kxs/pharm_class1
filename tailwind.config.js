/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        gradientColorStops: theme => ({
          ...theme('colors'),
        }),
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }