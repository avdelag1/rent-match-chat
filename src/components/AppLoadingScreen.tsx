import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AppLoadingScreen() {
  const [showRefresh, setShowRefresh] = useState(false);

  // Show refresh option after 8 seconds if still loading
  useEffect(() => {
    const timer = setTimeout(() => setShowRefresh(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-black via-gray-950 to-black flex flex-col items-center justify-center z-50"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Animated Flame - Clean version without sparks */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1,
          opacity: 1,
          y: [0, -8, 0],
        }}
        transition={{
          scale: { duration: 0.5, ease: "easeOut" },
          opacity: { duration: 0.5, ease: "easeOut" },
          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
        }}
        className="relative"
      >
        <svg 
          viewBox="0 0 80 100" 
          className="w-20 h-24"
          style={{ 
            filter: 'drop-shadow(0 0 25px rgba(251, 146, 60, 0.7)) drop-shadow(0 0 50px rgba(234, 88, 12, 0.5))'
          }}
        >
          <defs>
            <linearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="30%" stopColor="#ea580c" />
              <stop offset="60%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="flameMiddle" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="flameCore" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="40%" stopColor="#fde047" />
              <stop offset="80%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          
          {/* Outer flame */}
          <motion.path 
            d="M40 5 C40 5 18 30 18 55 C18 72 27 85 40 85 C53 85 62 72 62 55 C62 30 40 5 40 5 Z"
            fill="url(#flameOuter)"
            animate={{
              d: [
                "M40 5 C40 5 18 30 18 55 C18 72 27 85 40 85 C53 85 62 72 62 55 C62 30 40 5 40 5 Z",
                "M40 8 C40 8 20 32 20 55 C20 70 28 83 40 83 C52 83 60 70 60 55 C60 32 40 8 40 8 Z",
                "M40 5 C40 5 18 30 18 55 C18 72 27 85 40 85 C53 85 62 72 62 55 C62 30 40 5 40 5 Z",
              ]
            }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Middle flame */}
          <motion.path 
            d="M40 18 C40 18 26 38 26 56 C26 68 32 76 40 76 C48 76 54 68 54 56 C54 38 40 18 40 18 Z"
            fill="url(#flameMiddle)"
            animate={{
              d: [
                "M40 18 C40 18 26 38 26 56 C26 68 32 76 40 76 C48 76 54 68 54 56 C54 38 40 18 40 18 Z",
                "M40 20 C40 20 28 40 28 57 C28 67 33 74 40 74 C47 74 52 67 52 57 C52 40 40 20 40 20 Z",
                "M40 18 C40 18 26 38 26 56 C26 68 32 76 40 76 C48 76 54 68 54 56 C54 38 40 18 40 18 Z",
              ]
            }}
            transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut", delay: 0.05 }}
          />
          
          {/* Inner core */}
          <motion.path 
            d="M40 32 C40 32 33 45 33 58 C33 65 36 70 40 70 C44 70 47 65 47 58 C47 45 40 32 40 32 Z"
            fill="url(#flameCore)"
            animate={{
              d: [
                "M40 32 C40 32 33 45 33 58 C33 65 36 70 40 70 C44 70 47 65 47 58 C47 45 40 32 40 32 Z",
                "M40 35 C40 35 34 47 34 58 C34 64 37 68 40 68 C43 68 46 64 46 58 C46 47 40 35 40 35 Z",
                "M40 32 C40 32 33 45 33 58 C33 65 36 70 40 70 C44 70 47 65 47 58 C47 45 40 32 40 32 Z",
              ]
            }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          />
        </svg>
        
        {/* Glow pulse */}
        <motion.div
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 -inset-6 bg-orange-500/20 rounded-full blur-2xl -z-10"
        />
      </motion.div>

      {/* SwipeMatch text with visible smoke/flame effect */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-6 flex items-center gap-1 relative"
      >
        {/* SVG filters for smoke and glow effects */}
        <svg className="absolute w-0 h-0">
          <defs>
            {/* Smoke/fluid distortion filter */}
            <filter id="smoke-text" x="-50%" y="-50%" width="200%" height="200%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.02"
                numOctaves="3"
                result="noise"
                seed="5"
              >
                <animate
                  attributeName="baseFrequency"
                  values="0.02;0.025;0.02"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            {/* Glow effect filter */}
            <filter id="text-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        <div className="relative">
          {/* Smoke/distortion background layer */}
          <motion.span
            className="absolute inset-0 text-2xl font-black tracking-tight opacity-50 blur-[1.5px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, #f97316, #fbbf24, #ea580c, #dc2626, #f97316)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'url(#smoke-text)',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            Swipe
          </motion.span>

          {/* Main text with glow */}
          <motion.span
            className="relative text-2xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #f97316, #ea580c, #fbbf24, #f97316)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'url(#text-glow)',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%'],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            Swipe
          </motion.span>
        </div>

        <div className="relative">
          {/* Smoke/distortion background layer */}
          <motion.span
            className="absolute inset-0 text-2xl font-black tracking-tight opacity-50 blur-[1.5px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, #ea580c, #f97316, #fbbf24, #dc2626, #ea580c)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'url(#smoke-text)',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          >
            Match
          </motion.span>

          {/* Main text with glow */}
          <motion.span
            className="relative text-2xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #ea580c, #f97316, #fbbf24, #ea580c)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'url(#text-glow)',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%'],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 0.3 }}
          >
            Match
          </motion.span>
        </div>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            className="w-2 h-2 rounded-full bg-orange-500"
          />
        ))}
      </motion.div>

      {/* Refresh button */}
      {showRefresh && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="mt-10 px-5 py-2.5 text-sm text-white/80 bg-white/10 hover:bg-white/15 rounded-xl transition-colors backdrop-blur-sm border border-white/10"
        >
          Taking too long? Tap to refresh
        </motion.button>
      )}
    </motion.div>
  );
}
