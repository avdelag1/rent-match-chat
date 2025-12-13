// Modern animation utilities for butter-smooth 60fps performance

import { Variants } from 'framer-motion';

// Spring configurations for different use cases
export const springConfigs = {
  smooth: { type: "spring" as const, stiffness: 400, damping: 40, mass: 0.8 },
  snappy: { type: "spring" as const, stiffness: 500, damping: 35, mass: 0.6 },
  bouncy: { type: "spring" as const, stiffness: 350, damping: 25, mass: 1 },
  gentle: { type: "spring" as const, stiffness: 300, damping: 45, mass: 1 },
};

// Page transition variants
export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.98,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: springConfigs.smooth
  },
  exit: { 
    opacity: 0, 
    y: -20,
    scale: 0.98,
    transition: { duration: 0.2 }
  },
};

// Card entrance animations
export const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: springConfigs.smooth
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15 }
  }
};

// Swipe card exit animations
export const swipeExitVariants = {
  left: {
    x: -1000,
    rotate: -25,
    opacity: 0,
    transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
  },
  right: {
    x: 1000,
    rotate: 25,
    opacity: 0,
    transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
  },
};

// Button press animation
export const buttonTapAnimation = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

// Overlay fade variants
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
};

// Stagger children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    }
  }
};

// Shake animation for errors
export const shakeAnimation = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.4 }
};

// Particle burst animation
export const particleBurstVariants: Variants = {
  hidden: { scale: 0, opacity: 1 },
  visible: { 
    scale: [0, 1.5, 2],
    opacity: [1, 0.5, 0],
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Modern slide-in from bottom
export const slideUpVariants: Variants = {
  hidden: { 
    y: 100, 
    opacity: 0 
  },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: springConfigs.smooth
  }
};

// CSS transform optimization
export const gpuAcceleration = {
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden' as const,
  WebkitBackfaceVisibility: 'hidden' as const,
  willChange: 'transform',
};

// Generate ripple effect
export const createRipple = (event: React.MouseEvent<HTMLElement>) => {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.add('ripple');

  button.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
};