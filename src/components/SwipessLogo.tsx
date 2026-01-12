import { memo, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SwipessLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  typewriter?: boolean;
  typewriterSpeed?: number; // milliseconds per character
  loopDelay?: number; // milliseconds to wait before starting erase cycle (default 5000)
  onTypingComplete?: () => void;
}

function SwipessLogoComponent({
  size = 'md',
  className,
  typewriter = false,
  typewriterSpeed = 150,
  loopDelay = 5000,
  onTypingComplete
}: SwipessLogoProps) {
  const fullText = 'Swipess';
  const [displayedText, setDisplayedText] = useState(typewriter ? '' : fullText);
  const [showCursor, setShowCursor] = useState(typewriter);
  const hasStartedRef = useRef(false);

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl sm:text-7xl',
    '2xl': 'text-7xl sm:text-8xl',
    '3xl': 'text-8xl sm:text-9xl',
  };

  // Looping typewriter effect - types, waits, erases, repeats
  useEffect(() => {
    if (!typewriter || hasStartedRef.current) return;

    hasStartedRef.current = true;
    let currentIndex = 0;
    let isTyping = true; // true = typing, false = erasing
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const startTyping = () => {
      currentIndex = 0;
      isTyping = true;
      setDisplayedText('');

      intervalId = setInterval(() => {
        if (currentIndex < fullText.length) {
          currentIndex++;
          setDisplayedText(fullText.substring(0, currentIndex));
        } else {
          clearInterval(intervalId);
          if (onTypingComplete) onTypingComplete();
          // Wait loopDelay before starting to erase
          timeoutId = setTimeout(startErasing, loopDelay);
        }
      }, typewriterSpeed);
    };

    const startErasing = () => {
      isTyping = false;
      currentIndex = fullText.length;

      intervalId = setInterval(() => {
        if (currentIndex > 0) {
          currentIndex--;
          setDisplayedText(fullText.substring(0, currentIndex));
        } else {
          clearInterval(intervalId);
          // Small pause before typing again
          timeoutId = setTimeout(startTyping, 300);
        }
      }, typewriterSpeed / 2); // Erase slightly faster
    };

    // Start the initial typing
    startTyping();

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typewriter, typewriterSpeed, loopDelay]);

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
        'swipess-logo font-bold italic select-none overflow-visible inline-flex items-baseline',
        sizeClasses[size],
        className
      )}
    >
      {displayedText}
      {typewriter && (
        <span
          className={cn(
            'inline-block transition-opacity duration-100 ml-[1px]',
            showCursor ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            width: '0.5em',
            height: '0.12em',
            background: 'currentColor',
            verticalAlign: 'baseline',
            marginBottom: '0.1em',
          }}
        />
      )}
    </span>
  );
}

export const SwipessLogo = memo(SwipessLogoComponent);
