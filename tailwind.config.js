/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f2f0eb',
          100: '#e0ddd4',
          200: '#c5c0b3',
          300: '#a8a28f',
          400: '#8c8570',
          500: '#706958',
          600: '#574f41',
          700: '#3e382e',
          800: '#26221b',
          900: '#0f0d09',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      }
    },
  },
  plugins: [],
}
