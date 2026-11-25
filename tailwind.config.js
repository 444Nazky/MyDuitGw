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
        ink: '#FFFFFF',
        muted: '#8A8A8A',
        faint: '#666666',
        // Violet is the single brand accent: primary actions, feature icons,
        // the cashflow sparkline and active toggles.
        accent: '#8B5CF6',
        'accent-strong': '#7C3AED',
        'accent-soft': 'rgba(139,92,246,0.14)',
        // Money in is GoPay green, money out is neutral grey.
        positive: '#26C165',
        'positive-soft': 'rgba(0,170,91,0.13)',
        negative: '#9CA3AF',
        'negative-soft': '#242424',
        neon: '#F2F2F2',
        coral: '#A8A8A8',
        amber: '#BEBEBE',
      },
      borderRadius: {
        bento: '24px',
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
