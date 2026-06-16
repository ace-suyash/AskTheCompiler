export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Fira Code', 'Cascadia Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          500: '#4f6ef7',
          600: '#3b5bdb',
          700: '#2f4ac2',
        },
      },
    },
  },
  plugins: [],
};
