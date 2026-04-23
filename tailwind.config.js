/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/src/**/*.{js,jsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      animation: {
        blink: 'blink 1.2s step-end infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
      },
    },
  },
  plugins: [],
}
