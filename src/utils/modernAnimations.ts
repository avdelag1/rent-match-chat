// Modern animation utilities for butter-smooth 60fps performance
// iOS-inspired spring physics for that premium native app feel

import { Variants, Transition } from 'framer-motion';

// iOS-like spring configurations - tested for that perfect native feel
export const springConfigs = {
  // Perfect for most UI transitions - iOS default feel
  smooth: { type: "spring" as const, stiffness: 400, damping: 40, mass: 0.8 },
  // Quick, responsive - great for buttons and small elements
  snappy: { type: "spring" as const, stiffness: 500, damping: 35, mass: 0.6 },
  // Playful bounce - for celebrations and fun interactions
  bouncy: { type: "spring" as const, stiffness: 350, damping: 25, mass: 1 },
  // Subtle, slow - for large page transitions
  gentle: { type: "spring" as const, stiffness: 300, damping: 45, mass: 1 },
  // Ultra responsive - iOS-like instant feedback
  ios: { type: "spring" as const, stiffness: 600, damping: 30, mass: 0.5 },
  // Modal sheets - iOS bottom sheet feel
  sheet: { type: "spring" as const, stiffness: 350, damping: 35, mass: 0.8 },
  // Card stacks - smooth card movements
  card: { type: "spring" as const, stiffness: 450, damping: 38, mass: 0.7 },
  // Tab switching - quick and precise
  tab: { type: "spring" as const, stiffness: 550, damping: 32, mass: 0.5 },
  // List items - staggered reveals
  list: { type: "spring" as const, stiffness: 420, damping: 42, mass: 0.6 },
};

// Easing curves matching iOS animations
export const easings = {
  ios: [0.25, 0.46, 0.45, 0.94],
  iosIn: [0.42, 0, 1, 1],
  iosOut: [0, 0, 0.58, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  smooth: [0.4, 0, 0.2, 1],
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

// iOS-like list item variants with stagger
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springConfigs.list
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.2 }
  }
};

// Container for staggered list animations
export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    }
  }
};

// Tab indicator variants - smooth sliding
export const tabIndicatorVariants: Variants = {
  inactive: { scale: 0.95, opacity: 0.7 },
  active: {
    scale: 1,
    opacity: 1,
    transition: springConfigs.tab
  }
};

// iOS-style scale on press
export const pressAnimation = {
  scale: 0.97,
  transition: { duration: 0.1, ease: easings.ios }
};

// Hover animation for cards
export const hoverAnimation = {
  y: -4,
  scale: 1.01,
  transition: springConfigs.smooth
};

// Filter chip animations
export const chipVariants: Variants = {
  inactive: {
    scale: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  active: {
    scale: 1.02,
    backgroundColor: 'rgba(239,68,68,0.15)',
    transition: springConfigs.snappy
  }
};

// Bottom sheet variants
export const bottomSheetVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0.5,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: springConfigs.sheet
  },
  exit: {
    y: '100%',
    opacity: 0.5,
    transition: { duration: 0.25, ease: easings.iosOut }
  }
};

// Collapsible content variants
export const collapsibleVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: easings.ios }
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.25, ease: easings.ios }
  }
};

// Badge pop animation
export const badgePopVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: springConfigs.bouncy
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

// Floating action button
export const fabVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: springConfigs.bouncy
  },
  tap: { scale: 0.9 }
};

// Image gallery variants
export const galleryVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: springConfigs.smooth
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  })
};

// Skeleton shimmer animation
export const shimmerVariants: Variants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }
  }
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

// Utility function for haptic feedback simulation
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const durations = { light: 10, medium: 20, heavy: 30 };
    navigator.vibrate(durations[type]);
  }
};