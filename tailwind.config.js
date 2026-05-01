/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
          muted: "#dbeafe",
          dark: "#3b82f6",
        },
        background: {
          light: "#FFFFFF",
          gray: "#F5F5F5",
          dark: "#020617",
        },
        surface: {
          light: "#F8FAFC",
          dark: "#0F172A",
          border: "#E2E8F0",
          "border-dark": "#1E293B",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    },
  },
  plugins: [],
};
