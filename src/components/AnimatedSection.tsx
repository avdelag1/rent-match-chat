import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' | 'blur';
  delay?: number;
  duration?: number;
  triggerOnce?: boolean;
}

const animationVariants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
};

/**
 * Animated section component that fades in on scroll
 * Inspired by Aceternity UI and modern web design patterns
 */
export function AnimatedSection({
  children,
  className,
  animation = 'slide-up',
  delay = 0,
  duration = 0.6,
  triggerOnce = true,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ triggerOnce });

  return (
    <motion.section
      ref={ref as any}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={animationVariants[animation]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // Smooth easing
      }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.section>
  );
}

/**
 * Animated div component for inline animations
 */
export function AnimatedDiv({
  children,
  className,
  animation = 'fade',
  delay = 0,
  duration = 0.5,
  triggerOnce = true,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ triggerOnce });

  return (
    <motion.div
      ref={ref as any}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={animationVariants[animation]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  );
}
