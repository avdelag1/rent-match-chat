/**
 * RADAR SEARCH EFFECT
 *
 * Animated sonar/lidar ripple effect for search states.
 * Creates the illusion of active scanning and thinking.
 *
 * Features:
 * - Multiple expanding ripple waves
 * - Rotating sweep beam (like a real radar)
 * - Pulsing center point
 * - Dynamic scan lines
 * - Continuous animation conveying "searching"
 * - Alive and responsive feeling
 * - GPU-accelerated
 */

import { memo, CSSProperties } from 'react';
import { motion } from 'framer-motion';

interface RadarSearchEffectProps {
  /** Size in pixels (default 120) */
  size?: number;
  /** Primary color (default: currentColor) */
  color?: string;
  /** Show label text below the radar */
  label?: string;
  /** Additional className */
  className?: string;
  /** Whether animation is active (default true) */
  isActive?: boolean;
}

/**
 * Radar Search Effect Component
 *
 * Renders a calm, futuristic radar sweep animation that suggests
 * "searching / scanning / discovering" without being distracting.
 */
export const RadarSearchEffect = memo(function RadarSearchEffect({
  size = 120,
  color = 'currentColor',
  label,
  className = '',
  isActive = true,
}: RadarSearchEffectProps) {
  const centerSize = size * 0.15; // 15% of size for center dot
  const ringGap = size * 0.18; // Gap between concentric rings

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const baseRingStyle: CSSProperties = {
    position: 'absolute',
    borderRadius: '50%',
    border: `1px solid`,
    borderColor: 'inherit',
    opacity: 0.2,
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div style={containerStyle}>
        {/* Background glow */}
        <motion.div
          animate={isActive ? {
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          }}
        />

        {/* Concentric rings - static guides */}
        {[1, 2, 3].map((ring) => (
          <div
            key={ring}
            style={{
              ...baseRingStyle,
              width: centerSize + ringGap * ring * 2,
              height: centerSize + ringGap * ring * 2,
              borderColor: color,
            }}
          />
        ))}

        {/* Outer ring with pulse animation */}
        <motion.div
          animate={isActive ? {
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.1, 0.3],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: '50%',
            border: `2px solid ${color}`,
            opacity: 0.3,
          }}
        />

        {/* ROTATING SWEEP BEAM - Classic radar sweep effect */}
        <motion.div
          animate={isActive ? {
            rotate: [0, 360],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            overflow: 'hidden',
            borderRadius: '50%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: size / 2,
              height: size / 2,
              transformOrigin: '0% 0%',
              background: `conic-gradient(
                from 0deg,
                transparent 0%,
                ${color}40 30%,
                ${color}20 60%,
                transparent 100%
              )`,
            }}
          />
        </motion.div>

        {/* Scan line sweep - horizontal scanning */}
        <motion.div
          animate={isActive ? {
            y: [-size * 0.4, size * 0.4],
            opacity: [0, 0.6, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 0.5,
          }}
          style={{
            position: 'absolute',
            width: size * 0.8,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />

        {/* Ripple wave 1 - fast wave */}
        <motion.div
          animate={isActive ? {
            scale: [0.2, 2.2],
            opacity: [1, 0],
          } : {}}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: [0.2, 0.8, 0.2, 1],
            delay: 0,
          }}
          style={{
            position: 'absolute',
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: '50%',
            border: `3px solid ${color}`,
            boxShadow: `0 0 ${size * 0.1}px ${color}80`,
            willChange: 'transform, opacity',
          }}
        />

        {/* Ripple wave 2 - medium wave with delay */}
        <motion.div
          animate={isActive ? {
            scale: [0.2, 2.2],
            opacity: [1, 0],
          } : {}}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: [0.2, 0.8, 0.2, 1],
            delay: 0.35,
          }}
          style={{
            position: 'absolute',
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: '50%',
            border: `3px solid ${color}`,
            boxShadow: `0 0 ${size * 0.1}px ${color}80`,
            willChange: 'transform, opacity',
          }}
        />

        {/* Ripple wave 3 - slow wave with longer delay */}
        <motion.div
          animate={isActive ? {
            scale: [0.2, 2.2],
            opacity: [1, 0],
          } : {}}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: [0.2, 0.8, 0.2, 1],
            delay: 0.7,
          }}
          style={{
            position: 'absolute',
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: '50%',
            border: `3px solid ${color}`,
            boxShadow: `0 0 ${size * 0.1}px ${color}80`,
            willChange: 'transform, opacity',
          }}
        />

        {/* Ripple wave 4 - extra wave for more liveliness */}
        <motion.div
          animate={isActive ? {
            scale: [0.2, 2.2],
            opacity: [1, 0],
          } : {}}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: [0.2, 0.8, 0.2, 1],
            delay: 1.05,
          }}
          style={{
            position: 'absolute',
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: '50%',
            border: `3px solid ${color}`,
            boxShadow: `0 0 ${size * 0.1}px ${color}80`,
            willChange: 'transform, opacity',
          }}
        />

        {/* Target detection blips - simulate finding targets */}
        {isActive && [0, 1, 2].map((blip) => {
          const angle = (blip * 120) + (Date.now() / 100 % 360);
          const radius = size * 0.35;
          const x = Math.cos(angle * Math.PI / 180) * radius;
          const y = Math.sin(angle * Math.PI / 180) * radius;

          return (
            <motion.div
              key={blip}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: blip * 0.6,
              }}
              style={{
                position: 'absolute',
                width: size * 0.08,
                height: size * 0.08,
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                marginLeft: -(size * 0.04),
                marginTop: -(size * 0.04),
                borderRadius: '50%',
                backgroundColor: color,
                boxShadow: `0 0 ${size * 0.15}px ${color}`,
              }}
            />
          );
        })}

        {/* Center dot with enhanced pulse - heartbeat effect */}
        <motion.div
          animate={isActive ? {
            scale: [1, 1.4, 1.1, 1.4, 1],
            opacity: [0.9, 1, 0.95, 1, 0.9],
          } : {}}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.2, 0.3, 0.5, 1],
          }}
          style={{
            position: 'absolute',
            width: centerSize,
            height: centerSize,
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 ${size * 0.2}px ${color}`,
          }}
        />

        {/* Energy ring from center - stronger burst */}
        <motion.div
          animate={isActive ? {
            scale: [0.3, 3.5],
            opacity: [0.7, 0],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: centerSize,
            height: centerSize,
            borderRadius: '50%',
            border: `3px solid ${color}`,
            boxShadow: `0 0 ${size * 0.1}px ${color}`,
          }}
        />
      </div>

      {/* Optional label */}
      {label && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-muted-foreground"
        >
          {label}
        </motion.span>
      )}
    </div>
  );
});

/**
 * Compact radar for inline use (e.g., in buttons)
 */
export const RadarSearchIcon = memo(function RadarSearchIcon({
  size = 24,
  color = 'currentColor',
  isActive = true,
  className = '',
}: Omit<RadarSearchEffectProps, 'label'>) {
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} className={className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ position: 'absolute' }}
      >
        {/* Outer ring */}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.3"
        />
        {/* Middle ring */}
        <circle
          cx="12"
          cy="12"
          r="6"
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.4"
        />
        {/* Center dot */}
        <circle
          cx="12"
          cy="12"
          r="2"
          fill={color}
        />
      </svg>

      {/* Rotating sweep beam for compact icon */}
      {isActive && (
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            overflow: 'hidden',
            borderRadius: '50%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: size / 2,
              height: size / 2,
              transformOrigin: '0% 0%',
              background: `conic-gradient(
                from 0deg,
                transparent 0%,
                ${color}50 40%,
                transparent 100%
              )`,
            }}
          />
        </motion.div>
      )}

      {/* Ripple wave 1 */}
      {isActive && (
        <motion.div
          animate={{
            scale: [0.3, 2.2],
            opacity: [0.7, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0,
          }}
          style={{
            position: 'absolute',
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: '50%',
            border: `1px solid ${color}`,
          }}
        />
      )}

      {/* Ripple wave 2 */}
      {isActive && (
        <motion.div
          animate={{
            scale: [0.3, 2.2],
            opacity: [0.7, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.5,
          }}
          style={{
            position: 'absolute',
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: '50%',
            border: `1px solid ${color}`,
          }}
        />
      )}
    </div>
  );
});
