import { motion } from 'framer-motion';

export function AppLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Ultra Realistic Bouncing Flame */}
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
          className="w-28 h-36"
          style={{ 
            filter: 'drop-shadow(0 0 25px rgba(251, 146, 60, 0.7)) drop-shadow(0 0 50px rgba(234, 88, 12, 0.5)) drop-shadow(0 0 80px rgba(220, 38, 38, 0.3))'
          }}
        >
          <defs>
            {/* Main outer flame gradient */}
            <linearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="30%" stopColor="#ea580c" />
              <stop offset="60%" stopColor="#dc2626" />
              <stop offset="85%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
            
            {/* Middle flame gradient */}
            <linearGradient id="flameMiddle" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            
            {/* Inner bright core */}
            <linearGradient id="flameCore" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="30%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            
            {/* Hot white center */}
            <linearGradient id="flameHot" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
            
            {/* Turbulence filter for organic movement */}
            <filter id="flameTurbulence" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="1" result="noise">
                <animate attributeName="seed" values="1;5;1" dur="0.5s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            
            {/* Glow filter */}
            <filter id="flameGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <g filter="url(#flameTurbulence)">
            {/* Outermost flame layer */}
            <motion.path
              d="M40 5 C40 5 15 30 15 55 C15 72 25 85 40 90 C55 85 65 72 65 55 C65 30 40 5 40 5 Z M30 60 C25 45 35 30 40 25 C45 30 55 45 50 60 C48 70 32 70 30 60 Z"
              fill="url(#flameOuter)"
              animate={{
                d: [
                  "M40 5 C40 5 15 30 15 55 C15 72 25 85 40 90 C55 85 65 72 65 55 C65 30 40 5 40 5 Z",
                  "M40 3 C40 3 12 28 12 55 C12 74 24 87 40 92 C56 87 68 74 68 55 C68 28 40 3 40 3 Z",
                  "M40 5 C40 5 15 30 15 55 C15 72 25 85 40 90 C55 85 65 72 65 55 C65 30 40 5 40 5 Z"
                ]
              }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Middle flame layer */}
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
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            />
            
            {/* Inner core flame */}
            <motion.path
              d="M40 32 C40 32 28 48 28 62 C28 70 33 74 40 75 C47 74 52 70 52 62 C52 48 40 32 40 32 Z"
              fill="url(#flameCore)"
              filter="url(#flameGlow)"
              animate={{
                d: [
                  "M40 32 C40 32 28 48 28 62 C28 70 33 74 40 75 C47 74 52 70 52 62 C52 48 40 32 40 32 Z",
                  "M40 28 C40 28 26 46 26 62 C26 72 32 76 40 77 C48 76 54 72 54 62 C54 46 40 28 40 28 Z",
                  "M40 32 C40 32 28 48 28 62 C28 70 33 74 40 75 C47 74 52 70 52 62 C52 48 40 32 40 32 Z"
                ]
              }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
            />
            
            {/* Hot white center */}
            <motion.path
              d="M40 48 C40 48 34 58 34 66 C34 70 37 72 40 72 C43 72 46 70 46 66 C46 58 40 48 40 48 Z"
              fill="url(#flameHot)"
              animate={{
                d: [
                  "M40 48 C40 48 34 58 34 66 C34 70 37 72 40 72 C43 72 46 70 46 66 C46 58 40 48 40 48 Z",
                  "M40 45 C40 45 32 56 32 66 C32 71 36 73 40 73 C44 73 48 71 48 66 C48 56 40 45 40 45 Z",
                  "M40 48 C40 48 34 58 34 66 C34 70 37 72 40 72 C43 72 46 70 46 66 C46 58 40 48 40 48 Z"
                ]
              }}
              transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
          </g>
          
          {/* Sparkle particles */}
          {[...Array(4)].map((_, i) => (
            <motion.circle
              key={i}
              r={1}
              fill="#fef3c7"
              initial={{ 
                cx: 40, 
                cy: 70,
                opacity: 0 
              }}
              animate={{
                cx: [40, 35 + Math.random() * 10, 30 + Math.random() * 20],
                cy: [70, 50, 20],
                opacity: [0, 1, 0],
                r: [1, 1.5, 0.5]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut"
              }}
            />
          ))}
        </svg>
        
        {/* Multiple glow layers */}
        <motion.div
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.15, 1]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-orange-500/30 rounded-full blur-3xl -z-10"
        />
        <motion.div
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            scale: [1.1, 1.25, 1.1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
          className="absolute inset-0 bg-red-500/20 rounded-full blur-[50px] -z-20"
        />
      </motion.div>
    </div>
  );
}
