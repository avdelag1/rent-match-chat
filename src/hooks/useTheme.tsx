import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'default' | 'dark' | 'amber' | 'red';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    const stored = localStorage.getItem('tinderent-theme') as Theme;
    if (stored && ['default', 'dark', 'amber', 'red'].includes(stored)) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tinderent-theme', theme);
    
    const root = window.document.documentElement;
    root.classList.remove('dark', 'amber', 'red');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'amber') {
      root.classList.add('amber');
    } else if (theme === 'red') {
      root.classList.add('red');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}