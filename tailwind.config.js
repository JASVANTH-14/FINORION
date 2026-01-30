/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyberbg: '#111926',
        neongreen: '#9FEF00',
        neongreen_dark: '#7BC100',
        neongreen_light: '#B0FF1A',
      },
    },
  },
  plugins: [],
};
