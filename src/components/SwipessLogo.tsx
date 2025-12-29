import { memo } from 'react';
import { cn } from '@/lib/utils';

interface SwipessLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

function SwipessLogoComponent({ size = 'md', className }: SwipessLogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl sm:text-7xl',
    '2xl': 'text-7xl sm:text-8xl',
  };

  return (
    <span
      className={cn(
        'swipess-logo font-bold italic select-none',
        sizeClasses[size],
        className
      )}
    >
      Swipess
    </span>
  );
}

export const SwipessLogo = memo(SwipessLogoComponent);
