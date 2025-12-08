/** @type {import('tailwindcss').Config} */
const { hairlineWidth } = require('nativewind/theme');
const colors = require('tailwindcss/colors');
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ...colors, // Removed to improve performance
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // The "Elemental" colors - Official type mappings (Gen 8/9 standard)
        type: {
          normal: '#A8A77A',
          fire: '#EE8130',
          water: '#6390F0',
          electric: '#F7D02C',
          grass: '#7AC74C',
          ice: '#96D9D6',
          fighting: '#C22E28',
          poison: '#A33EA1',
          ground: '#E2BF65',
          flying: '#A98FF3',
          psychic: '#F95587',
          bug: '#A6B91A',
          rock: '#B6A136',
          ghost: '#735797',
          dragon: '#6F35FC',
          steel: '#B7B7CE',
          fairy: '#D685AD',
        },
        // Rarity/Card backgrounds
        rarity: {
          common: '#9CA3AF',    // Gray-400
          rare: '#FCD34D',      // Amber-300
          epic: '#A78BFA',      // Violet-400
          legendary: '#F59E0B', // Amber-500
        }
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // Animation for the blue sensor light blinking
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        // Animation for the Pokedex "scanning" line
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        blink: 'blink 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scan: 'scan 2s linear infinite',
        shake: 'shake 0.5s ease-in-out',
      },
      fontFamily: {
        // Suggest importing 'Press Start 2P' from Google Fonts for headings
        retro: ['"Press Start 2P"', 'cursive'],
        // Clean sans-serif for readable stats
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        // Custom shadows to create the plastic "device" feel
        'led-blue': '0 0 10px #28AAFD, 0 0 20px #28AAFD',
        'led-green': '0 0 10px #51AD60, 0 0 20px #51AD60',
        'led-yellow': '0 0 10px #FFCB05, 0 0 20px #FFCB05',
        'inner-screen': 'inset 0 0 15px rgba(0,0,0,0.3)',
        'chassis': 'inset 0 -4px 0 rgba(0,0,0,0.2), 0 4px 0 rgba(0,0,0,0.2)',
        'button-pressed': 'inset 0 4px 0 rgba(0,0,0,0.2)',
      },
      backgroundImage: {
        'pokeball': "url('/images/pokeball-bg.svg')", // Requires a local asset
        'stripe-pattern': "repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)",
      }
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require('tailwindcss-animate')],
  // Safelist is crucial for dynamic type colors (e.g. `bg-type-${typeName}`)
  safelist: [
    {
      pattern: /bg-type-(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|steel|fairy)/,
    },
    {
      pattern: /text-type-(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|steel|fairy)/,
    },
    {
      pattern: /border-type-(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|steel|fairy)/,
    },
    {
      pattern: /bg-opacity-(10|20|30|40|50|60|70|80|90|100)/,
    },
    {
      pattern: /opacity-(10|20|30|40|50|60|70|80|90|100)/,
    }
  ]
}
