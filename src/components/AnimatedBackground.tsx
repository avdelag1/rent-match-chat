import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export type BackgroundTheme = 'sunset-coconuts' | 'vehicles-properties' | 'ducks' | 'stars' | 'ny-red';

interface AnimatedBackgroundProps {
  theme: BackgroundTheme;
  isActive: boolean;
}

// Generate random positions for floating elements
const generateRandomElements = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 20,
    scale: 0.5 + Math.random() * 1.5,
  }));
};

export const AnimatedBackground = memo(({ theme, isActive }: AnimatedBackgroundProps) => {
  const [elements] = useState(() => generateRandomElements(15));

  // Render different animations based on theme
  const renderTheme = () => {
    switch (theme) {
      case 'sunset-coconuts':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Sunset gradient background */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, #FF6B35 0%, #F7931E 30%, #FFB347 60%, #FFA500 100%)',
              }}
            />

            {/* Floating coconuts */}
            {elements.map((elem) => (
              <motion.div
                key={elem.id}
                className="absolute text-4xl md:text-5xl"
                style={{
                  left: `${elem.x}%`,
                  top: `${elem.y}%`,
                  fontSize: `${elem.scale * 2}rem`,
                }}
                animate={{
                  x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
                  y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: elem.duration,
                  repeat: Infinity,
                  delay: elem.delay,
                  ease: "linear",
                }}
              >
                🥥
              </motion.div>
            ))}
          </div>
        );

      case 'vehicles-properties':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Purple-blue gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              }}
            />

            {/* Floating vehicles and properties */}
            {elements.map((elem, idx) => {
              const icons = ['🏠', '🏢', '🚗', '🏍️', '🚙', '🏡', '🏘️', '🚕'];
              const icon = icons[idx % icons.length];

              return (
                <motion.div
                  key={elem.id}
                  className="absolute text-3xl md:text-4xl"
                  style={{
                    left: `${elem.x}%`,
                    top: `${elem.y}%`,
                    fontSize: `${elem.scale * 2}rem`,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                  }}
                  animate={{
                    x: [0, Math.random() * 80 - 40, Math.random() * 80 - 40, 0],
                    y: [0, Math.random() * 80 - 40, Math.random() * 80 - 40, 0],
                    rotate: [0, 15, -15, 0],
                  }}
                  transition={{
                    duration: elem.duration,
                    repeat: Infinity,
                    delay: elem.delay,
                    ease: "easeInOut",
                  }}
                >
                  {icon}
                </motion.div>
              );
            })}
          </div>
        );

      case 'ducks':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Bright yellow gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FFA500 100%)',
              }}
            />

            {/* Floating ducks with sunglasses */}
            {elements.map((elem) => (
              <motion.div
                key={elem.id}
                className="absolute"
                style={{
                  left: `${elem.x}%`,
                  top: `${elem.y}%`,
                }}
                animate={{
                  x: [0, Math.random() * 120 - 60, Math.random() * 120 - 60, 0],
                  y: [0, Math.random() * 120 - 60, Math.random() * 120 - 60, 0],
                  rotate: [0, 20, -20, 0],
                }}
                transition={{
                  duration: elem.duration,
                  repeat: Infinity,
                  delay: elem.delay,
                  ease: "easeInOut",
                }}
              >
                <div className="flex flex-col items-center" style={{ fontSize: `${elem.scale * 1.8}rem` }}>
                  <span className="relative">
                    🦆
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 text-lg">🕶️</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'stars':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Dark space gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
              }}
            />

            {/* Stars */}
            {elements.map((elem) => (
              <motion.div
                key={elem.id}
                className="absolute"
                style={{
                  left: `${elem.x}%`,
                  top: `${elem.y}%`,
                  fontSize: `${elem.scale * 1.2}rem`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  repeat: Infinity,
                  delay: elem.delay,
                  ease: "easeInOut",
                }}
              >
                ✨
              </motion.div>
            ))}

            {/* Shooting stars */}
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={`shooting-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 50}%`,
                  boxShadow: '0 0 10px 2px rgba(255,255,255,0.8)',
                }}
                animate={{
                  x: [0, 300],
                  y: [0, 200],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 3,
                  ease: "easeIn",
                }}
              />
            ))}
          </div>
        );

      case 'ny-red':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* NY red gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #FF4458 0%, #FE3C72 50%, #FF6B6B 100%)',
              }}
            />

            {/* NY themed elements */}
            {elements.map((elem, idx) => {
              const icons = ['🗽', '🏙️', '🌃', '🚕', '🍎', '🗽'];
              const icon = icons[idx % icons.length];

              return (
                <motion.div
                  key={elem.id}
                  className="absolute text-3xl md:text-4xl"
                  style={{
                    left: `${elem.x}%`,
                    top: `${elem.y}%`,
                    fontSize: `${elem.scale * 2}rem`,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                  }}
                  animate={{
                    x: [0, Math.random() * 60 - 30, Math.random() * 60 - 30, 0],
                    y: [0, Math.random() * 60 - 30, Math.random() * 60 - 30, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: elem.duration,
                    repeat: Infinity,
                    delay: elem.delay,
                    ease: "easeInOut",
                  }}
                >
                  {icon}
                </motion.div>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {renderTheme()}
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';
