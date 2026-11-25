/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0A',
        card: '#141416',
        'card-raised': '#1C1C20',
        hairline: '#252529',
        ink: '#FAFAFA',
        muted: '#8E8E96',
        faint: '#63636B',
        neon: '#7C5CFF',
        coral: '#FF5F5F',
        amber: '#FFB020',
      },
      borderRadius: {
        bento: '20px',
        pill: '999px',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
        extrabold: ['Inter_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
