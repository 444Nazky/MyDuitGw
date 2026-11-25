/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0A',
        // Translucent surfaces: the ambient backdrop shows through and the
        // card reads as frosted glass. Keep the alpha low enough that text
        // contrast stays above 4.5:1.
        card: 'rgba(26, 26, 31, 0.55)',
        'card-raised': 'rgba(42, 42, 50, 0.68)',
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
