import { motion } from 'framer-motion';

export function AppLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Realistic Bouncing Flame */}
      <motion.div
        animate={{ 
          y: [0, -15, 0, -8, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <svg 
          viewBox="0 0 80 100" 
          className="w-24 h-32"
          style={{ 
            filter: 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.6)) drop-shadow(0 0 40px rgba(234, 88, 12, 0.4))'
          }}
        >
          <defs>
            <linearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="40%" stopColor="#ea580c" />
              <stop offset="70%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            
            <linearGradient id="flameMiddle" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            
            <linearGradient id="flameCore" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="50%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            
            <linearGradient id="flameHot" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>
          </defs>
          
          {/* Outer flame */}
          <motion.path
            d="M40 5 C40 5 15 30 15 55 C15 72 25 85 40 90 C55 85 65 72 65 55 C65 30 40 5 40 5 Z"
            fill="url(#flameOuter)"
            animate={{
              d: [
                "M40 5 C40 5 15 30 15 55 C15 72 25 85 40 90 C55 85 65 72 65 55 C65 30 40 5 40 5 Z",
                "M40 3 C40 3 12 28 12 55 C12 74 24 87 40 92 C56 87 68 74 68 55 C68 28 40 3 40 3 Z",
                "M40 5 C40 5 15 30 15 55 C15 72 25 85 40 90 C55 85 65 72 65 55 C65 30 40 5 40 5 Z"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Middle flame */}
          <motion.path
            d="M40 18 C40 18 22 38 22 58 C22 70 30 78 40 80 C50 78 58 70 58 58 C58 38 40 18 40 18 Z"
            fill="url(#flameMiddle)"
            animate={{
              d: [
                "M40 18 C40 18 22 38 22 58 C22 70 30 78 40 80 C50 78 58 70 58 58 C58 38 40 18 40 18 Z",
                "M40 15 C40 15 20 36 20 58 C20 72 29 80 40 82 C51 80 60 72 60 58 C60 36 40 15 40 15 Z",
                "M40 18 C40 18 22 38 22 58 C22 70 30 78 40 80 C50 78 58 70 58 58 C58 38 40 18 40 18 Z"
              ]
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          />
          
          {/* Inner core */}
          <motion.path
            d="M40 32 C40 32 28 48 28 62 C28 70 33 74 40 75 C47 74 52 70 52 62 C52 48 40 32 40 32 Z"
            fill="url(#flameCore)"
            animate={{
              d: [
                "M40 32 C40 32 28 48 28 62 C28 70 33 74 40 75 C47 74 52 70 52 62 C52 48 40 32 40 32 Z",
                "M40 28 C40 28 26 46 26 62 C26 72 32 76 40 77 C48 76 54 72 54 62 C54 46 40 28 40 28 Z",
                "M40 32 C40 32 28 48 28 62 C28 70 33 74 40 75 C47 74 52 70 52 62 C52 48 40 32 40 32 Z"
              ]
            }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          
          {/* Hot center */}
          <motion.path
            d="M40 48 C40 48 34 58 34 66 C34 70 37 72 40 72 C43 72 46 70 46 66 C46 58 40 48 40 48 Z"
            fill="url(#flameHot)"
            animate={{
              opacity: [0.9, 1, 0.9]
            }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
        
        {/* Glow effect */}
        <motion.div
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
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
