/**
 * RADAR SEARCH EFFECT
 *
 * Animated sonar/lidar ripple effect for search states.
 * Creates the illusion of active scanning and thinking.
 *
 * Features:
 * - Multiple expanding ripple waves
 * - Pulsing center point
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

        {/* Ripple wave 1 - fast wave */}
        <motion.div
          animate={isActive ? {
            scale: [0.2, 1.8],
            opacity: [0.8, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0,
          }}
          style={{
            position: 'absolute',
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: '50%',
            border: `2px solid ${color}`,
            willChange: 'transform, opacity',
          }}
        />

        {/* Ripple wave 2 - medium wave with delay */}
        <motion.div
          animate={isActive ? {
            scale: [0.2, 1.8],
            opacity: [0.8, 0],
          } : {}}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.4,
          }}
          style={{
            position: 'absolute',
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: '50%',
            border: `2px solid ${color}`,
            willChange: 'transform, opacity',
          }}
        />

        {/* Ripple wave 3 - slow wave with longer delay */}
        <motion.div
          animate={isActive ? {
            scale: [0.2, 1.8],
            opacity: [0.8, 0],
          } : {}}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.8,
          }}
          style={{
            position: 'absolute',
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: '50%',
            border: `2px solid ${color}`,
            willChange: 'transform, opacity',
          }}
        />

        {/* Center dot with subtle pulse */}
        <motion.div
          animate={isActive ? {
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: centerSize,
            height: centerSize,
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 ${size * 0.1}px ${color}80`,
          }}
        />

        {/* Secondary pulse ring from center */}
        <motion.div
          animate={isActive ? {
            scale: [0.5, 3],
            opacity: [0.5, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: centerSize,
            height: centerSize,
            borderRadius: '50%',
            border: `2px solid ${color}`,
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

      {/* Ripple wave 1 */}
      {isActive && (
        <motion.div
          animate={{
            scale: [0.3, 2],
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
            scale: [0.3, 2],
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
