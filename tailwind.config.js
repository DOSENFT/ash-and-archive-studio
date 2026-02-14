/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background scale
        'void': {
          0: '#070b10',
          1: '#0d141d',
          2: '#141d28',
        },
        // Accent colors
        'arcane': '#3dd2ff',
        'eldritch': '#8b5cf6',
        'ember': '#f4b545',
        'verdant': '#39d98a',
        // Text scale
        'forge': {
          0: '#f5f7fb',
          1: '#c4ceda',
          2: '#8d98a7',
        },
      },
      fontFamily: {
        'display': ['"Space Grotesk"', 'sans-serif'],
        'body': ['"IBM Plex Sans"', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      transitionTimingFunction: {
        'forge': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        'fast': '120ms',
        'base': '180ms',
        'enter': '240ms',
        'complex': '320ms',
      },
      animation: {
        'ember-rise': 'emberRise 4s ease-out infinite',
        'ember-glow': 'emberGlow 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        emberRise: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '100%': { transform: 'translateY(-100vh) scale(0.5)', opacity: '0' },
        },
        emberGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
