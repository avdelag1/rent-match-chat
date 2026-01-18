/**
 * SWIPE ACTION BUTTON BAR
 *
 * Premium floating button bar for swipe cards.
 * Matches modern dating apps (Tinder/Bumble/Hinge) pixel-perfect.
 *
 * Features:
 * - iOS-style frosted glass effect (backdrop-blur)
 * - 5-button layout: Return | Dislike | Share | Like | Message
 * - Size hierarchy: Like/Dislike are 1.5x larger (60px vs 40px)
 * - GPU-accelerated animations at 60fps
 * - Capacitor iOS haptics (light for small, medium for large)
 * - Depth illusion: cards swipe behind buttons
 * - Safe area handling for iOS home indicator
 *
 * BUTTON ORDER (LEFT → RIGHT):
 * 1. Return/Undo (small) - amber
 * 2. Dislike ❌ (large) - red
 * 3. Share (small) - purple
 * 4. Like ❤️ (large) - green
 * 5. Message/Chat (small) - cyan
 */

import { memo, useCallback, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Share2, RotateCcw, MessageCircle } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

interface SwipeActionButtonBarProps {
  onLike: () => void;
  onDislike: () => void;
  onShare?: () => void;
  onUndo?: () => void;
  onMessage?: () => void;
  canUndo?: boolean;
  disabled?: boolean;
  className?: string;
}

// iOS-feel spring animation config
const springConfig = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
  mass: 0.8,
} as const;

/**
 * BUTTON SIZING SYSTEM
 *
 * Designed for optimal thumb reach and touch ergonomics.
 * Based on Apple HIG minimum 44pt touch targets, scaled up for premium feel.
 *
 * Size Hierarchy:
 * - Primary (Like/Dislike): Dominant, easy to hit one-handed
 * - Secondary (Undo/Share/Message): Comfortable but not competing
 *
 * Hit areas are the full button size - no invisible padding needed.
 */
const LARGE_SIZE = 72;  // Primary actions (Like/Dislike) - increased from 68
const SMALL_SIZE = 54;  // Secondary actions (Undo/Share/Message) - increased from 48

// Icon sizes scale proportionally
const LARGE_ICON_SIZE = 34;  // Increased from 32
const SMALL_ICON_SIZE = 26;  // Increased from 24

// Gap between buttons - balanced for thumb navigation
const BUTTON_GAP = 14; // Slightly larger gap for better separation

// Tap animation scale
const TAP_SCALE = 0.92; // Slightly less dramatic for premium feel

// Premium ActionButton with glass effect and haptics
const ActionButton = memo(({
  onClick,
  disabled = false,
  size = 'small',
  variant = 'default',
  children,
  ariaLabel,
}: {
  onClick: () => void;
  disabled?: boolean;
  size?: 'small' | 'large';
  variant?: 'default' | 'like' | 'dislike' | 'amber' | 'cyan' | 'purple';
  children: React.ReactNode;
  ariaLabel: string;
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled) return;

    // iOS haptics - medium for large buttons, light for small
    if (variant === 'like') {
      triggerHaptic('success');
    } else if (variant === 'dislike') {
      triggerHaptic('warning');
    } else {
      triggerHaptic('light');
    }

    onClick();
  }, [disabled, variant, onClick]);

  // Compute sizes - icons scale proportionally with buttons
  const buttonSize = size === 'large' ? LARGE_SIZE : SMALL_SIZE;
  const iconSize = size === 'large' ? LARGE_ICON_SIZE : SMALL_ICON_SIZE;

  // Color configurations for each variant
  const variantConfig = useMemo(() => {
    const configs: Record<string, {
      borderColor: string;
      bgColor: string;
      hoverBg: string;
      iconColor: string;
      glowColor: string;
    }> = {
      like: {
        borderColor: 'rgba(34, 197, 94, 0.6)',
        bgColor: 'rgba(34, 197, 94, 0.12)',
        hoverBg: 'rgba(34, 197, 94, 0.25)',
        iconColor: '#22c55e',
        glowColor: 'rgba(34, 197, 94, 0.5)',
      },
      dislike: {
        borderColor: 'rgba(239, 68, 68, 0.6)',
        bgColor: 'rgba(239, 68, 68, 0.12)',
        hoverBg: 'rgba(239, 68, 68, 0.25)',
        iconColor: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.5)',
      },
      amber: {
        borderColor: 'rgba(245, 158, 11, 0.5)',
        bgColor: 'rgba(245, 158, 11, 0.08)',
        hoverBg: 'rgba(245, 158, 11, 0.2)',
        iconColor: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.4)',
      },
      cyan: {
        borderColor: 'rgba(6, 182, 212, 0.5)',
        bgColor: 'rgba(6, 182, 212, 0.08)',
        hoverBg: 'rgba(6, 182, 212, 0.2)',
        iconColor: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.4)',
      },
      purple: {
        borderColor: 'rgba(168, 85, 247, 0.5)',
        bgColor: 'rgba(168, 85, 247, 0.08)',
        hoverBg: 'rgba(168, 85, 247, 0.2)',
        iconColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.4)',
      },
      default: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        bgColor: 'rgba(255, 255, 255, 0.05)',
        hoverBg: 'rgba(255, 255, 255, 0.15)',
        iconColor: 'rgba(255, 255, 255, 0.8)',
        glowColor: 'rgba(255, 255, 255, 0.3)',
      },
    };
    return configs[variant] || configs.default;
  }, [variant]);

  // Compute glow based on press state
  const glowStyle = useMemo(() => {
    if (!isPressed) return '';
    return `0 0 20px ${variantConfig.glowColor}`;
  }, [isPressed, variantConfig.glowColor]);

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      whileTap={{ scale: TAP_SCALE }}
      transition={springConfig}
      style={{
        width: buttonSize,
        height: buttonSize,
        borderRadius: '50%',
        // No border - icons float naturally on background
        border: 'none',
        // Clean semi-transparent backdrop - minimal, modern
        backgroundColor: isPressed
          ? 'rgba(35, 35, 35, 0.65)'
          : 'rgba(25, 25, 25, 0.45)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        // Very subtle shadow for depth, no hard edges
        boxShadow: isPressed
          ? `0 4px 16px rgba(0,0,0,0.35)${glowStyle ? `, ${glowStyle}` : ''}`
          : '0 2px 8px rgba(0,0,0,0.25)',
        // GPU acceleration
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform, box-shadow',
        // Transitions
        transition: 'background-color 150ms ease-out, box-shadow 200ms ease-out',
        // Disabled state
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      className="flex items-center justify-center touch-manipulation select-none"
    >
      <span
        style={{
          width: iconSize,
          height: iconSize,
          color: variantConfig.iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 150ms ease-out',
        }}
      >
        {children}
      </span>
    </motion.button>
  );
});

ActionButton.displayName = 'ActionButton';

function SwipeActionButtonBarComponent({
  onLike,
  onDislike,
  onShare,
  onUndo,
  onMessage,
  canUndo = false,
  disabled = false,
  className = '',
}: SwipeActionButtonBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springConfig, delay: 0.05 }}
      className={`relative flex items-center justify-center ${className}`}
      style={{
        // Transparent container - no background
        padding: '10px 16px',
        // GPU acceleration
        transform: 'translateZ(0)',
        willChange: 'transform, opacity',
        // Position
        zIndex: 100,
      }}
    >
      {/* Buttons Row - fully transparent, only buttons have glass effect */}
      {/* Gap uses BUTTON_GAP constant for consistent, ergonomic spacing */}
      <div className="flex items-center" style={{ gap: BUTTON_GAP }}>
        {/* 1. Return/Undo Button (Small) - Amber */}
        <ActionButton
          onClick={onUndo || (() => {})}
          disabled={disabled || !canUndo}
          size="small"
          variant="amber"
          ariaLabel="Undo last swipe"
        >
          <RotateCcw className="w-full h-full" strokeWidth={2} />
        </ActionButton>

        {/* 2. Dislike Button (Large) - Red */}
        <ActionButton
          onClick={onDislike}
          disabled={disabled}
          size="large"
          variant="dislike"
          ariaLabel="Pass on this listing"
        >
          <X className="w-full h-full" strokeWidth={2.5} />
        </ActionButton>

        {/* 3. Share Button (Small) - Purple */}
        {onShare && (
          <ActionButton
            onClick={onShare}
            disabled={disabled}
            size="small"
            variant="purple"
            ariaLabel="Share this listing"
          >
            <Share2 className="w-full h-full" strokeWidth={2} />
          </ActionButton>
        )}

        {/* 4. Like Button (Large) - Green */}
        <ActionButton
          onClick={onLike}
          disabled={disabled}
          size="large"
          variant="like"
          ariaLabel="Like this listing"
        >
          <Heart className="w-full h-full" fill="currentColor" strokeWidth={0} />
        </ActionButton>

        {/* 5. Message Button (Small) - Cyan */}
        {onMessage && (
          <ActionButton
            onClick={onMessage}
            disabled={disabled}
            size="small"
            variant="cyan"
            ariaLabel="Message the owner"
          >
            <MessageCircle className="w-full h-full" strokeWidth={2} />
          </ActionButton>
        )}
      </div>
    </motion.div>
  );
}

export const SwipeActionButtonBar = memo(SwipeActionButtonBarComponent);
