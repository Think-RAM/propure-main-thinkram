import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: '#14b8a6',
          dark: '#0f766e',
        },
        secondary: {
          DEFAULT: '#0a192f',
        },
        paper: '#F7F7F5',
        grid: {
          DEFAULT: '#3A3A38',
          20: 'rgba(58, 58, 56, 0.2)',
          30: 'rgba(58, 58, 56, 0.3)',
        },
        coral: '#FF8C69',
        mint: '#9EFFBF',
        gold: '#F4D35E',
        // primary: {
        //   DEFAULT: "#0B3C5D",
        //   foreground: "hsl(var(--primary-foreground))",
        // },
        // secondary: {
        //   DEFAULT: "#4FD1C5",
        //   foreground: "hsl(var(--secondary-foreground))",
        // },
        accent: {
          DEFAULT: "#FF6F61",
          secondary: "#FFC857",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        head: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-general-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      borderRadius: {
        sm: '2px',
      },
      animation: {
        spin: 'spin 20s linear infinite',
        scroll: 'scroll 40s linear infinite',
        orbit: 'orbit 20s linear infinite',
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.5, 0, 0, 1) forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.5, 0, 0, 1) forwards',
        float: 'float 20s infinite ease-in-out',
        scan: 'scan 4s linear infinite',
        blink: 'blink 1s step-end infinite',
        marquee: 'scroll 40s linear infinite',
        'slide-left': 'slide-left 0.5s ease-out',
        'slide-right': 'slide-right 0.5s ease-out',
        'gradient': 'gradient 8s linear infinite',
        // 'float': 'float 6s ease-in-out infinite', // Existing float is 20s, keeping existing or overriding? I'll override or add as float-fast? Let's just add gradient for now as float exists.
        // Actually, let's strictly follow the user request to add these. I will update float to match the requested 6s one or add a new one.
        // Let's add 'float-hero' to be safe and use that in the component if I can, OR just update the existing one if it's not critical. 
        // Wait, I can just add `gradient` and if `float` is already there, I'll leave it or update it. 
        // Let's UPDATE `float` to be 6s as per request implies this setup works well.
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        orbit: {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
      // borderRadius: {
      //   lg: "var(--radius)",
      //   md: "calc(var(--radius) - 2px)",
      //   sm: "calc(var(--radius) - 4px)",
      // },
      // fontFamily: {
      //   sans: ["var(--font-lato)", "system-ui", "sans-serif"],
      //   heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
      // },
      // keyframes: {
      //   "accordion-down": {
      //     from: { height: "0" },
      //     to: { height: "var(--radix-accordion-content-height)" },
      //   },
      //   "accordion-up": {
      //     from: { height: "var(--radix-accordion-content-height)" },
      //     to: { height: "0" },
      //   },
      // },
      // animation: {
      //   "accordion-down": "accordion-down 0.2s ease-out",
      //   "accordion-up": "accordion-up 0.2s ease-out",
      // },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
