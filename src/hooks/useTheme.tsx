import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark' | 'amber' | 'blue' | 'green' | 'purple';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark' | 'amber' | 'blue' | 'green' | 'purple';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | 'amber' | 'blue' | 'green' | 'purple'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('tinderent-theme') as Theme;
    if (stored && ['system', 'light', 'dark', 'amber', 'blue', 'green', 'purple'].includes(stored)) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tinderent-theme', theme);
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'amber', 'blue', 'green', 'purple');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      setResolvedTheme(systemTheme);
    } else {
      root.classList.add(theme);
      setResolvedTheme(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
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