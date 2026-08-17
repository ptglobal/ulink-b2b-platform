import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1280px' }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          strong: 'hsl(var(--brand-strong))',
          deep: 'hsl(var(--brand-deep))',
          soft: 'hsl(var(--brand-soft))',
          foreground: 'hsl(var(--brand-foreground))'
        },
        evidence: {
          DEFAULT: 'hsl(var(--evidence))',
          foreground: 'hsl(var(--evidence-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        silver: 'hsl(var(--silver))',
        onyx: 'hsl(var(--onyx))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'var(--radius-control)',
        sm: 'var(--radius-detail)'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace']
      },
      boxShadow: {
        ambient: '0 2px 8px hsl(var(--foreground) / 0.08)',
        overlay: '0 16px 40px hsl(var(--foreground) / 0.16)'
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    }
  },
  plugins: [animate]
};

export default config;
