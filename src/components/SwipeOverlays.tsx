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

  return (
    <>
      {/* Like Overlay (Right Swipe) - GREEN LIKED */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/50 via-emerald-500/40 to-green-600/50 backdrop-blur-sm" />
        <motion.div
          className="relative transform -rotate-12"
          style={{ scale: likeScale }}
        >
          <span className="text-8xl font-black text-white drop-shadow-[0_8px_40px_rgba(34,197,94,1)] tracking-wider" style={{ textShadow: '0 0 20px rgba(34,197,94,0.8), 0 0 40px rgba(34,197,94,0.6), 0 4px 8px rgba(0,0,0,0.5)' }}>
            LIKED
          </span>
        </motion.div>
      </motion.div>

      {/* Pass Overlay (Left Swipe) - ENHANCED RED with Emoji */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/50 via-rose-500/40 to-red-600/50 backdrop-blur-sm" />
        <motion.div
          className="relative transform rotate-12"
          style={{ scale: passScale }}
        >
          <span className="text-8xl font-black text-white drop-shadow-[0_8px_40px_rgba(239,68,68,1)] tracking-wider" style={{ textShadow: '0 0 20px rgba(239,68,68,0.8), 0 0 40px rgba(239,68,68,0.6), 0 4px 8px rgba(0,0,0,0.5)' }}>
            PASS
          </span>
        </motion.div>
      </motion.div>
    </>
  );
});
