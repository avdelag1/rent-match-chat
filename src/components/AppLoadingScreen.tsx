import { motion } from 'framer-motion';

export function AppLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Bouncing Realistic Flame */}
      <motion.div
        animate={{ 
          y: [0, -12, 0, -6, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <svg 
          viewBox="0 0 64 64" 
          className="w-24 h-24"
          style={{ 
            filter: 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.6)) drop-shadow(0 0 40px rgba(234, 88, 12, 0.4))'
          }}
        >
          <defs>
            <linearGradient id="flameGradientMain" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="40%" stopColor="#ea580c" />
              <stop offset="70%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <linearGradient id="flameGradientInner" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="flameGradientCore" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="50%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          {/* Outer flame */}
          <path 
            d="M32 4C32 4 16 20 16 36C16 44.8366 23.1634 52 32 52C40.8366 52 48 44.8366 48 36C48 20 32 4 32 4Z" 
            fill="url(#flameGradientMain)"
          />
          {/* Middle flame */}
          <path 
            d="M32 14C32 14 22 26 22 38C22 43.5228 26.4772 48 32 48C37.5228 48 42 43.5228 42 38C42 26 32 14 32 14Z" 
            fill="url(#flameGradientInner)"
          />
          {/* Inner core */}
          <path 
            d="M32 24C32 24 27 32 27 40C27 42.7614 29.2386 45 32 45C34.7614 45 37 42.7614 37 40C37 32 32 24 32 24Z" 
            fill="url(#flameGradientCore)"
          />
        </svg>
        
        {/* Animated glow pulse */}
        <motion.div
          animate={{ 
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl -z-10"
        />
      </motion.div>
    </div>
  );
}