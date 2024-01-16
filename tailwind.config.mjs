/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#6366f1",
          200: "#8083f2",
          300: "#686bed",
          400: "#6366f1",
          500: "#5053d9",
          600: "#4144ba",
        },
        border: "#282e3d",
        text: "#fff",
        textAlt: "rgb(107 114 128)",
        "bg-base": "#1e2432",
        "bg-alt": "#282d43",
        "bg-dark": "#171c24",
        "bg-black": "#0f1326",
      },
      fontFamily: {
        heading: "'Jost Variable', sans-serif",
        body: "'Inter Tight Variable', sans-serif",
      },
      gridTemplateColumns: {
        responsive: "repeat(auto-fill, minmax(15rem, 1fr))",
      },
    },
  },
  plugins: [],
};
