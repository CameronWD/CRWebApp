/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        mist: 'rgb(var(--c-mist) / <alpha-value>)',
        sage: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)',
          deep: 'rgb(var(--c-accent-deep) / <alpha-value>)',
          soft: 'rgb(var(--c-accent-soft) / <alpha-value>)',
        },
        blue: {
          dusty: 'rgb(var(--c-second) / <alpha-value>)',
          soft: 'rgb(var(--c-second-soft) / <alpha-value>)',
        },
        night: {
          bg: 'rgb(var(--c-night-bg) / <alpha-value>)',
          surface: 'rgb(var(--c-night-surface) / <alpha-value>)',
          ink: 'rgb(var(--c-night-ink) / <alpha-value>)',
          mist: 'rgb(var(--c-night-mist) / <alpha-value>)',
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
