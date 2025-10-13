import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type Theme = 'default' | 'dark' | 'amber' | 'red';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('default');
  const { user } = useAuth();

  // Load theme from database when user logs in
  useEffect(() => {
    if (user?.id) {
      const loadUserTheme = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('theme_preference')
            .eq('id', user.id)
            .maybeSingle();
          
          if (error) throw error;
          
          if (data?.theme_preference && ['default', 'dark', 'amber', 'red'].includes(data.theme_preference)) {
            setThemeState(data.theme_preference as Theme);
          }
        } catch (error) {
          console.error('Failed to load theme preference:', error);
          setThemeState('default');
        }
      };
      loadUserTheme();
    } else {
      // Reset to default when logged out
      setThemeState('default');
    }
  }, [user?.id]);

  // Apply theme class to document
  useEffect(() => {
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

  // Save theme to database and update state
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ theme_preference: newTheme })
          .eq('id', user.id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

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