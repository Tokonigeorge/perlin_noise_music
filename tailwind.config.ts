import type { Config } from 'tailwindcss';
const colors = require('tailwindcss/colors');

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontSize: {
        '6.5xl': '4rem',
      },
      lineHeight: {
        xloose: '4rem',
      },
      colors: {
        gray: colors.trueGray,
        bgBlue: '#02111B',
        trans: 'rgba(255, 255, 255,0.3)',
      },
      minWidth: {
        box: '300px',
      },
      boxShadow: {
        btn: '2px 5px 10px rgba(0, 0, 0,0.4)',
      },
    },
  },
  plugins: [],
};
export default config;
