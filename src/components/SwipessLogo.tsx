import { memo } from 'react';
import { cn } from '@/lib/utils';

interface SwipessLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
}

function SwipessLogoComponent({
  size = 'md',
  className,
}: SwipessLogoProps) {
  // Responsive sizes - BIGGER logo that still fits all screens
  const sizeClasses = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-5xl sm:text-6xl',
    xl: 'text-6xl sm:text-7xl md:text-8xl',
    '2xl': 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl',
    '3xl': 'text-[3.5rem] sm:text-7xl md:text-8xl lg:text-9xl',
    '4xl': 'text-[4rem] sm:text-8xl md:text-9xl lg:text-[10rem]',
  };

  return (
    <span
      className={cn(
        'swipess-logo font-bold italic select-none overflow-visible inline-flex items-end',
        sizeClasses[size],
        className
      )}
    >
      Swipess
    </span>
  );
}

export const SwipessLogo = memo(SwipessLogoComponent);
