/** @type {import('tailwindcss').Config} */
module.exports = {
  // The app is dark-only with hardcoded colours; the class strategy keeps
  // NativeWind's web runtime from throwing when the system theme is "media".
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        obsidian: '#000000',
        card: '#161616',
        'card-raised': '#1C1C1C',
        hairline: '#242424',
        ink: '#F2F2F2',
        muted: '#8A8A8A',
        faint: '#5F5F5F',
        // Only two accents exist: soft green for money in, grey for money out.
        positive: '#5FE3A1',
        negative: '#8A8A8A',
        // Primary actions are white on black; no extra brand hues.
        neon: '#F2F2F2',
        coral: '#A8A8A8',
        amber: '#BEBEBE',
      },
      borderRadius: {
        bento: '22px',
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
