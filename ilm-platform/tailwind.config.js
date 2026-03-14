/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'serif'],
      },
      colors: {
        ink: {
          50:  '#f5f3ee',
          100: '#e8e3d8',
          200: '#d0c9b8',
          300: '#b3a990',
          400: '#8f8468',
          500: '#6b6048',
          600: '#504838',
          700: '#3a342a',
          800: '#272319',
          900: '#16130e',
        },
        gold: {
          50:  '#fdf8ec',
          100: '#f9edca',
          200: '#f2d98f',
          300: '#eac254',
          400: '#e0aa28',
          500: '#c48f18',
          600: '#9e7012',
          700: '#77530e',
          800: '#50380a',
          900: '#2e1f05',
        },
        sage: {
          50:  '#f0f4ef',
          100: '#dce8da',
          200: '#b8d0b4',
          300: '#8fb08a',
          400: '#638f5d',
          500: '#456e3f',
          600: '#33542e',
          700: '#263f22',
          800: '#192b17',
          900: '#0e180d',
        },
        parchment: '#faf7f0',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
