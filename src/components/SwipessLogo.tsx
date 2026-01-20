import { memo } from 'react';
import { cn } from '@/lib/utils';

interface SwipessLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

function SwipessLogoComponent({
  size = 'md',
  className,
}: SwipessLogoProps) {
  // Responsive sizes optimized for all screen sizes including small iOS phones
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-4xl sm:text-5xl',
    xl: 'text-5xl sm:text-6xl md:text-7xl',
    '2xl': 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl',
    '3xl': 'text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl',
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
