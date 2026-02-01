/**
 * DRAMATIC RADAR SEARCH EFFECT
 *
 * SUPER VISIBLE animated sonar/lidar ripple effect for search states.
 * Creates a dramatic, energetic, ALIVE scanning animation.
 *
 * Features:
 * - INTENSE expanding ripple waves with GLOWING effects
 * - Fast rotating sweep beams (like military radar)
 * - PULSING center point with energy bursts
 * - Dynamic scan lines with trails
 * - Particle effects and energy rings
 * - Continuous high-energy animation
 * - VERY VISIBLE and responsive
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
 * Renders a DRAMATIC, HIGH-ENERGY radar sweep animation that is
 * IMPOSSIBLE TO MISS and looks incredibly alive and active.
 */
export const RadarSearchEffect = memo(function RadarSearchEffect({
  size = 120,
  color = '#ef4444', // Default to bright red for maximum visibility
  label,
  className = '',
  isActive = true,
}: RadarSearchEffectProps) {
  const centerSize = size * 0.2; // Larger center dot
  const ringGap = size * 0.2;

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div style={containerStyle}>
        {/* MASSIVE Background glow - SUPER VISIBLE */}
        <motion.div
          animate={isActive ? {
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.6, 0.4],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}40 0%, ${color}20 40%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />

        {/* Static guide rings - BRIGHTER */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            animate={isActive ? {
              opacity: [0.3, 0.5, 0.3],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: ring * 0.2,
            }}
            style={{
              position: 'absolute',
              width: centerSize + ringGap * ring * 2,
              height: centerSize + ringGap * ring * 2,
              borderRadius: '50%',
              border: `2px solid ${color}`,
              opacity: 0.4,
              boxShadow: `0 0 10px ${color}60`,
            }}
          />
        ))}

        {/* FAST Rotating sweep beam #1 - INTENSE */}
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
                ${color}90 20%,
                ${color}60 40%,
                ${color}30 60%,
                transparent 100%
              )`,
              filter: 'blur(3px)',
            }}
          />
        </motion.div>

        {/* SECOND sweep beam - counter-rotating */}
        <motion.div
          animate={isActive ? {
            rotate: [360, 0],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: size * 0.8,
            height: size * 0.8,
            overflow: 'hidden',
            borderRadius: '50%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: size * 0.4,
              height: size * 0.4,
              transformOrigin: '0% 0%',
              background: `conic-gradient(
                from 0deg,
                transparent 0%,
                ${color}60 30%,
                ${color}30 50%,
                transparent 100%
              )`,
              filter: 'blur(2px)',
            }}
          />
        </motion.div>

        {/* MASSIVE RIPPLE WAVE 1 - VERY VISIBLE */}
        <motion.div
          animate={isActive ? {
            scale: [0.3, 3],
            opacity: [1, 0],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0,
          }}
          style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: '50%',
            border: `4px solid ${color}`,
            boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}40`,
            willChange: 'transform, opacity',
          }}
        />

        {/* MASSIVE RIPPLE WAVE 2 */}
        <motion.div
          animate={isActive ? {
            scale: [0.3, 3],
            opacity: [1, 0],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.3,
          }}
          style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: '50%',
            border: `4px solid ${color}`,
            boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}40`,
            willChange: 'transform, opacity',
          }}
        />

        {/* MASSIVE RIPPLE WAVE 3 */}
        <motion.div
          animate={isActive ? {
            scale: [0.3, 3],
            opacity: [1, 0],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.6,
          }}
          style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: '50%',
            border: `4px solid ${color}`,
            boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}40`,
            willChange: 'transform, opacity',
          }}
        />

        {/* MASSIVE RIPPLE WAVE 4 */}
        <motion.div
          animate={isActive ? {
            scale: [0.3, 3],
            opacity: [1, 0],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.9,
          }}
          style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: '50%',
            border: `4px solid ${color}`,
            boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}40`,
            willChange: 'transform, opacity',
          }}
        />

        {/* MASSIVE RIPPLE WAVE 5 - MORE ENERGY */}
        <motion.div
          animate={isActive ? {
            scale: [0.3, 3],
            opacity: [1, 0],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 1.2,
          }}
          style={{
            position: 'absolute',
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: '50%',
            border: `4px solid ${color}`,
            boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}40`,
            willChange: 'transform, opacity',
          }}
        />

        {/* Particle bursts - 8 particles */}
        {isActive && [0, 1, 2, 3, 4, 5, 6, 7].map((particle) => {
          const angle = particle * 45;
          return (
            <motion.div
              key={particle}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: [0, Math.cos(angle * Math.PI / 180) * size * 0.4, Math.cos(angle * Math.PI / 180) * size * 0.5],
                y: [0, Math.sin(angle * Math.PI / 180) * size * 0.4, Math.sin(angle * Math.PI / 180) * size * 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: particle * 0.15,
              }}
              style={{
                position: 'absolute',
                width: size * 0.06,
                height: size * 0.06,
                borderRadius: '50%',
                backgroundColor: color,
                boxShadow: `0 0 15px ${color}`,
              }}
            />
          );
        })}

        {/* SUPER BRIGHT center dot with DOUBLE HEARTBEAT */}
        <motion.div
          animate={isActive ? {
            scale: [1, 1.6, 1.2, 1.6, 1],
            opacity: [0.9, 1, 0.95, 1, 0.9],
          } : {}}
          transition={{
            duration: 1,
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
            boxShadow: `0 0 30px ${color}, 0 0 60px ${color}80, inset 0 0 20px ${color}`,
            border: `2px solid white`,
          }}
        />

        {/* Energy burst from center - FAST */}
        <motion.div
          animate={isActive ? {
            scale: [0.5, 4],
            opacity: [0.8, 0],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: centerSize,
            height: centerSize,
            borderRadius: '50%',
            border: `3px solid ${color}`,
            boxShadow: `0 0 20px ${color}`,
          }}
        />

        {/* Secondary energy burst - offset timing */}
        <motion.div
          animate={isActive ? {
            scale: [0.5, 4],
            opacity: [0.8, 0],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.75,
          }}
          style={{
            position: 'absolute',
            width: centerSize,
            height: centerSize,
            borderRadius: '50%',
            border: `3px solid ${color}`,
            boxShadow: `0 0 20px ${color}`,
          }}
        />

        {/* Outer energy ring - pulsing */}
        <motion.div
          animate={isActive ? {
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.3, 0.6],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: size * 0.95,
            height: size * 0.95,
            borderRadius: '50%',
            border: `3px solid ${color}`,
            boxShadow: `0 0 20px ${color}80, inset 0 0 20px ${color}40`,
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
