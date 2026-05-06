import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#050505',
          charcoal: '#111111',
          softblack: '#181818',
          gold: '#FFD230',
          yellow: '#FFE16A',
          cream: '#FFF4C2',
          muted: '#B8B8B8',
          white: '#FAFAFA',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
};

export default config;