import { useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';

/**
 * STAR FIELD BACKGROUND
 * 
 * Features:
 * - Realistic time-lapse star movement
 * - Random shooting stars
 * - Interactive - tap/click triggers shooting star
 * - Smooth 60fps animation
 */

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  velocityX: number;
  velocityY: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  length: number;
  opacity: number;
  speed: number;
}

const STAR_COUNT = 200;
const SHOOTING_STAR_INTERVAL_MIN = 10000;
const SHOOTING_STAR_INTERVAL_MAX = 20000;

// Generate random stars - realistic distribution with slow drift
const generateStars = (): Star[] => {
  return Array.from({ length: STAR_COUNT }, (_, i) => {
    // Some stars move horizontally, some vertically, some diagonally
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.008 + 0.002; // Very slow drift

    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.2 + 0.3, // Smaller, more realistic sizes
      opacity: Math.random() * 0.5 + 0.15, // More subtle, varying brightness
      twinkleSpeed: Math.random() * 3 + 2, // Slower twinkle
      twinkleOffset: Math.random() * 10,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
    };
  });
};

const StarFieldBackgroundComponent = () => {
  const starsRef = useRef<Star[]>(generateStars());
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastShootingStarRef = useRef<number>(Date.now());
  const nextShootingStarRef = useRef<number>(getNextShootingStarTime());

  function getNextShootingStarTime(): number {
    return Math.random() * (SHOOTING_STAR_INTERVAL_MAX - SHOOTING_STAR_INTERVAL_MIN) + SHOOTING_STAR_INTERVAL_MIN;
  }

  // Create a new shooting star
  const createShootingStar = useCallback((x?: number, y?: number): ShootingStar => {
    const startX = x ?? Math.random() * 100;
    const startY = y ?? Math.random() * 60;
    const angle = Math.random() * 30 + 25; // 25-55 degrees (diagonal down-right)
    
    return {
      id: Date.now(),
      startX,
      startY,
      angle,
      length: Math.random() * 15 + 10,
      opacity: 1,
      speed: Math.random() * 0.5 + 0.8,
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now();

      // Update star positions and move them via direct DOM manipulation
      if (containerRef.current) {
        const starElements = containerRef.current.querySelectorAll('[data-star-id]');

        starsRef.current = starsRef.current.map((star, index) => {
          let newX = star.x + star.velocityX;
          let newY = star.y + star.velocityY;

          // Wrap around edges
          if (newX > 100) newX = 0;
          if (newX < 0) newX = 100;
          if (newY > 100) newY = 0;
          if (newY < 0) newY = 100;

          // Update DOM directly for smooth performance
          const element = starElements[index] as HTMLElement;
          if (element) {
            element.style.left = `${newX}%`;
            element.style.top = `${newY}%`;
          }

          return {
            ...star,
            x: newX,
            y: newY,
          };
        });
      }

      // Check if it's time for a random shooting star
      if (now - lastShootingStarRef.current > nextShootingStarRef.current) {
        shootingStarsRef.current.push(createShootingStar());
        lastShootingStarRef.current = now;
        nextShootingStarRef.current = getNextShootingStarTime();
      }

      // Update shooting stars
      shootingStarsRef.current = shootingStarsRef.current
        .map(star => ({
          ...star,
          opacity: star.opacity - 0.008 * star.speed,
          startY: star.startY + 0.2 * star.speed,
          startX: star.startX + 0.12 * star.speed,
        }))
        .filter(star => star.opacity > 0);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [createShootingStar]);

  // Handle click to create shooting star
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : (e as React.MouseEvent).clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    shootingStarsRef.current.push(createShootingStar(x, y));
  }, [createShootingStar]);

  const stars = starsRef.current;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #020205 0%, #050510 40%, #0a0a15 100%)',
        zIndex: 0,
      }}
    >
      {/* Click layer - captures taps anywhere to create shooting stars */}
      <div
        className="absolute inset-0"
        onClick={handleClick}
        onTouchStart={handleClick}
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
      />

      {/* Moving stars with twinkle effect - varying brightness */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          data-star-id={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            pointerEvents: 'none',
            boxShadow: `0 0 ${star.size * 1.5}px rgba(255, 255, 255, ${star.opacity * 0.5})`,
          }}
          animate={{
            opacity: [
              star.opacity * 0.4,
              star.opacity,
              star.opacity * 0.2,
              star.opacity,
            ],
          }}
          transition={{
            duration: star.twinkleSpeed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.twinkleOffset,
          }}
        />
      ))}

      {/* Shooting stars */}
      {shootingStarsRef.current.map((star) => (
        <div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            width: `${star.length}%`,
            height: '1.5px',
            background: `linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,${star.opacity * 0.8}) 30%, rgba(200,220,255,${star.opacity}) 100%)`,
            transform: `rotate(${star.angle}deg)`,
            transformOrigin: 'left center',
            pointerEvents: 'none',
            boxShadow: `0 0 ${star.opacity * 3}px ${star.opacity}px rgba(200, 220, 255, ${star.opacity * 0.5})`,
          }}
        />
      ))}

      {/* Subtle nebula glow - more realistic, darker */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(80, 40, 120, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 70%, rgba(40, 80, 120, 0.1) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, rgba(60, 60, 100, 0.08) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  );
};

export const StarFieldBackground = memo(StarFieldBackgroundComponent);

// Export for use in components
export default StarFieldBackground;
