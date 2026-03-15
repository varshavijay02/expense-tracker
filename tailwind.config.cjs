/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        sidebar: '#020617',
        primary: '#3B82F6',
        text: '#F1F5F9'
      }
    }
  },
  plugins: []
};

