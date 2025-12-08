import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'slide' | 'scale' | 'fade';
}

// Default page transition - smooth and fast
const defaultVariants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -8,
    scale: 0.98,
  },
};

// Slide transition - horizontal movement
const slideVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: -20,
  },
};

// Scale transition - zoom effect
const scaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.92,
  },
  in: {
    opacity: 1,
    scale: 1,
  },
  out: {
    opacity: 0,
    scale: 0.95,
  },
};

// Fade only transition
const fadeVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const variantMap = {
  default: defaultVariants,
  slide: slideVariants,
  scale: scaleVariants,
  fade: fadeVariants,
};

// Spring-based transition for smoother feel
const pageTransition = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 30,
  mass: 0.8,
};

export function PageTransition({ children, className = '', variant = 'default' }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variantMap[variant]}
      transition={pageTransition}
      className={`will-change-transform ${className}`}
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {children}
    </motion.div>
  );
}
