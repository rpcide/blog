/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        border: "#282e3d",
        text: "#fff",
        textAlt: "rgb(107 114 128)",
      },
    },
  },
  plugins: [],
};
