import { memo, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SwipessLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  glow?: boolean;
}

function SwipessLogoComponent({
  size = 'md',
  className,
  glow = true,
}: SwipessLogoProps) {
  const [shimmerKey, setShimmerKey] = useState(0);
  const [shimmerActive, setShimmerActive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl sm:text-7xl',
    '2xl': 'text-7xl sm:text-8xl',
    '3xl': 'text-8xl sm:text-9xl',
  };

  // Subtle shimmer effect - random intervals
  useEffect(() => {
    if (!glow) return;

    const triggerShimmer = () => {
      // Increment key to restart animation
      setShimmerKey((k) => k + 1);
      setShimmerActive(true);

      // Animation lasts ~1.4s
      setTimeout(() => {
        setShimmerActive(false);
      }, 1400);

      // Schedule next shimmer at random interval (4-8 seconds)
      const nextDelay = 4000 + Math.random() * 4000;
      timeoutRef.current = setTimeout(triggerShimmer, nextDelay);
    };

    // Start first shimmer after a short delay
    const initialDelay = 1500 + Math.random() * 2000;
    timeoutRef.current = setTimeout(triggerShimmer, initialDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [glow]);

  return (
    <span
      key={shimmerKey}
      className={cn(
        'swipess-logo font-bold italic select-none overflow-visible swipess-shimmer',
        sizeClasses[size],
        shimmerActive && 'shimmer-active',
        className
      )}
    >
      Swipess
    </span>
  );
}

export const SwipessLogo = memo(SwipessLogoComponent);
