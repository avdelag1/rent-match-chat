import { MotionValue, useTransform, motion } from 'framer-motion';
import { Heart, X, Star } from 'lucide-react';

interface SwipeOverlaysProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export function SwipeOverlays({ x, y }: SwipeOverlaysProps) {
  // Calculate opacity based on drag distance - much more responsive
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  // Scale animations for emojis and text
  const likeScale = useTransform(likeOpacity, [0, 1], [0.8, 1.1]);
  const passScale = useTransform(passOpacity, [0, 1], [0.8, 1.1]);

  return (
    <>
      {/* Like Overlay (Right Swipe) - ENHANCED GREEN with Emoji */}
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
            LIKE
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
}
