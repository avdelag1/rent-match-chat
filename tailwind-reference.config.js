/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'theme-primary': 'var(--bg-primary)',
        'theme-secondary': 'var(--bg-secondary)',
        'theme-tertiary': 'var(--bg-tertiary)',
        'theme-text-primary': 'var(--text-primary)',
        'theme-text-secondary': 'var(--text-secondary)',
        'theme-text-tertiary': 'var(--text-tertiary)',
        'theme-border-primary': 'var(--border-primary)',
        'theme-border-secondary': 'var(--border-secondary)',
        'theme-accent-primary': 'var(--accent-primary)',
        'theme-accent-secondary': 'var(--accent-secondary)'
      },
      backgroundImage: {
        'theme-accent-gradient': 'var(--accent-gradient)'
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)'
      }
    },
  },
  plugins: [],
};
