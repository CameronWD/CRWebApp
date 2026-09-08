/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F4',
        surface: '#FFFFFF',
        ink: '#2F3634',
        mist: '#6B7572',
        sage: {
          DEFAULT: '#7C9885',
          deep: '#5F7D6A',
          soft: '#E5EDE7',
        },
        blue: {
          dusty: '#7A93AC',
          soft: '#E7EEF4',
        },
        night: {
          bg: '#191D1B',
          surface: '#242927',
          ink: '#E7E5E0',
          mist: '#9AA39F',
        },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        body: ['"Inter Variable"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
