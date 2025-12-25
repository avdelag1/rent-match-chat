import { useAnimation } from 'framer-motion';
import { useEffect, RefObject } from 'react';
import { useInView } from 'framer-motion';
import { springConfigs } from '@/utils/springConfigs';

interface UseScrollRevealOptions {
  once?: boolean;
  margin?: string;
  delay?: number;
  staggerDelay?: number;
  y?: number;
  scale?: number;
}

/**
 * Scroll Reveal Animation Hook
 * Animates elements into view as user scrolls
 * Supports staggered animations and custom spring physics
 */
export function useScrollReveal(
  ref: RefObject<HTMLElement>,
  options: UseScrollRevealOptions = {}
) {
  const {
    once = true,
    margin = '-100px',
    delay = 0,
    y = 50,
    scale = 0.95,
  } = options;

  const isInView = useInView(ref, { once, margin });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
          ...springConfigs.smooth,
          delay,
        },
      });
    } else if (!once) {
      // Reset animation if not 'once'
      controls.start({
        opacity: 0,
        y,
        scale,
        filter: 'blur(4px)',
      });
    }
  }, [isInView, controls, once, delay, y, scale]);

  return {
    ref,
    initial: {
      opacity: 0,
      y,
      scale,
      filter: 'blur(4px)',
    },
    animate: controls,
  };
}

/**
 * Staggered Scroll Reveal
 * For animating lists of items with a stagger effect
 */
export function useStaggeredScrollReveal(
  ref: RefObject<HTMLElement>,
  itemCount: number,
  options: UseScrollRevealOptions = {}
) {
  const {
    once = true,
    margin = '-50px',
    staggerDelay = 0.05,
  } = options;

  const isInView = useInView(ref, { once, margin });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start((i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          ...springConfigs.smooth,
          delay: i * staggerDelay,
        },
      }));
    }
  }, [isInView, controls, staggerDelay]);

  return {
    containerRef: ref,
    controls,
    custom: (index: number) => index,
  };
}

/**
 * Parallax Scroll Effect
 * Creates subtle depth with parallax movement
 */
export function useParallaxScroll(ref: RefObject<HTMLElement>, speed = 0.5) {
  const controls = useAnimation();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const scrollProgress = 1 - (rect.top + rect.height) / window.innerHeight;
      const yOffset = scrollProgress * 100 * speed;

      controls.start({
        y: yOffset,
        transition: { duration: 0 },
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref, controls, speed]);

  return {
    ref,
    animate: controls,
  };
}

/**
 * Simple fade-in on scroll
 * Minimal animation for subtle reveals
 */
export function useFadeInScroll(ref: RefObject<HTMLElement>, once = true) {
  const isInView = useInView(ref, { once, margin: '-50px' });

  return {
    ref,
    animate: {
      opacity: isInView ? 1 : 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  };
}
