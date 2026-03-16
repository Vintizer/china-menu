/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        red: {
          DEFAULT: '#D62828',
          dark: '#B01E1E',
          light: '#FFF0F0',
        },
        gold: {
          DEFAULT: '#CFAE67',
          light: '#F5EDD6',
        },
        warm: {
          DEFAULT: '#F7F3E9',
          dark: '#EDE7D6',
        },
        ink: '#1A1A1A',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        cn: ['"Noto Serif SC"', 'serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.14)',
        bottom: '0 -2px 20px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
