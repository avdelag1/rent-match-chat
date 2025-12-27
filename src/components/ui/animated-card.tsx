import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  enableTilt?: boolean;
  glowEffect?: boolean;
}

/**
 * Modern animated card with smooth hover effects
 * Inspired by Aceternity UI and 21st.dev
 */
export function AnimatedCard({
  children,
  className,
  hoverScale = 1.02,
  enableTilt = false,
  glowEffect = false,
}: AnimatedCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (!enableTilt) return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: hoverScale }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      style={{
        rotateX: enableTilt ? rotateX : 0,
        rotateY: enableTilt ? rotateY : 0,
        transformStyle: 'preserve-3d',
      }}
      className={cn(
        'relative rounded-xl bg-card transition-all duration-300',
        'hover:shadow-xl',
        glowEffect && 'hover:shadow-primary/20',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/**
 * Card with gradient border effect (like 21st.dev)
 */
export function GradientBorderCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'relative group rounded-xl p-[1px] bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50',
        'hover:from-primary hover:via-accent hover:to-primary transition-all duration-500',
        className
      )}
    >
      <div className="rounded-xl bg-card h-full w-full p-6">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Glass morphism card (modern UI trend)
 */
export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'backdrop-blur-xl bg-white/10 dark:bg-black/10',
        'border border-white/20 dark:border-white/10',
        'rounded-xl shadow-2xl',
        'hover:bg-white/20 dark:hover:bg-black/20',
        'transition-all duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
