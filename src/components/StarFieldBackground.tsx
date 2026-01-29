import { memo, useMemo } from 'react';

/**
 * Live Star Timelapse Background
 * 
 * Creates an animated star field effect
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

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.3,
  }));
}

function StarFieldBackground() {
  // Generate stars once with useMemo
  const stars = useMemo(() => generateStars(100), []);
  const stars2 = useMemo(() => generateStars(50), []);
  const stars3 = useMemo(() => generateStars(30), []);

  return (
    <div
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

      {/* Stars with CSS animation */}
      {stars.map((star) => (
        <div
          key={`s1-${star.id}`}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {stars2.map((star) => (
        <div
          key={`s2-${star.id}`}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size * 1.2}px`,
            height: `${star.size * 1.2}px`,
            opacity: star.opacity * 0.7,
            animationDuration: `${star.duration * 1.2}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {stars3.map((star) => (
        <div
          key={`s3-${star.id}`}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size * 1.5}px`,
            height: `${star.size * 1.5}px`,
            opacity: star.opacity * 0.5,
            animationDuration: `${star.duration * 1.5}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Shooting star animation */}
      <div className="shooting-star shooting-star-1" />
      <div className="shooting-star shooting-star-2" />
      <div className="shooting-star shooting-star-3" />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-pulse {
          animation-name: pulse;
          animation-fill-mode: both;
          animation-iteration-count: infinite;
        }
        .shooting-star {
          position: absolute;
          width: 100px;
          height: 2px;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%);
          border-radius: 50%;
          opacity: 0;
        }
        .shooting-star-1 {
          top: 10%;
          left: 20%;
          animation: shoot 3s ease-in-out infinite;
          animation-delay: 2s;
        }
        .shooting-star-2 {
          top: 25%;
          left: 60%;
          animation: shoot 4s ease-in-out infinite;
          animation-delay: 5s;
        }
        .shooting-star-3 {
          top: 15%;
          left: 40%;
          animation: shoot 3.5s ease-in-out infinite;
          animation-delay: 8s;
        }
        @keyframes shoot {
          0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 0; }
          5% { opacity: 1; }
          20% { transform: translateX(300px) translateY(300px) rotate(-45deg); opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default memo(StarFieldBackground);
