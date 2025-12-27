import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook for fade-in animations on scroll
 * Inspired by modern UI libraries like Aceternity UI and Framer Motion
 */
export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/**
 * Hook for staggered scroll animations (for lists)
 */
export function useStaggeredScrollAnimation(
  itemCount: number,
  options: UseScrollAnimationOptions = {}
) {
  const { ref, isVisible } = useScrollAnimation(options);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    if (isVisible && visibleItems.length === 0) {
      // Stagger the appearance of items
      const delays = Array.from({ length: itemCount }, (_, i) => i * 50);

      delays.forEach((delay, index) => {
        setTimeout(() => {
          setVisibleItems((prev) => [...prev, index]);
        }, delay);
      });
    }
  }, [isVisible, itemCount, visibleItems.length]);

  return { ref, visibleItems };
}
