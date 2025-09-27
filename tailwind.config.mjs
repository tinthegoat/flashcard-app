
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        "bg-scroll": {
          "0%": { "background-position": "center 0%" },
          "100%": { "background-position": "center 100%" },
        },
      },
      animation: {
        "bg-scroll": "bg-scroll 30s linear infinite",
      },
      perspective: {
        1000: '1000px',
      },
      translate: {
        'z-1': '1px',
        'z--1': '-1px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.transform-style-preserve-3d': {
          'transform-style': 'preserve-3d',
        },
      });
    },
  ],
};