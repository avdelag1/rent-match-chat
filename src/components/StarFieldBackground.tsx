import { memo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Live Star Timelapse Background
 * 
 * Creates a stunning animated star field with:
 * - Shooting stars that trail across the sky
 * - Twinkling stars with varying brightness
 * - Gentle floating movement (timelapse effect)
 * - Parallax depth layers
 */

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  duration: number;
}

// Generate static stars with varied positions
const generateStars = (count: number): Star[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.3,
  }));
};

// Generate shooting stars
const generateShootingStars = (count: number): ShootingStar[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: Math.random() * 60 + 20,
    startY: Math.random() * 40,
    endX: Math.random() * 30,
    endY: Math.random() * 30 + 50,
    delay: Math.random() * 15 + (i * 5),
    duration: Math.random() * 1 + 0.8,
  }));
};

function StarFieldBackground() {
  // Stars at different depth layers
  const [stars] = useState(() => generateStars(150));
  const [stars2] = useState(() => generateStars(80));
  const [stars3] = useState(() => generateStars(40));
  const [shootingStars] = useState(() => generateShootingStars(5));
  
  // Ref for animation frame
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none"
      style={{
        background: 'linear-gradient(to bottom, #0a0a1a 0%, #0d1b2a 50%, #1b263b 100%)',
      }}
    >
      {/* Ambient nebula glow */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(120, 0, 180, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(0, 100, 150, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(30, 60, 100, 0.2) 0%, transparent 70%)
          `,
        }}
      />

      {/* Deep background stars - slow float */}
      {stars3.map((star) => (
        <motion.div
          key={`stars3-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size * 1.5,
            height: star.size * 1.5,
            opacity: star.opacity * 0.4,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [star.opacity * 0.4, star.opacity * 0.6, star.opacity * 0.4],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: star.duration * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.delay,
          }}
        />
      ))}

      {/* Mid background stars */}
      {stars2.map((star) => (
        <motion.div
          key={`stars2-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity * 0.6,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [star.opacity * 0.6, star.opacity * 0.9, star.opacity * 0.6],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: star.duration * 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.delay,
          }}
        />
      ))}

      {/* Foreground bright stars - fastest twinkle */}
      {stars.map((star) => (
        <motion.div
          key={`stars-${star.id}`}
          className="absolute rounded-full bg-white shadow-lg"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            boxShadow: `0 0 ${star.size * 2}px ${star.size}px rgba(255, 255, 255, 0.5)`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [star.opacity, 1, star.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: star.delay,
          }}
        />
      ))}

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <ShootingStar
          key={`shooting-${star.id}`}
          startX={star.startX}
          startY={star.startY}
          endX={star.endX}
          endY={star.endY}
          delay={star.delay}
          duration={star.duration}
        />
      ))}

      {/* Milky way effect at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20"
        style={{
          background: `
            linear-gradient(to top, 
              rgba(200, 180, 255, 0.1) 0%,
              transparent 50%,
              transparent 100%
            )
          `,
        }}
      />
    </div>
  );
}

// Shooting star component with trail
function ShootingStar({ startX, startY, endX, endY, delay, duration }: ShootingStar) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
      }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: [0, (endX - startX)],
        y: [0, (endY - startY)],
      }}
      transition={{
        duration,
        delay,
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: delay,
      }}
    >
      {/* Main star head */}
      <div
        className="rounded-full bg-white shadow-[0_0_10px_3px_rgba(255,255,255,0.8)]"
        style={{
          width: 3,
          height: 3,
        }}
      />
      
      {/* Trail */}
      <motion.div
        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-l from-white via-white/50 to-transparent"
        style={{
          transformOrigin: 'left center',
          width: 80,
        }}
        animate={{
          opacity: [0, 0.8, 0.8, 0],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatDelay: delay,
        }}
      />
    </motion.div>
  );
}

export default memo(StarFieldBackground);
