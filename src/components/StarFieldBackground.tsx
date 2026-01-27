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

const STAR_COUNT = 150;
const SHOOTING_STAR_INTERVAL_MIN = 8000;
const SHOOTING_STAR_INTERVAL_MAX = 15000;

// Generate random stars
const generateStars = (): Star[] => {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.7 + 0.3,
    twinkleSpeed: Math.random() * 2 + 1,
    twinkleOffset: Math.random() * 10,
  }));
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
          opacity: star.opacity - 0.015 * star.speed,
          startY: star.startY + 0.3 * star.speed,
          startX: star.startX + 0.2 * star.speed,
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
      onClick={handleClick}
      onTouchStart={handleClick}
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-auto"
      style={{
        background: 'linear-gradient(to bottom, #0a0a1a 0%, #0d0d2b 50%, #1a1a3a 100%)',
        zIndex: 0,
      }}
    >
      {/* Static stars with twinkle effect */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [
              star.opacity * 0.5,
              star.opacity,
              star.opacity * 0.3,
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
            height: '2px',
            background: `linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,${star.opacity}) 50%, rgba(200,220,255,${star.opacity}) 100%)`,
            transform: `rotate(${star.angle}deg)`,
            transformOrigin: 'left center',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Subtle nebula glow */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(100, 50, 150, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(50, 100, 150, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(100, 100, 200, 0.1) 0%, transparent 70%)
          `,
        }}
      />
    </div>
  );
};

export const StarFieldBackground = memo(StarFieldBackgroundComponent);

// Export for use in components
export default StarFieldBackground;
