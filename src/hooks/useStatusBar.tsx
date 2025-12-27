import { useEffect } from 'react';
import { useTheme } from './useTheme';

// Theme to status bar color mapping
const themeStatusBarColors: Record<string, string> = {
  'grey-matte': '#1a1a1a',
  'black-matte': '#000000',
  'white-matte': '#f5f5f5',
  'red-matte': '#7f1d1d',
};

// Landing page uses orange accent
const LANDING_ORANGE = '#f97316';

export function useStatusBarColor(isLandingPage: boolean = false) {
  const { theme } = useTheme();

  useEffect(() => {
    const color = isLandingPage ? LANDING_ORANGE : (themeStatusBarColors[theme] || '#1a1a1a');
    
    // Update the theme-color meta tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.setAttribute('content', color);

    // Also update the Apple status bar style for iOS
    let metaAppleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    
    if (!metaAppleStatusBar) {
      metaAppleStatusBar = document.createElement('meta');
      metaAppleStatusBar.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(metaAppleStatusBar);
    }
    
    // Use black-translucent for dark themes, default for light
    const statusBarStyle = theme === 'white-matte' ? 'default' : 'black-translucent';
    metaAppleStatusBar.setAttribute('content', statusBarStyle);

  }, [theme, isLandingPage]);
}

// Hook to set a custom status bar color temporarily
export function useCustomStatusBarColor(color: string | null) {
  useEffect(() => {
    if (!color) return;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const originalColor = metaThemeColor?.getAttribute('content');

    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    }

    return () => {
      if (metaThemeColor && originalColor) {
        metaThemeColor.setAttribute('content', originalColor);
      }
    };
  }, [color]);
}
