import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Animated button with smooth hover and tap effects
 * Inspired by modern UI libraries
 */
export function AnimatedButton({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: AnimatedButtonProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    glow: 'bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-primary/50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
      className={cn(
        'rounded-lg font-semibold transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * Button with ripple effect on click
 */
export function RippleButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative overflow-hidden rounded-lg px-6 py-3',
        'bg-primary text-primary-foreground',
        'font-semibold shadow-md',
        'hover:shadow-lg transition-shadow duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 bg-white/20"
        initial={{ scale: 0, opacity: 1 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </motion.button>
  );
}
