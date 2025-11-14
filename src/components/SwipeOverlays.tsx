import { MotionValue, useTransform, motion } from 'framer-motion';
import { Heart, ThumbsDown } from 'lucide-react';

interface SwipeOverlaysProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export function SwipeOverlays({ x, y }: SwipeOverlaysProps) {
  // Calculate opacity based on drag distance - more responsive
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const passOpacity = useTransform(x, [-150, 0], [1, 0]);

  // Scale animations for icons
  const likeScale = useTransform(likeOpacity, [0, 1], [0.8, 1.2]);
  const passScale = useTransform(passOpacity, [0, 1], [0.8, 1.2]);

  return (
    <>
      {/* Like Overlay (Right Swipe) - GREEN with Heart Icon */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-sm" />
        <motion.div
          className="relative transform -rotate-12"
          style={{ scale: likeScale }}
        >
          <Heart className="w-32 h-32 text-green-500 fill-green-500 drop-shadow-lg" />
        </motion.div>
      </motion.div>

      {/* Pass Overlay (Left Swipe) - RED with Thumbs Down Icon */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/10 backdrop-blur-sm" />
        <motion.div
          className="relative transform rotate-12"
          style={{ scale: passScale }}
        >
          <ThumbsDown className="w-32 h-32 text-red-500 fill-red-500 drop-shadow-lg" />
        </motion.div>
      </motion.div>
    </>
  );
}
