import { memo, useMemo } from 'react';

/**
 * Live Star Timelapse Background
 * 
 * Deep black sky with bright, glowing, alive stars
 */

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  glow: string;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 1.5,
    duration: Math.random() * 1.5 + 0.8,
    delay: Math.random() * 2,
    opacity: Math.random() * 0.5 + 0.5,
    glow: Math.random() > 0.7 ? 'star-glow-strong' : 'star-glow',
  }));
}

function StarFieldBackground() {
  const stars = useMemo(() => generateStars(200), []);

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none"
      style={{ backgroundColor: '#000005' }}
    >
      {/* Nebula glow effects */}
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />

      {/* Bright stars with glow */}
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          className={`star ${star.glow}`}
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

      {/* Extra bright flare stars */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`flare-${i}`}
          className="star star-flare"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Shooting stars - more frequent and brighter */}
      <div className="shooting-star" style={{ top: '8%', left: '10%', animationDelay: '0s' }} />
      <div className="shooting-star" style={{ top: '15%', left: '60%', animationDelay: '2.5s' }} />
      <div className="shooting-star" style={{ top: '5%', left: '35%', animationDelay: '5s' }} />
      <div className="shooting-star" style={{ top: '25%', left: '75%', animationDelay: '7.5s' }} />
      <div className="shooting-star" style={{ top: '12%', left: '20%', animationDelay: '10s' }} />
      <div className="shooting-star" style={{ top: '3%', left: '85%', animationDelay: '12.5s' }} />

      <style>{`
        /* Nebula background glows */
        .nebula {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }
        .nebula-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(100, 150, 255, 0.4) 0%, transparent 70%);
          top: 10%;
          left: 20%;
          animation: nebula-move 20s ease-in-out infinite;
        }
        .nebula-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(150, 100, 255, 0.3) 0%, transparent 70%);
          top: 50%;
          right: 10%;
          animation: nebula-move 25s ease-in-out infinite reverse;
        }
        .nebula-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(100, 200, 255, 0.25) 0%, transparent 70%);
          bottom: 20%;
          left: 30%;
          animation: nebula-move 18s ease-in-out infinite;
        }
        @keyframes nebula-move {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }

        /* Bright star styles */
        .star {
          position: absolute;
          border-radius: 50%;
          background: #ffffff;
        }
        .star-glow {
          box-shadow: 
            0 0 6px 2px rgba(255, 255, 255, 0.8),
            0 0 12px 4px rgba(200, 220, 255, 0.4);
          animation: star-pulse 2s ease-in-out infinite;
        }
        .star-glow-strong {
          box-shadow: 
            0 0 8px 3px rgba(255, 255, 255, 1),
            0 0 16px 6px rgba(180, 200, 255, 0.6),
            0 0 24px 8px rgba(150, 180, 255, 0.3);
          animation: star-pulse-strong 1.5s ease-in-out infinite;
        }
        .star-flare {
          width: 3px !important;
          height: 3px !important;
          box-shadow: 
            0 0 10px 4px rgba(255, 255, 255, 1),
            0 0 20px 8px rgba(200, 220, 255, 0.7);
          animation: star-flare-anim 3s ease-in-out infinite;
        }

        @keyframes star-pulse {
          0%, 100% { 
            opacity: 0.4;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.3);
          }
        }
        @keyframes star-pulse-strong {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
            box-shadow: 
              0 0 8px 3px rgba(255, 255, 255, 1),
              0 0 16px 6px rgba(180, 200, 255, 0.6);
          }
          50% { 
            opacity: 1;
            transform: scale(1.4);
            box-shadow: 
              0 0 12px 4px rgba(255, 255, 255, 1),
              0 0 24px 10px rgba(200, 220, 255, 0.8),
              0 0 36px 14px rgba(180, 200, 255, 0.4);
          }
        }
        @keyframes star-flare-anim {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); box-shadow: 0 0 15px 6px rgba(255, 255, 255, 1), 0 0 30px 12px rgba(200, 220, 255, 0.8); }
        }

        /* Shooting stars */
        .shooting-star {
          position: absolute;
          width: 200px;
          height: 2px;
          background: linear-gradient(to right, 
            rgba(255,255,255,0) 0%, 
            rgba(255,255,255,0.2) 20%, 
            rgba(255,255,255,1) 50%,
            rgba(255,255,255,0.9) 80%,
            rgba(255,255,255,0) 100%
          );
          border-radius: 50%;
          opacity: 0;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
          animation: shoot 5s ease-out infinite;
        }
        @keyframes shoot {
          0% {
            transform: translateX(0) translateY(0) rotate(-30deg);
            opacity: 0;
          }
          3% {
            opacity: 1;
          }
          12% {
            transform: translateX(500px) translateY(350px) rotate(-30deg);
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
