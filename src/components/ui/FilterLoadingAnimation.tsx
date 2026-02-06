/**
 * FILTER-SPECIFIC LOADING ANIMATIONS
 *
 * Simple breathing icon animations for each filter category:
 * - Property: Home icon with concentric rings
 * - Motorcycle: Motorcycle icon with concentric rings
 * - Bicycle: Bicycle icon with concentric rings
 * - Services: Wrench icon with concentric rings
 *
 * Icons always breathe (zoom in/out) like a heartbeat - always alive!
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { QuickFilterCategory } from '@/types/filters';

interface FilterLoadingAnimationProps {
  /** Filter category to determine animation style */
  category: QuickFilterCategory;
  /** Size in pixels (default 120) */
  size?: number;
  /** Additional className */
  className?: string;
}

/**
 * Simple Breathing Icon Animation
 * Icon breathes with concentric rings behind it
 */
const BreathingIconAnimation = memo(({
  size = 120,
  color,
  icon
}: {
  size: number;
  color: string;
  icon: React.ReactNode;
}) => {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Static concentric rings */}
      {[1, 2, 3].map((ring) => (
        <div
          key={ring}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * (0.4 + ring * 0.15),
            height: size * (0.4 + ring * 0.15),
            borderRadius: '50%',
            border: `2px solid ${color}`,
            opacity: 0.2 - ring * 0.05,
          }}
        />
      ))}

      {/* Breathing icon - ALWAYS ALIVE */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1, 1.15, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.3, 0.6, 0.8, 1],
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {icon}
      </motion.div>
    </div>
  );
});

BreathingIconAnimation.displayName = 'BreathingIconAnimation';

/**
 * Main Filter Loading Animation Component
 * Renders appropriate icon based on category
 */
export const FilterLoadingAnimation = memo(function FilterLoadingAnimation({
  category,
  size = 120,
  className = '',
}: FilterLoadingAnimationProps) {
  const iconSize = size * 0.35;

  const categoryConfig: Record<QuickFilterCategory, { color: string; icon: React.ReactNode }> = {
    property: {
      color: 'hsl(var(--primary))',
      icon: (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <path
            d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    motorcycle: {
      color: 'hsl(220 10% 46%)',
      icon: (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="17" r="3" stroke="hsl(220 10% 46%)" strokeWidth="2" />
          <circle cx="18" cy="17" r="3" stroke="hsl(220 10% 46%)" strokeWidth="2" />
          <path
            d="M9 17L15 17M12 8L15 14H9L12 8Z"
            stroke="hsl(220 10% 46%)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    bicycle: {
      color: 'hsl(142 76% 36%)',
      icon: (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="17" r="2.5" stroke="hsl(142 76% 36%)" strokeWidth="2" />
          <circle cx="18" cy="17" r="2.5" stroke="hsl(142 76% 36%)" strokeWidth="2" />
          <path
            d="M8.5 17L12 10L15.5 17M12 10V7M10 7H14"
            stroke="hsl(142 76% 36%)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    services: {
      color: 'hsl(271 91% 65%)',
      icon: (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <path
            d="M14.7 6.3C15.1 5.9 15.1 5.3 14.7 4.9L13.1 3.3C12.7 2.9 12.1 2.9 11.7 3.3L8 7L10 9M14.7 6.3L19 10.6C20.4 12 20.4 14.3 19 15.7C17.6 17.1 15.3 17.1 13.9 15.7L9.6 11.4M14.7 6.3L9.6 11.4M8 7L3.3 11.7C2.9 12.1 2.9 12.7 3.3 13.1L4.9 14.7C5.3 15.1 5.9 15.1 6.3 14.7L10 11M8 7L10 9M10 9L9.6 11.4"
            stroke="hsl(271 91% 65%)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  };

  const config = categoryConfig[category] || categoryConfig.property;

  return (
    <div className={className}>
      <BreathingIconAnimation size={size} color={config.color} icon={config.icon} />
    </div>
  );
});
