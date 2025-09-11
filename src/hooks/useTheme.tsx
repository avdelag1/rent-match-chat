import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'system' | 'dark' | 'amber' | 'blue' | 'green' | 'purple';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'amber' | 'blue' | 'green' | 'purple';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'amber' | 'blue' | 'green' | 'purple'>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('tinderent-theme') as Theme;
    if (stored && ['system', 'dark', 'amber', 'blue', 'green', 'purple'].includes(stored)) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tinderent-theme', theme);
    
    const root = window.document.documentElement;
    root.classList.remove('dark', 'amber', 'blue', 'green', 'purple');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark'; // Default to dark for Tinderent
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