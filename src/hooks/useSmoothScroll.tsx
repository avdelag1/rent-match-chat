import { useEffect } from 'react';

interface UseSmoothScrollOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
}

export function useSmoothScroll(options: UseSmoothScrollOptions = {}) {
  useEffect(() => {
    // Add smooth scroll behavior to the whole document
    document.documentElement.style.scrollBehavior = options.behavior || 'smooth';

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [options.behavior]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: options.block || 'start' 
      });
    }
  };

  const scrollToBottom = () => {
    window.scrollTo({ 
      top: document.documentElement.scrollHeight, 
      behavior: 'smooth' 
    });
  };

  return {
    scrollToTop,
    scrollToElement,
    scrollToBottom,
  };
}