import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./views/**/*.{js,ts,jsx,tsx,mdx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      // you can configure the container to be centered
      center: true,

      // or have default horizontal padding
      padding: {
        DEFAULT: "24px",
      },

      // default breakpoints but with 40px removed
      screens: {
        xl: "1440px",
      },
    },
    extend: {
      colors: {
        orange: {
          100: "#FF7201",
        },
        dark: {
          100: "#0D0D0D",
          200: "#141414",
          300: "#2C2C2C",
        },
        light: {
          100: "#FFFFFF",
        },
        grey: {
          100: "#F4F4F4",
          200: "#EBECEC",
          300: '#F5F5F5',
          400: '#787575',
          500: '#ABA8A1'
        },
        success: {
          100: "#00BF6D",
        },
        info: {
          100: "#004CE8",
        },
        warning: {
          100: "#F2B137",
        },
        error: {
          100: "#FF3333",
        },
      },
      fontFamily: {
        satoshi: ["Satoshi", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
