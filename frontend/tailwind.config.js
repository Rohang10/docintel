/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1C2D', // Base Background
          light: '#102A43',   // Card Surface
          dark: '#061726',    // Dark Accent Surface
          950: '#0B1C2D',
          900: '#102A43',
          850: '#0E2338',
          800: '#1A3654',
        },
        cyber: {
          DEFAULT: '#0066FF', // Primary Electric Blue
          accent: '#4FD1FF',  // Neon Cyan Accent
        },
        teal: {
          DEFAULT: '#00E5C0', // Cyber Neon Teal Accent
        },
        brand: {
          50: '#e6f7f5',
          100: '#ccefea',
          200: '#99dfd5',
          300: '#4FD1FF',
          400: '#4FD1FF',
          500: '#0066FF',
          600: '#0052CC',
          700: '#003D99',
          800: '#061726',
          900: '#0B1C2D',
        },
        neutral: {
          white: '#FFFFFF',   // Pure White Headings
          soft: '#E6EAF0',    // Body Soft White/Slate Text
          text: '#9BA3AF',    // Muted Gray Description Text
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #0B1C2D 0%, #102A43 50%, #061726 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

