import { MotionValue, useTransform, motion } from 'framer-motion';
import { Heart, X, Star } from 'lucide-react';

interface SwipeOverlaysProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export function SwipeOverlays({ x, y }: SwipeOverlaysProps) {
  // Calculate opacity based on drag distance
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const passOpacity = useTransform(x, [-150, 0], [1, 0]);
  const superLikeOpacity = useTransform(y, [-150, 0], [1, 0]);

  return (
    <>
      {/* Like Overlay (Right Swipe) - GREEN with Emoji */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-[2px]" />
        <motion.div 
          className="relative transform -rotate-12 flex flex-col items-center gap-3"
          style={{ scale: useTransform(likeOpacity, [0, 1], [0.8, 1]) }}
        >
          <div className="text-8xl animate-bounce">💚</div>
          <span className="text-6xl font-black text-white drop-shadow-[0_4px_20px_rgba(34,197,94,0.9)] tracking-wider">
            LIKE
          </span>
        </motion.div>
      </motion.div>

      {/* Pass Overlay (Left Swipe) - RED with Emoji */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-[2px]" />
        <motion.div 
          className="relative transform rotate-12 flex flex-col items-center gap-3"
          style={{ scale: useTransform(passOpacity, [0, 1], [0.8, 1]) }}
        >
          <div className="text-8xl animate-bounce">❌</div>
          <span className="text-6xl font-black text-white drop-shadow-[0_4px_20px_rgba(239,68,68,0.9)] tracking-wider">
            PASS
          </span>
        </motion.div>
      </motion.div>
    </>
  );
}
