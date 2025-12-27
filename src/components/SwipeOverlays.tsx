import { MotionValue, useTransform, motion } from 'framer-motion';
import { memo } from 'react';

interface SwipeOverlaysProps {
  x: MotionValue<number>;
}

export const SwipeOverlays = memo(function SwipeOverlays({ x }: SwipeOverlaysProps) {
  // INSTANT visual feedback - overlays appear immediately on small movements
  // Lower threshold = faster response = game-like feel
  const likeOpacity = useTransform(x, [0, 50], [0, 1]);
  const passOpacity = useTransform(x, [-50, 0], [1, 0]);

  // Direct scale calculation - quick scale-up for punchy feel
  const likeScale = useTransform(x, [0, 50], [0.85, 1.15]);
  const passScale = useTransform(x, [-50, 0], [1.15, 0.85]);

  // Subtle rotation intensifies with swipe
  const likeRotate = useTransform(x, [0, 100], [-12, -15]);
  const passRotate = useTransform(x, [-100, 0], [15, 12]);

  return (
    <>
      {/* Like Overlay (Right Swipe) - PREMIUM GREEN with Neon Glow */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none swipe-overlay-container like-overlay"
      >
        {/* Enhanced radial gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/60 via-emerald-500/50 to-green-600/60 backdrop-blur-[6px]" />

        {/* Animated glow rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-80 h-80 rounded-full bg-green-400/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute w-64 h-64 rounded-full bg-green-500/25 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }} />
        </div>

        <motion.div
          className="relative"
          style={{ scale: likeScale, rotate: likeRotate }}
        >
          {/* Premium shiny text with animated effects */}
          <span className="text-8xl swipe-text-liked">
            LIKED
          </span>
        </motion.div>
      </motion.div>

      {/* Pass Overlay (Left Swipe) - PREMIUM RED with Neon Glow */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none swipe-overlay-container pass-overlay"
      >
        {/* Enhanced radial gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/60 via-rose-500/50 to-red-600/60 backdrop-blur-[6px]" />

        {/* Animated glow rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-80 h-80 rounded-full bg-red-400/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute w-64 h-64 rounded-full bg-red-500/25 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }} />
        </div>

        <motion.div
          className="relative"
          style={{ scale: passScale, rotate: passRotate }}
        >
          {/* Premium shiny text with animated effects */}
          <span className="text-8xl swipe-text-pass">
            PASS
          </span>
        </motion.div>
      </motion.div>
    </>
  );
});
