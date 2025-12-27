import React, { createContext, useContext, useEffect } from 'react';
import { useResponsive, ResponsiveState, BreakpointKey, BREAKPOINTS } from '@/hooks/useResponsive';

// Create context with undefined default (will be provided by ResponsiveProvider)
const ResponsiveContext = createContext<ResponsiveState | undefined>(undefined);

interface ResponsiveProviderProps {
  children: React.ReactNode;
}

/**
 * ResponsiveProvider - Provides responsive state to all child components
 *
 * This provider:
 * 1. Detects screen size and orientation changes
 * 2. Updates CSS custom properties for responsive styling
 * 3. Adds data attributes to body for CSS-based responsive styles
 * 4. Provides responsive state via context to child components
 */
export function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  const responsive = useResponsive();

  // Update CSS custom properties and body attributes when responsive state changes
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Set CSS custom properties for screen dimensions
    root.style.setProperty('--screen-width', `${responsive.width}px`);
    root.style.setProperty('--screen-height', `${responsive.height}px`);

    // Set breakpoint as CSS property
    root.style.setProperty('--current-breakpoint', responsive.breakpoint);

    // Set data attributes for CSS targeting
    body.setAttribute('data-breakpoint', responsive.breakpoint);
    body.setAttribute('data-device', responsive.isMobile ? 'mobile' : responsive.isTablet ? 'tablet' : 'desktop');
    body.setAttribute('data-orientation', responsive.isPortrait ? 'portrait' : 'landscape');
    body.setAttribute('data-touch', responsive.isTouchDevice ? 'true' : 'false');

    // Add/remove convenience classes on body
    const breakpointClasses = ['is-xs', 'is-sm', 'is-md', 'is-lg', 'is-xl', 'is-2xl'];
    const deviceClasses = ['is-mobile', 'is-tablet', 'is-desktop'];
    const orientationClasses = ['is-portrait', 'is-landscape'];

    // Remove all existing classes
    body.classList.remove(...breakpointClasses, ...deviceClasses, ...orientationClasses);

    // Add current classes
    body.classList.add(`is-${responsive.breakpoint}`);
    if (responsive.isMobile) body.classList.add('is-mobile');
    if (responsive.isTablet) body.classList.add('is-tablet');
    if (responsive.isDesktop) body.classList.add('is-desktop');
    if (responsive.isPortrait) body.classList.add('is-portrait');
    if (responsive.isLandscape) body.classList.add('is-landscape');
    if (responsive.isTouchDevice) body.classList.add('is-touch');

    // Cleanup
    return () => {
      body.removeAttribute('data-breakpoint');
      body.removeAttribute('data-device');
      body.removeAttribute('data-orientation');
      body.removeAttribute('data-touch');
      body.classList.remove(...breakpointClasses, ...deviceClasses, ...orientationClasses, 'is-touch');
    };
  }, [responsive]);

  return (
    <ResponsiveContext.Provider value={responsive}>
      {children}
    </ResponsiveContext.Provider>
  );
}

/**
 * Hook to access responsive context
 * Must be used within a ResponsiveProvider
 */
export function useResponsiveContext(): ResponsiveState {
  const context = useContext(ResponsiveContext);
  if (context === undefined) {
    throw new Error('useResponsiveContext must be used within a ResponsiveProvider');
  }
  return context;
}

/**
 * HOC for components that need responsive props
 */
export function withResponsive<P extends object>(
  WrappedComponent: React.ComponentType<P & { responsive: ResponsiveState }>
) {
  return function WithResponsiveComponent(props: Omit<P, 'responsive'>) {
    const responsive = useResponsiveContext();
    return <WrappedComponent {...(props as P)} responsive={responsive} />;
  };
}

// Re-export types and constants for convenience
export { BREAKPOINTS };
export type { BreakpointKey, ResponsiveState };
