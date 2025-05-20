/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        lato: ['Lato', 'Arial', 'sans-serif'],
      },
      colors: {
        corporate: {
          blue: '#0C3B5E',
          lightBlue: '#1965A8',
          red: '#A62A1C',
          yellow: '#DFA921',
          purple: '#2A1CA6',
          green: '#005C14',
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};