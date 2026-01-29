import { memo, useMemo } from 'react';

/**
 * Live Star Timelapse Background
 * 
 * Pure black sky with moving, twinkling stars
 */

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  speed: number;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 2 + 1,
    delay: Math.random() * 3,
    opacity: Math.random() * 0.6 + 0.2,
    speed: Math.random() * 0.5 + 0.2,
  }));
}

function StarFieldBackground() {
  const stars = useMemo(() => generateStars(150), []);

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Moving stars with twinkle */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white star-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            '--star-speed': `${star.speed}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Shooting stars */}
      <div className="shooting-star" style={{ top: '10%', left: '15%', animationDelay: '0s' }} />
      <div className="shooting-star" style={{ top: '20%', left: '70%', animationDelay: '4s' }} />
      <div className="shooting-star" style={{ top: '5%', left: '40%', animationDelay: '8s' }} />
      <div className="shooting-star" style={{ top: '30%', left: '25%', animationDelay: '12s' }} />

      <style>{`
        @keyframes star-twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          25% {
            opacity: 1;
            transform: scale(1.2);
          }
          50% {
            opacity: 0.5;
            transform: scale(1);
          }
          75% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
        .star-twinkle {
          animation-name: star-twinkle;
          animation-fill-mode: both;
          animation-iteration-count: infinite;
        }
        .shooting-star {
          position: absolute;
          width: 150px;
          height: 2px;
          background: linear-gradient(to right, 
            rgba(255,255,255,0) 0%, 
            rgba(255,255,255,0.3) 30%, 
            rgba(255,255,255,1) 100%
          );
          border-radius: 50%;
          opacity: 0;
          animation: shoot 4s ease-out infinite;
        }
        @keyframes shoot {
          0% {
            transform: translateX(0) translateY(0) rotate(-35deg);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          15% {
            transform: translateX(400px) translateY(280px) rotate(-35deg);
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
