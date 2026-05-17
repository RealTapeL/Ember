/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pixel: {
          bg: 'var(--pixel-bg)',
          card: 'var(--pixel-card)',
          border: 'var(--pixel-border)',
          'border-light': 'var(--pixel-border-light)',
          primary: 'var(--pixel-primary)',
          primaryDark: 'var(--pixel-primary-dark)',
          secondary: 'var(--pixel-secondary)',
          text: 'var(--pixel-text)',
          muted: 'var(--pixel-muted)',
          danger: 'var(--pixel-danger)',
          success: 'var(--pixel-success)',
          warning: 'var(--pixel-warning)',
          shadow: 'var(--pixel-shadow)',
          glow: 'var(--pixel-glow)',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', '"LXGW WenKai"', '"Courier New"', 'monospace'],
        body: ['"LXGW WenKai"', '"Inter"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        display: ['"LXGW WenKai"', '"Inter"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        sans: ['"LXGW WenKai"', '"Inter"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'float': 'float 3s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'pulse-pixel': 'pulsePixel 2s steps(2) infinite',
        'scroll-left': 'scrollLeft 30s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulsePixel: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
