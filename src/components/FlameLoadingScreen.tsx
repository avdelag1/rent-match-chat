import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export function FlameLoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        animate={{
          y: [0, -8, 0, -5, 0],
          rotate: [0, 2, -1, 1, 0],
          scaleY: [1, 1.05, 0.98, 1.02, 1],
          scaleX: [1, 0.98, 1.02, 0.99, 1],
          filter: [
            "drop-shadow(0 0 20px rgba(251, 146, 60, 0.6))",
            "drop-shadow(0 0 30px rgba(251, 146, 60, 0.8))",
            "drop-shadow(0 0 20px rgba(251, 146, 60, 0.6))"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Flame
          className="w-24 h-24 text-transparent"
          fill="url(#flameGradientLoading)"
          strokeWidth={0}
        />
      </motion.div>

      {/* SVG Gradient Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="flameGradientLoading" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
