import { memo, useState, useEffect, useRef } from 'react';
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
  const hasTypedRef = useRef(false); // Prevent re-typing

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl sm:text-7xl',
    '2xl': 'text-7xl sm:text-8xl',
    '3xl': 'text-8xl sm:text-9xl',
  };

  // Typewriter effect - only runs ONCE
  useEffect(() => {
    if (!typewriter || hasTypedRef.current) return;

    hasTypedRef.current = true; // Mark as typed to prevent re-running
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typewriter, typewriterSpeed]); // Removed onTypingComplete to prevent re-running

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
        'swipess-logo font-bold italic select-none overflow-visible inline-flex items-end',
        sizeClasses[size],
        className
      )}
    >
      <span className="inline-flex flex-col">
        {displayedText}
        {typewriter && (
          <span
            className={cn(
              'inline-block transition-opacity duration-100 -mt-1',
              showCursor ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              width: '0.6em',
              height: '0.08em', // Thinner underline cursor
              background: 'currentColor',
              alignSelf: 'flex-start',
            }}
          />
        )}
      </span>
    </span>
  );
}

export const SwipessLogo = memo(SwipessLogoComponent);
