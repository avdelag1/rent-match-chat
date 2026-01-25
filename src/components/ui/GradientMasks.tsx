/**
 * GRADIENT MASK SYSTEM
 *
 * Two reusable gradient overlay layers that create the Tinder-style
 * visual effect where UI appears to emerge from the photo.
 *
 * CRITICAL: These gradients create contrast for floating UI elements.
 * They are NOT transparent containers - they are visual "shades"
 * that make text/buttons readable against any photo.
 *
 * Features:
 * - GPU-friendly (uses opacity + transform only)
 * - pointer-events: none (clicks pass through)
 * - Smooth fade gradients (not flat transparency)
 * - Supports both light and dark themes
 * - Works for client AND owner swipe views
 */

import { memo, CSSProperties } from 'react';

interface GradientMaskProps {
  /** Intensity of the gradient (0-1). Default 1 = full opacity */
  intensity?: number;
  /** Additional className for custom styling */
  className?: string;
  /** Z-index for layering (default 15 for top, 20 for bottom) */
  zIndex?: number;
  /** Use light theme (white gradient instead of black) */
  light?: boolean;
  /** Extend height percentage (default: 30% for top, 45% for bottom) */
  heightPercent?: number;
}

/**
 * TOP GRADIENT MASK
 *
 * Covers the top 25-30% of the screen with a gradient that:
 * - Starts solid dark at the top (behind status bar/notch)
 * - Fades smoothly to fully transparent
 * - Provides contrast for TopBar UI, rating displays, etc.
 */
export const GradientMaskTop = memo(function GradientMaskTop({
  intensity = 1,
  className = '',
  zIndex = 15,
  light = false,
  heightPercent = 32,
}: GradientMaskProps) {
  const baseColor = light ? '255,255,255' : '0,0,0';

  const style: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: `${heightPercent}%`,
    // TINDER-STYLE gradient: Stronger at top for header contrast, smooth fade
    background: `linear-gradient(
      to bottom,
      rgba(${baseColor}, ${0.75 * intensity}) 0%,
      rgba(${baseColor}, ${0.60 * intensity}) 20%,
      rgba(${baseColor}, ${0.40 * intensity}) 45%,
      rgba(${baseColor}, ${0.15 * intensity}) 70%,
      rgba(${baseColor}, 0) 100%
    )`,
    // GPU acceleration
    transform: 'translateZ(0)',
    willChange: 'opacity',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    // Click-through
    pointerEvents: 'none',
    zIndex,
    // Safe area support
    paddingTop: 'env(safe-area-inset-top, 0px)',
  };

  return <div className={className} style={style} aria-hidden="true" />;
});

/**
 * BOTTOM GRADIENT MASK
 *
 * Covers the bottom 40-50% of the screen with a gradient that:
 * - Starts transparent at top
 * - Fades to solid dark at the bottom
 * - Provides contrast for swipe buttons, card info, CTAs
 * - Taller than top mask to accommodate more UI elements
 */
export const GradientMaskBottom = memo(function GradientMaskBottom({
  intensity = 1,
  className = '',
  zIndex = 20,
  light = false,
  heightPercent = 55,
}: GradientMaskProps) {
  const baseColor = light ? '255,255,255' : '0,0,0';

  const style: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: `${heightPercent}%`,
    // TINDER-STYLE gradient: Strong at bottom for buttons/info, smooth upward fade
    background: `linear-gradient(
      to top,
      rgba(${baseColor}, ${0.90 * intensity}) 0%,
      rgba(${baseColor}, ${0.80 * intensity}) 12%,
      rgba(${baseColor}, ${0.60 * intensity}) 30%,
      rgba(${baseColor}, ${0.35 * intensity}) 50%,
      rgba(${baseColor}, ${0.12 * intensity}) 70%,
      rgba(${baseColor}, 0) 100%
    )`,
    // GPU acceleration
    transform: 'translateZ(0)',
    willChange: 'opacity',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    // Click-through
    pointerEvents: 'none',
    zIndex,
    // Safe area support
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  };

  return <div className={className} style={style} aria-hidden="true" />;
});

/**
 * FULL GRADIENT OVERLAY
 *
 * Combines both top and bottom masks for a complete "vignette" effect.
 * Use this when you want both gradients as a single component.
 */
export const GradientOverlay = memo(function GradientOverlay({
  intensity = 1,
  className = '',
  light = false,
}: Omit<GradientMaskProps, 'zIndex' | 'heightPercent'>) {
  return (
    <div className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <GradientMaskTop intensity={intensity} light={light} />
      <GradientMaskBottom intensity={intensity} light={light} />
    </div>
  );
});
