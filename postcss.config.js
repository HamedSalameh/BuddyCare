// PostCSS config — Tailwind CSS v4 via @tailwindcss/postcss
// (Angular's esbuild builder reads this when present)
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
