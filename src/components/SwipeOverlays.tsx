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
      {/* Like Overlay (Right Swipe) - GREEN */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-[2px]" />
        <div className="relative transform -rotate-12 flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.6)]">
            <Heart className="w-12 h-12 text-white fill-white" />
          </div>
          <span className="text-5xl font-black text-green-500 drop-shadow-[0_4px_12px_rgba(34,197,94,0.8)]">
            LIKE
          </span>
        </div>
      </motion.div>

      {/* Pass Overlay (Left Swipe) - RED */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-[2px]" />
        <div className="relative transform rotate-12 flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.6)]">
            <X className="w-12 h-12 text-white stroke-[3]" />
          </div>
          <span className="text-5xl font-black text-red-500 drop-shadow-[0_4px_12px_rgba(239,68,68,0.8)]">
            PASS
          </span>
        </div>
      </motion.div>

      {/* Super Like Overlay (Up Swipe) - BLUE */}
      <motion.div
        style={{ opacity: superLikeOpacity }}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-[2px]" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.8)] animate-pulse">
            <Star className="w-14 h-14 text-white fill-white" />
          </div>
          <span className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text drop-shadow-[0_4px_20px_rgba(59,130,246,0.8)]">
            PRIORITY
          </span>
          {/* Particle effect simulation */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full"
                style={{
                  rotate: i * 45,
                  x: 0,
                  y: 0
                }}
                animate={{
                  x: Math.cos((i * 45 * Math.PI) / 180) * 60,
                  y: Math.sin((i * 45 * Math.PI) / 180) * 60,
                  scale: [1, 0],
                  opacity: [1, 0]
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: 0.4
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
