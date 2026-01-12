import { memo, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SwipessLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  typewriter?: boolean;
  typewriterSpeed?: number; // milliseconds per character
  onTypingComplete?: () => void;
}

function SwipessLogoComponent({
  size = 'md',
  className,
  typewriter = false,
  typewriterSpeed = 150,
  onTypingComplete
}: SwipessLogoProps) {
  const fullText = 'Swipess';
  const [displayedText, setDisplayedText] = useState(typewriter ? '' : fullText);
  const [showCursor, setShowCursor] = useState(typewriter);

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl sm:text-7xl',
    '2xl': 'text-7xl sm:text-8xl',
    '3xl': 'text-8xl sm:text-9xl',
  };

  // Typewriter effect
  useEffect(() => {
    if (!typewriter) return;

    let currentIndex = 0;
    setDisplayedText('');

    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        if (onTypingComplete) onTypingComplete();
      }
    }, typewriterSpeed);

    return () => clearInterval(typingInterval);
  }, [typewriter, typewriterSpeed, onTypingComplete]);

  // Cursor blinking effect
  useEffect(() => {
    if (!typewriter) return;

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530); // Blink every 530ms (standard terminal cursor speed)

    return () => clearInterval(cursorInterval);
  }, [typewriter]);

  return (
    <span
      className={cn(
        'swipess-logo font-bold italic select-none overflow-visible inline-flex items-center',
        sizeClasses[size],
        className
      )}
    >
      {displayedText}
      {typewriter && (
        <span
          className={cn(
            'inline-block ml-1 transition-opacity duration-100',
            showCursor ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            width: '0.15em',
            height: '1em',
            background: 'currentColor',
            transform: 'skewX(-8deg)', // Slight tilt like italic text
          }}
        />
      )}
    </span>
  );
}

export const SwipessLogo = memo(SwipessLogoComponent);
