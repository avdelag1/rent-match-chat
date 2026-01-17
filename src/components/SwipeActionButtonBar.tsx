/**
 * SWIPE ACTION BUTTON BAR
 *
 * Premium floating button bar for swipe cards
 * Matches modern dating apps (Tinder/Bumble/Hinge) pixel-perfect
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

// Button sizes for visual hierarchy
const LARGE_SIZE = 60;  // Primary actions (Like/Dislike)
const SMALL_SIZE = 40;  // Secondary actions (Undo/Share/Message)

// Tap animation scale
const TAP_SCALE = 0.9;

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

  // Compute sizes
  const buttonSize = size === 'large' ? LARGE_SIZE : SMALL_SIZE;
  const iconSize = size === 'large' ? 28 : 20;

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
        border: `2px solid ${variantConfig.borderColor}`,
        backgroundColor: isPressed ? variantConfig.hoverBg : variantConfig.bgColor,
        // iOS frosted glass effect
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        // Shadow and glow
        boxShadow: `
          inset 0 1px 1px rgba(255,255,255,${size === 'large' ? 0.15 : 0.1}),
          0 ${size === 'large' ? 8 : 4}px ${size === 'large' ? 24 : 12}px -${size === 'large' ? 4 : 2}px rgba(0,0,0,0.3)
          ${glowStyle ? `, ${glowStyle}` : ''}
        `,
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
        // Pill-shaped glass container
        padding: '10px 16px',
        borderRadius: 100,
        // Glass background
        background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: `
          0 8px 32px rgba(0,0,0,0.4),
          inset 0 1px 0 rgba(255,255,255,0.1),
          inset 0 -1px 0 rgba(0,0,0,0.2)
        `,
        // GPU acceleration
        transform: 'translateZ(0)',
        willChange: 'transform, opacity',
        // Position
        zIndex: 100,
      }}
    >
      {/* Buttons Row */}
      <div className="flex items-center gap-3">
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
