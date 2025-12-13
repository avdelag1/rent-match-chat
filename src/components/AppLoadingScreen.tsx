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
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* Animated Flame */}
      <motion.div
        animate={{ 
          y: [0, -8, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
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
            {/* Outer flame gradient */}
            <linearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="30%" stopColor="#ea580c" />
              <stop offset="60%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            {/* Middle flame gradient */}
            <linearGradient id="flameMiddle" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            {/* Inner core gradient */}
            <linearGradient id="flameCore" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="40%" stopColor="#fde047" />
              <stop offset="80%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            {/* Flickering filter */}
            <filter id="flicker">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          
          {/* Outer flame with flicker */}
          <motion.path 
            d="M40 5 C40 5 18 30 18 55 C18 72 27 85 40 85 C53 85 62 72 62 55 C62 30 40 5 40 5 Z
               M40 10 C48 22 55 35 55 52 C55 65 48 75 40 78 C32 75 25 65 25 52 C25 35 32 22 40 10 Z" 
            fill="url(#flameOuter)"
            animate={{
              d: [
                "M40 5 C40 5 18 30 18 55 C18 72 27 85 40 85 C53 85 62 72 62 55 C62 30 40 5 40 5 Z",
                "M40 8 C40 8 20 32 20 55 C20 70 28 83 40 83 C52 83 60 70 60 55 C60 32 40 8 40 8 Z",
                "M40 5 C40 5 18 30 18 55 C18 72 27 85 40 85 C53 85 62 72 62 55 C62 30 40 5 40 5 Z",
              ]
            }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Middle flame layer */}
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
            transition={{
              duration: 0.35,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.05
            }}
          />
          
          {/* Inner hot core */}
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
            transition={{
              duration: 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.1
            }}
          />
          
          {/* Tiny sparks */}
          <motion.circle
            cx="32"
            cy="45"
            r="1.5"
            fill="#fef3c7"
            animate={{
              cy: [45, 30, 20],
              opacity: [1, 0.5, 0],
              scale: [1, 0.5, 0]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0
            }}
          />
          <motion.circle
            cx="48"
            cy="48"
            r="1.2"
            fill="#fde68a"
            animate={{
              cy: [48, 33, 22],
              opacity: [1, 0.5, 0],
              scale: [1, 0.5, 0]
            }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.3
            }}
          />
          <motion.circle
            cx="40"
            cy="40"
            r="1"
            fill="#ffffff"
            animate={{
              cy: [40, 25, 15],
              opacity: [1, 0.3, 0],
              scale: [1, 0.3, 0]
            }}
            transition={{
              duration: 0.7,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5
            }}
          />
        </svg>
        
        {/* Glow pulse behind flame */}
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
          className="absolute inset-0 -inset-4 bg-orange-500/25 rounded-full blur-2xl -z-10"
        />
      </motion.div>

      {/* Loading text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-white/60 text-sm font-medium tracking-wide"
      >
        Loading...
      </motion.p>

      {/* Refresh button after timeout */}
      {showRefresh && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleRefresh}
          className="mt-8 px-4 py-2 text-sm text-white/80 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Taking too long? Tap to refresh
        </motion.button>
      )}
    </div>
  );
}
