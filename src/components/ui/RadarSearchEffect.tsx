/**
 * RADAR SEARCH EFFECT
 *
 * Futuristic radar sweep animation for refresh/search states.
 * Replaces the old house/lupa icons with a calm, premium animation.
 *
 * Features:
 * - Circular radar sweep
 * - Soft pulse rings
 * - Slow rotating beam
 * - GPU-accelerated
 * - Calm, futuristic feel (not gamified)
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

        {/* Rotating radar beam / sweep */}
        <motion.div
          animate={isActive ? { rotate: 360 } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            willChange: 'transform',
          }}
        >
          {/* Radar beam - conic gradient for sweep effect */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '50%',
              height: '50%',
              transformOrigin: 'left center',
              background: `conic-gradient(
                from 0deg at 0% 50%,
                transparent 0deg,
                ${color}30 30deg,
                ${color}50 60deg,
                ${color}30 90deg,
                transparent 120deg
              )`,
              borderRadius: '0 100% 100% 0',
            }}
          />
        </motion.div>

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
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      animate={isActive ? { rotate: 360 } : {}}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{ willChange: 'transform' }}
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
      {/* Radar beam line */}
      <line
        x1="12"
        y1="12"
        x2="22"
        y2="12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </motion.svg>
  );
});
