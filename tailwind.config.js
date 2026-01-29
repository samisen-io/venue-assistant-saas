/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      /* ========== Colors ========== */
      colors: {
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          light: "hsl(var(--destructive-light))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* Semantic Colors */
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          light: "hsl(var(--success-light))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          light: "hsl(var(--warning-light))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          light: "hsl(var(--info-light))",
        },
      },

      /* ========== Border Radius ========== */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      /* ========== Typography ========== */
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      /* ========== Spacing ========== */
      spacing: {
        "4.5": "1.125rem",
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      /* ========== Shadows ========== */
      boxShadow: {
        "sm": "var(--shadow-sm)",
        "DEFAULT": "var(--shadow)",
        "md": "var(--shadow-md)",
        "lg": "var(--shadow-lg)",
        "xl": "var(--shadow-xl)",
        "inner-sm": "inset 0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "glow": "0 0 20px rgb(59 130 246 / 0.5)",
        "glow-success": "0 0 20px rgb(34 197 94 / 0.5)",
        "glow-warning": "0 0 20px rgb(245 158 11 / 0.5)",
        "glow-error": "0 0 20px rgb(239 68 68 / 0.5)",
      },

      /* ========== Z-Index ========== */
      zIndex: {
        "dropdown": "var(--z-dropdown)",
        "sticky": "var(--z-sticky)",
        "fixed": "var(--z-fixed)",
        "modal-backdrop": "var(--z-modal-backdrop)",
        "modal": "var(--z-modal)",
        "popover": "var(--z-popover)",
        "tooltip": "var(--z-tooltip)",
      },

      /* ========== Animations ========== */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        "spin-slow": "spin-slow 3s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "bounce-soft": "bounce-soft 1s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },

      /* ========== Transitions ========== */
      transitionDuration: {
        "fast": "var(--transition-fast)",
        "normal": "var(--transition-normal)",
        "slow": "var(--transition-slow)",
      },

      /* ========== Grid ========== */
      gridTemplateColumns: {
        "auto-fill-250": "repeat(auto-fill, minmax(250px, 1fr))",
        "auto-fill-300": "repeat(auto-fill, minmax(300px, 1fr))",
        "auto-fill-350": "repeat(auto-fill, minmax(350px, 1fr))",
      },

      /* ========== Aspect Ratio ========== */
      aspectRatio: {
        "4/3": "4 / 3",
        "3/2": "3 / 2",
        "2/1": "2 / 1",
      },

      /* ========== Min/Max Width ========== */
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      minWidth: {
        "xs": "20rem",
        "sm": "24rem",
        "md": "28rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
