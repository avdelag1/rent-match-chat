import { memo, useState, useEffect } from 'react';
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
  const letters = ['S', 'w', 'i', 'p', 'e', 's', 's'];
  const [glowingIndex, setGlowingIndex] = useState<number>(-1);

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl sm:text-7xl',
    '2xl': 'text-7xl sm:text-8xl',
    '3xl': 'text-8xl sm:text-9xl',
  };

  // Random glow effect on letters
  useEffect(() => {
    if (!glow) return;

    const glowInterval = setInterval(() => {
      // Pick a random letter to glow
      const randomIndex = Math.floor(Math.random() * letters.length);
      setGlowingIndex(randomIndex);

      // Turn off glow after a short duration
      setTimeout(() => {
        setGlowingIndex(-1);
      }, 400);
    }, 800);

    return () => clearInterval(glowInterval);
  }, [glow, letters.length]);

  return (
    <span
      className={cn(
        'swipess-logo font-bold italic select-none overflow-visible inline-flex items-baseline',
        sizeClasses[size],
        className
      )}
    >
      {letters.map((letter, index) => (
        <span
          key={index}
          className={cn(
            'transition-all duration-300',
            glowingIndex === index && 'text-white'
          )}
          style={{
            textShadow: glowingIndex === index
              ? '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,165,0,0.7), 0 0 30px rgba(255,100,0,0.5)'
              : 'none',
          }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

export const SwipessLogo = memo(SwipessLogoComponent);
