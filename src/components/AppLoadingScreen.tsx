import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AppLoadingScreen() {
  const [showRefresh, setShowRefresh] = useState(false);

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
      className="fixed inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col items-center justify-center z-50"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#ff6b35]/30 rounded-full blur-[80px]"
        />
      </div>

      {/* Tinder-style Flame */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: 1,
          opacity: 1,
          y: [0, -8, 0],
        }}
        transition={{
          scale: { duration: 0.4, ease: "easeOut" },
          opacity: { duration: 0.4, ease: "easeOut" },
          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
        }}
        className="relative"
        style={{ 
          filter: 'drop-shadow(0 0 30px rgba(255, 107, 53, 0.8)) drop-shadow(0 0 60px rgba(255, 69, 0, 0.5))'
        }}
      >
        <svg viewBox="0 0 64 80" className="w-20 h-24">
          <defs>
            <linearGradient id="tinderFlameMain" x1="0%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#FF6B35"/>
              <stop offset="40%" stopColor="#FF4500"/>
              <stop offset="70%" stopColor="#FF3D00"/>
              <stop offset="100%" stopColor="#E64A19"/>
            </linearGradient>
            <linearGradient id="tinderFlameInner" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FFAB40"/>
              <stop offset="60%" stopColor="#FF9100"/>
              <stop offset="100%" stopColor="#FF6D00"/>
            </linearGradient>
          </defs>
          {/* Main flame - Tinder iconic shape */}
          <motion.path 
            d="M32 2C32 2 12 24 12 48C12 62 20 74 32 74C44 74 52 62 52 48C52 40 48 32 44 26C44 26 46 34 42 42C38 50 32 46 32 38C32 30 40 22 40 22C40 22 32 28 28 36C24 44 28 52 32 52C36 52 38 48 38 44C38 38 32 32 32 32"
            fill="url(#tinderFlameMain)"
            animate={{
              d: [
                "M32 2C32 2 12 24 12 48C12 62 20 74 32 74C44 74 52 62 52 48C52 40 48 32 44 26C44 26 46 34 42 42C38 50 32 46 32 38C32 30 40 22 40 22C40 22 32 28 28 36C24 44 28 52 32 52C36 52 38 48 38 44C38 38 32 32 32 32",
                "M32 4C32 4 14 25 14 48C14 61 21 72 32 72C43 72 50 61 50 48C50 41 47 33 43 28C43 28 45 35 41 42C37 49 32 45 32 39C32 32 39 24 39 24C39 24 32 29 29 36C26 43 29 51 32 51C35 51 37 47 37 44C37 39 32 34 32 34",
                "M32 2C32 2 12 24 12 48C12 62 20 74 32 74C44 74 52 62 52 48C52 40 48 32 44 26C44 26 46 34 42 42C38 50 32 46 32 38C32 30 40 22 40 22C40 22 32 28 28 36C24 44 28 52 32 52C36 52 38 48 38 44C38 38 32 32 32 32"
              ]
            }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Inner glow */}
          <motion.ellipse 
            cx="32" 
            cy="54" 
            rx="12" 
            ry="14" 
            fill="url(#tinderFlameInner)" 
            opacity="0.8"
            animate={{
              rx: [12, 10, 12],
              ry: [14, 12, 14],
            }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* SwipeMatch text */}
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-6 text-3xl font-extrabold tracking-tight"
        style={{
          background: 'linear-gradient(90deg, #ff6b35, #ff4500, #ff6b35)',
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'gradient-shift 3s ease-in-out infinite',
        }}
      >
        SwipeMatch
      </motion.span>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-5 flex items-center gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            className="w-2 h-2 rounded-full bg-[#ff6b35]"
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

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </motion.div>
  );
}
