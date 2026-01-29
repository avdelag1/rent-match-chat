import { memo, useMemo, useEffect, useState } from 'react';

/**
 * Realistic Night Sky Starfield
 * 
 * Deep space with naturally twinkling stars, subtle movement,
 * and realistic shooting stars - like watching the real night sky
 */

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  twinkleDelay: number;
  baseOpacity: number;
  color: 'white' | 'yellow' | 'blue-tint';
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => {
    const colorChoice = Math.random();
    let color: 'white' | 'yellow' | 'blue-tint';
    if (colorChoice > 0.9) color = 'yellow';
    else if (colorChoice > 0.8) color = 'blue-tint';
    else color = 'white';
    
    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      twinkleSpeed: Math.random() * 3 + 2,
      twinkleDelay: Math.random() * 5,
      baseOpacity: Math.random() * 0.4 + 0.3,
      color,
    };
  });
}

function StarFieldBackground() {
  const stars = useMemo(() => generateStars(250), []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate shooting star timings
  const shootingStars = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      delay: i * 4 + Math.random() * 3,
      duration: Math.random() * 1 + 0.8,
      startX: Math.random() * 100,
      startY: Math.random() * 40,
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
      style={{ background: 'linear-gradient(to bottom, #000008 0%, #0a0a18 50%, #050510 100%)' }}
    >
      {/* Milky Way effect - subtle band of light */}
      <div className="milky-way" />

      {/* Stars */}
      {mounted && stars.map((star) => (
        <div
          key={star.id}
          className={`star star-${star.color}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.twinkleSpeed}s`,
            animationDelay: `${star.twinkleDelay}s`,
            opacity: star.baseOpacity,
          }}
        />
      ))}

      {/* Extra bright stars (anchor stars) */}
      {mounted && [...Array(15)].map((_, i) => (
        <div
          key={`bright-${i}`}
          className="star star-bright"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Shooting stars */}
      {mounted && shootingStars.map((shooting) => (
        <div
          key={`shoot-${shooting.id}`}
          className="shooting-star"
          style={{
            animationDelay: `${shooting.delay}s`,
            animationDuration: `${shooting.duration}s`,
          }}
        />
      ))}

      <style>{`
        /* Deep space gradient background is inline */
        
        /* Subtle Milky Way band */
        .milky-way {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: 
            radial-gradient(ellipse at 30% 20%, 
              rgba(200, 200, 255, 0.03) 0%, 
              transparent 50%
            ),
            radial-gradient(ellipse at 70% 60%, 
              rgba(180, 170, 220, 0.02) 0%, 
              transparent 40%
            );
          transform: rotate(-15deg);
          pointer-events: none;
        }

        /* Base star */
        .star {
          position: absolute;
          border-radius: 50%;
          background: #fff;
        }

        /* White stars (most common) */
        .star-white {
          box-shadow: 0 0 2px 1px rgba(255, 255, 255, 0.3);
          animation: twinkle var(--twinkle-speed, 3s) ease-in-out infinite;
          animation-delay: var(--twinkle-delay, 0s);
        }

        /* Yellow tint stars (some stars have warmth) */
        .star-yellow {
          background: #fffde7;
          box-shadow: 
            0 0 2px 1px rgba(255, 253, 231, 0.4),
            0 0 4px 1px rgba(255, 235, 59, 0.2);
          animation: twinkle-yellow var(--twinkle-speed, 3s) ease-in-out infinite;
          animation-delay: var(--twinkle-delay, 0s);
        }

        /* Blue-tint stars (cooler stars) */
        .star-blue-tint {
          background: #e3f2fd;
          box-shadow: 
            0 0 2px 1px rgba(227, 242, 253, 0.4),
            0 0 3px 0.5px rgba(100, 181, 246, 0.3);
          animation: twinkle-blue var(--twinkle-speed, 3s) ease-in-out infinite;
          animation-delay: var(--twinkle-delay, 0s);
        }

        /* Bright anchor stars */
        .star-bright {
          width: 3px !important;
          height: 3px !important;
          background: #fff;
          box-shadow: 
            0 0 4px 2px rgba(255, 255, 255, 0.8),
            0 0 8px 4px rgba(200, 220, 255, 0.4),
            0 0 12px 6px rgba(180, 200, 255, 0.2);
          animation: twinkle-bright 2.5s ease-in-out infinite;
          animation-delay: var(--twinkle-delay, 0s);
        }

        @keyframes twinkle {
          0%, 100% { 
            opacity: var(--base-opacity, 0.5); 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2);
          }
        }

        @keyframes twinkle-yellow {
          0%, 100% { 
            opacity: var(--base-opacity, 0.4); 
            transform: scale(1);
            box-shadow: 0 0 2px 1px rgba(255, 253, 231, 0.4);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.3);
            box-shadow: 
              0 0 4px 2px rgba(255, 253, 231, 0.6),
              0 0 8px 4px rgba(255, 235, 59, 0.3);
          }
        }

        @keyframes twinkle-blue {
          0%, 100% { 
            opacity: var(--base-opacity, 0.4); 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2);
            box-shadow: 
              0 0 4px 2px rgba(227, 242, 253, 0.6),
              0 0 8px 4px rgba(100, 181, 246, 0.3);
          }
        }

        @keyframes twinkle-bright {
          0%, 100% { 
            opacity: 0.7;
            transform: scale(1);
            box-shadow: 
              0 0 4px 2px rgba(255, 255, 255, 0.8),
              0 0 8px 4px rgba(200, 220, 255, 0.4);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.5);
            box-shadow: 
              0 0 6px 3px rgba(255, 255, 255, 1),
              0 0 16px 8px rgba(200, 220, 255, 0.6),
              0 0 24px 12px rgba(180, 200, 255, 0.3);
          }
        }

        /* Shooting star */
        .shooting-star {
          position: absolute;
          width: 150px;
          height: 2px;
          background: linear-gradient(to right, 
            transparent 0%,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0.9) 50%,
            rgba(255, 255, 255, 0.8) 70%,
            transparent 100%
          );
          border-radius: 100%;
          opacity: 0;
          filter: blur(0.5px);
          transform-origin: left center;
          animation: shoot linear infinite;
        }

        @keyframes shoot {
          0% {
            transform: translateX(0) translateY(0) rotate(-45deg);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          30% {
            transform: translateX(400px) translateY(400px) rotate(-45deg);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default memo(StarFieldBackground);
