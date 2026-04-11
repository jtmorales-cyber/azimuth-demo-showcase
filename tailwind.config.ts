import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/scenes/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#0A0E1A',
        'midnight': '#1C2331',
        'cyan-struct': '#00CED1',
        'slate-blue': '#526A82',
        'amber-core': '#E8A030',
        'sage-muted': '#98A89D',
        'gauntlet-gray': '#6B6B6B',
        'scout-blue': '#0C447C',
        'silver': '#D8DEE9',
        'calm-purple': '#7B68AE',
        'peak-light': '#FFFFFF',
      },
      fontFamily: {
        satoshi: ['Satoshi', 'DM Sans', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'monospace'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1' }],
        'h1': ['2.5rem', { lineHeight: '1.15' }],
        'h2': ['1.75rem', { lineHeight: '1.2' }],
        'h3': ['1.25rem', { lineHeight: '1.3' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.8125rem', { lineHeight: '1.4' }],
        'data': ['2.25rem', { lineHeight: '1.0' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
    },
  },
  plugins: [],
};

export default config;
