/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#080D16',
        surface: '#101927',
        card: '#141F30',
        line: '#243248',
        ink: '#E7EDF5',
        mute: '#8C9AAF',
        accent: {
          DEFAULT: '#2A9DA8',
          soft: 'rgba(42,157,168,0.14)',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.25), 0 8px 24px -12px rgba(0,0,0,0.5)',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'none' } },
        slideIn: { from: { transform: 'translateX(-100%)' }, to: { transform: 'none' } },
        toastIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: {
        fadeIn: 'fadeIn .22s ease-out both',
        slideIn: 'slideIn .22s ease-out both',
        toastIn: 'toastIn .2s ease-out both',
      },
    },
  },
  plugins: [],
};
