import { useState, useEffect, useRef } from 'react';

export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);

      // Show header when scrolling up or at top
      if (scrollDirection === 'up' || currentScrollY < 50) {
        setIsVisible(true);
      } else if (scrollDelta > 25) {
        // Hide header when scrolling down (with meaningful threshold to prevent accidental hiding)
        setIsVisible(false);
      }

      // Track if we're at the top
      setIsAtTop(currentScrollY < 50);
      lastScrollY.current = currentScrollY;

      // Clear previous timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Show header again after scroll stops (optional, for better UX)
      scrollTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, 800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return { isVisible, isAtTop };
}
