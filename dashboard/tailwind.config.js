/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0A',
        card: '#161618',
        raised: '#1C1C1F',
        ink: '#FAFAFA',
        muted: '#8E8E96',
        faint: '#63636B',
        neon: '#7C5CFF',
        coral: '#FF5F5F',
        amber: '#FFB020',
        sky: '#C9DCFB',
        skybar: '#A9C6F5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
