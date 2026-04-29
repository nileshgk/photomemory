/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-contrast monochromatic palette
        brand: {
          black: "#000000",
          white: "#FFFFFF",
          danger: "#FF0000", // Pure Red for accents
          zinc: {
            800: "#27272a",
            900: "#18181b",
            950: "#09090b",
          }
        },
      },
      fontFamily: {
        // Modern, clean sans-serif for that SaaS look
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        widest: '0.25em',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.2' },
          '50%': { transform: 'translateY(250px)', opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
