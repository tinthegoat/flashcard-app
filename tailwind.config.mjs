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
    },
  },
  plugins: [],
};
