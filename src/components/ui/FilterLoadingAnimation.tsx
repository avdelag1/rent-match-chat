/**
 * FILTER-SPECIFIC LOADING ANIMATIONS
 *
 * Each filter category gets a unique heartbeat-style loading animation:
 * - Property: Home heartbeat with roof pulse
 * - Motorcycle: Engine pulse with speed lines
 * - Bicycle: Wheel rotation with pedal rhythm
 * - Services: Tool pulse with work rhythm
 */

import { memo, CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { QuickFilterCategory } from '@/types/filters';

interface FilterLoadingAnimationProps {
  /** Filter category to determine animation style */
  category: QuickFilterCategory;
  /** Size in pixels (default 120) */
  size?: number;
  /** Whether animation is active (default true) */
  isActive?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Property Loading Animation
 * Home heartbeat with expanding roof pulse
 */
const PropertyAnimation = memo(({ size = 120, isActive = true }: { size: number; isActive: boolean }) => {
  const color = 'hsl(var(--primary))';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Breathing background glow */}
      <motion.div
        animate={isActive ? {
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.25, 0.1],
        } : {}}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size * 0.9,
          height: size * 0.9,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        }}
      />

      {/* Heartbeat rings - like searching radius */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          animate={isActive ? {
            scale: [0.8, 2.2],
            opacity: [0.5, 0],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
            delay: ring * 0.4,
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: '50%',
            border: `2px solid ${color}`,
          }}
        />
      ))}

      {/* Center house icon with heartbeat */}
      <motion.div
        animate={isActive ? {
          scale: [1, 1.2, 1, 1.15, 1],
        } : {}}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.2, 0.4, 0.6, 1],
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width={size * 0.35} height={size * 0.35} viewBox="0 0 24 24" fill="none">
          <path
            d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
});

PropertyAnimation.displayName = 'PropertyAnimation';

/**
 * Motorcycle Loading Animation
 * Engine pulse with speed effect
 */
const MotorcycleAnimation = memo(({ size = 120, isActive = true }: { size: number; isActive: boolean }) => {
  const color = 'hsl(220 10% 46%)'; // slate-500

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Speed lines - horizontal motion blur effect */}
      {[0, 1, 2].map((line) => (
        <motion.div
          key={line}
          animate={isActive ? {
            x: [-size * 0.6, size * 0.6],
            opacity: [0, 0.6, 0],
            scaleX: [0.5, 1, 0.5],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: line * 0.2,
          }}
          style={{
            position: 'absolute',
            top: `${40 + line * 10}%`,
            left: '50%',
            width: size * 0.4,
            height: 2,
            background: color,
            borderRadius: 2,
          }}
        />
      ))}

      {/* Engine pulse rings */}
      {[1, 2].map((ring) => (
        <motion.div
          key={ring}
          animate={isActive ? {
            scale: [0.9, 1.8],
            opacity: [0.6, 0],
          } : {}}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeOut',
            delay: ring * 0.3,
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: '50%',
            border: `2px solid ${color}`,
          }}
        />
      ))}

      {/* Center motorcycle icon with vibration */}
      <motion.div
        animate={isActive ? {
          scale: [1, 1.15, 1, 1.1, 1],
          x: [0, -2, 2, -1, 0],
        } : {}}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="17" r="3" stroke={color} strokeWidth="2" />
          <circle cx="18" cy="17" r="3" stroke={color} strokeWidth="2" />
          <path
            d="M9 17L15 17M12 8L15 14H9L12 8Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
});

MotorcycleAnimation.displayName = 'MotorcycleAnimation';

/**
 * Bicycle Loading Animation
 * Wheel rotation with pedal rhythm
 */
const BicycleAnimation = memo(({ size = 120, isActive = true }: { size: number; isActive: boolean }) => {
  const color = 'hsl(142 76% 36%)'; // emerald-600

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Rotating wheel rings */}
      <motion.div
        animate={isActive ? {
          rotate: [0, 360],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Spokes */}
        {[0, 45, 90, 135].map((angle) => (
          <div
            key={angle}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: size * 0.45,
              height: 2,
              background: color,
              transformOrigin: 'center',
              transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              opacity: 0.4,
            }}
          />
        ))}

        {/* Outer wheel */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: '50%',
            border: `2px solid ${color}`,
          }}
        />
      </motion.div>

      {/* Pedal rhythm pulses */}
      {[1, 2].map((pulse) => (
        <motion.div
          key={pulse}
          animate={isActive ? {
            scale: [0.8, 1.6],
            opacity: [0.5, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
            delay: pulse * 0.5,
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: '50%',
            border: `2px solid ${color}`,
          }}
        />
      ))}

      {/* Center bicycle icon */}
      <motion.div
        animate={isActive ? {
          y: [0, -3, 0, -2, 0],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width={size * 0.35} height={size * 0.35} viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="17" r="2.5" stroke={color} strokeWidth="2" />
          <circle cx="18" cy="17" r="2.5" stroke={color} strokeWidth="2" />
          <path
            d="M8.5 17L12 10L15.5 17M12 10V7M10 7H14"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
});

BicycleAnimation.displayName = 'BicycleAnimation';

/**
 * Services Loading Animation
 * Tool pulse with work rhythm
 */
const ServicesAnimation = memo(({ size = 120, isActive = true }: { size: number; isActive: boolean }) => {
  const color = 'hsl(271 91% 65%)'; // purple-500

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Work rhythm pulses - quick double beat like hammer strikes */}
      {[1, 2, 3].map((pulse) => (
        <motion.div
          key={pulse}
          animate={isActive ? {
            scale: [0.7, 2],
            opacity: [0.6, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
            delay: pulse * 0.35,
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: '50%',
            border: `2px solid ${color}`,
          }}
        />
      ))}

      {/* Rotating tool indicators */}
      <motion.div
        animate={isActive ? {
          rotate: [0, 180, 360],
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {[0, 120, 240].map((angle) => (
          <motion.div
            key={angle}
            animate={isActive ? {
              opacity: [0.3, 0.7, 0.3],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: angle / 360,
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: size * 0.15,
              height: size * 0.15,
              borderRadius: '50%',
              background: color,
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${size * 0.25}px)`,
            }}
          />
        ))}
      </motion.div>

      {/* Center wrench icon with hammer pulse */}
      <motion.div
        animate={isActive ? {
          scale: [1, 1.25, 1, 1.15, 1],
          rotate: [0, -5, 5, -3, 0],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.2, 0.4, 0.6, 1],
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width={size * 0.35} height={size * 0.35} viewBox="0 0 24 24" fill="none">
          <path
            d="M14.7 6.3C15.1 5.9 15.1 5.3 14.7 4.9L13.1 3.3C12.7 2.9 12.1 2.9 11.7 3.3L8 7L10 9M14.7 6.3L19 10.6C20.4 12 20.4 14.3 19 15.7C17.6 17.1 15.3 17.1 13.9 15.7L9.6 11.4M14.7 6.3L9.6 11.4M8 7L3.3 11.7C2.9 12.1 2.9 12.7 3.3 13.1L4.9 14.7C5.3 15.1 5.9 15.1 6.3 14.7L10 11M8 7L10 9M10 9L9.6 11.4"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
});

ServicesAnimation.displayName = 'ServicesAnimation';

/**
 * Main Filter Loading Animation Component
 * Renders appropriate animation based on category
 */
export const FilterLoadingAnimation = memo(function FilterLoadingAnimation({
  category,
  size = 120,
  isActive = true,
  className = '',
}: FilterLoadingAnimationProps) {
  const animations = {
    property: <PropertyAnimation size={size} isActive={isActive} />,
    motorcycle: <MotorcycleAnimation size={size} isActive={isActive} />,
    bicycle: <BicycleAnimation size={size} isActive={isActive} />,
    services: <ServicesAnimation size={size} isActive={isActive} />,
  };

  return (
    <div className={className}>
      {animations[category] || animations.property}
    </div>
  );
});
