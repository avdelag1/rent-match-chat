import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

// Generate random embers/particles
const generateEmbers = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 60 - 30,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random() * 1.5,
    size: 2 + Math.random() * 4,
    opacity: 0.6 + Math.random() * 0.4,
  }));
};

export function AppLoadingScreen() {
  const [showRefresh, setShowRefresh] = useState(false);
  const embers = useMemo(() => generateEmbers(12), []);

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
      className="fixed inset-0 bg-gradient-to-br from-[#050505] via-[#0d0d0d] to-[#050505] flex flex-col items-center justify-center z-50 overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/40 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-64 h-64 bg-yellow-500/30 rounded-full blur-[80px]"
        />
      </div>

      {/* Main Fire Container */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-40 h-52 flex items-end justify-center"
      >
        {/* Rising Embers/Sparks */}
        {embers.map((ember) => (
          <motion.div
            key={ember.id}
            className="absolute rounded-full"
            style={{
              width: ember.size,
              height: ember.size,
              left: `calc(50% + ${ember.x}px)`,
              bottom: '40%',
              background: `radial-gradient(circle, #ffdd00 0%, #ff6600 50%, transparent 100%)`,
              boxShadow: `0 0 ${ember.size * 2}px #ff6600, 0 0 ${ember.size}px #ffaa00`,
            }}
            animate={{
              y: [-20, -150 - Math.random() * 50],
              x: [0, (Math.random() - 0.5) * 40],
              opacity: [0, ember.opacity, ember.opacity, 0],
              scale: [0.5, 1, 0.8, 0],
            }}
            transition={{
              duration: ember.duration,
              repeat: Infinity,
              delay: ember.delay,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Flame Glow Base */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1.05, 1.1, 1],
            opacity: [0.8, 1, 0.9, 1, 0.8],
          }}
          transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 w-24 h-32 rounded-full blur-xl"
          style={{
            background: 'radial-gradient(ellipse at bottom, #ff6600 0%, #ff4400 30%, transparent 70%)',
          }}
        />

        {/* SVG Flame Layers */}
        <svg
          viewBox="0 0 100 140"
          className="w-32 h-44 relative z-10"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(255,100,0,0.8)) drop-shadow(0 0 40px rgba(255,60,0,0.6)) drop-shadow(0 0 60px rgba(255,30,0,0.4))',
          }}
        >
          <defs>
            {/* Outer flame gradient - red/orange */}
            <linearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ff2200" stopOpacity="1"/>
              <stop offset="30%" stopColor="#ff4400" stopOpacity="1"/>
              <stop offset="60%" stopColor="#ff6600" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#ff3300" stopOpacity="0"/>
            </linearGradient>

            {/* Middle flame gradient - orange */}
            <linearGradient id="flameMiddle" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ff6600" stopOpacity="1"/>
              <stop offset="40%" stopColor="#ff8800" stopOpacity="1"/>
              <stop offset="70%" stopColor="#ffaa00" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#ff8800" stopOpacity="0"/>
            </linearGradient>

            {/* Inner flame gradient - yellow/white core */}
            <linearGradient id="flameInner" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffdd00" stopOpacity="1"/>
              <stop offset="30%" stopColor="#ffee66" stopOpacity="1"/>
              <stop offset="60%" stopColor="#ffffaa" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
            </linearGradient>

            {/* Core hottest part */}
            <linearGradient id="flameCore" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
              <stop offset="50%" stopColor="#ffffcc" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#ffff99" stopOpacity="0"/>
            </linearGradient>

            {/* Turbulence filter for organic movement */}
            <filter id="flameTurbulence" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
            </filter>

            {/* Glow filter */}
            <filter id="flameGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Outermost flame layer - creates 3D depth */}
          <motion.path
            d="M50 130
               C20 130 5 100 15 70
               C20 55 25 45 30 35
               C35 25 40 15 50 5
               C55 12 60 20 65 30
               C72 45 80 55 85 75
               C95 105 75 130 50 130Z"
            fill="url(#flameOuter)"
            filter="url(#flameGlow)"
            animate={{
              d: [
                "M50 130 C20 130 5 100 15 70 C20 55 25 45 30 35 C35 25 40 15 50 5 C55 12 60 20 65 30 C72 45 80 55 85 75 C95 105 75 130 50 130Z",
                "M50 130 C22 130 8 98 18 68 C24 52 28 42 33 32 C38 22 43 12 50 3 C58 14 62 22 68 34 C75 48 82 58 87 78 C94 108 73 130 50 130Z",
                "M50 130 C18 130 3 102 12 72 C18 56 22 46 28 36 C33 26 38 16 50 6 C56 14 62 24 67 32 C74 44 80 54 84 74 C92 104 76 130 50 130Z",
                "M50 130 C20 130 5 100 15 70 C20 55 25 45 30 35 C35 25 40 15 50 5 C55 12 60 20 65 30 C72 45 80 55 85 75 C95 105 75 130 50 130Z",
              ],
            }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Secondary outer layer - offset for 3D effect */}
          <motion.path
            d="M50 128
               C25 128 12 100 20 72
               C26 56 30 46 35 36
               C40 26 45 16 50 8
               C55 16 60 26 65 36
               C70 46 74 56 80 72
               C88 100 75 128 50 128Z"
            fill="url(#flameOuter)"
            opacity="0.7"
            animate={{
              d: [
                "M50 128 C25 128 12 100 20 72 C26 56 30 46 35 36 C40 26 45 16 50 8 C55 16 60 26 65 36 C70 46 74 56 80 72 C88 100 75 128 50 128Z",
                "M50 128 C27 128 14 98 22 70 C28 54 33 44 38 34 C42 24 46 14 50 6 C56 18 61 28 66 38 C72 48 76 58 81 74 C90 102 73 128 50 128Z",
                "M50 128 C23 128 10 102 18 74 C24 58 28 48 33 38 C38 28 44 18 50 10 C54 16 59 24 64 34 C69 44 72 54 78 70 C86 98 77 128 50 128Z",
                "M50 128 C25 128 12 100 20 72 C26 56 30 46 35 36 C40 26 45 16 50 8 C55 16 60 26 65 36 C70 46 74 56 80 72 C88 100 75 128 50 128Z",
              ],
            }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.05 }}
          />

          {/* Middle flame layer */}
          <motion.path
            d="M50 125
               C30 125 18 100 25 75
               C30 60 34 50 38 40
               C42 30 46 20 50 12
               C54 20 58 30 62 40
               C66 50 70 60 75 75
               C82 100 70 125 50 125Z"
            fill="url(#flameMiddle)"
            animate={{
              d: [
                "M50 125 C30 125 18 100 25 75 C30 60 34 50 38 40 C42 30 46 20 50 12 C54 20 58 30 62 40 C66 50 70 60 75 75 C82 100 70 125 50 125Z",
                "M50 125 C32 125 20 98 27 73 C32 58 37 48 40 38 C44 28 48 18 50 10 C53 20 57 32 61 42 C66 52 71 62 76 77 C84 102 68 125 50 125Z",
                "M50 125 C28 125 16 102 23 77 C28 62 32 52 36 42 C40 32 45 22 50 14 C55 22 60 32 63 42 C67 52 72 62 74 77 C80 102 72 125 50 125Z",
                "M50 125 C30 125 18 100 25 75 C30 60 34 50 38 40 C42 30 46 20 50 12 C54 20 58 30 62 40 C66 50 70 60 75 75 C82 100 70 125 50 125Z",
              ],
            }}
            transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Inner bright layer */}
          <motion.path
            d="M50 120
               C35 120 26 98 32 78
               C36 65 40 55 44 45
               C47 35 49 25 50 18
               C51 25 53 35 56 45
               C60 55 64 65 68 78
               C74 98 65 120 50 120Z"
            fill="url(#flameInner)"
            animate={{
              d: [
                "M50 120 C35 120 26 98 32 78 C36 65 40 55 44 45 C47 35 49 25 50 18 C51 25 53 35 56 45 C60 55 64 65 68 78 C74 98 65 120 50 120Z",
                "M50 120 C37 120 28 96 34 76 C38 63 42 53 45 43 C48 33 50 23 50 16 C52 27 54 37 57 47 C61 57 66 67 69 80 C76 100 63 120 50 120Z",
                "M50 120 C33 120 24 100 30 80 C34 67 38 57 42 47 C46 37 48 27 50 20 C50 25 52 33 55 43 C58 53 62 63 66 76 C72 96 67 120 50 120Z",
                "M50 120 C35 120 26 98 32 78 C36 65 40 55 44 45 C47 35 49 25 50 18 C51 25 53 35 56 45 C60 55 64 65 68 78 C74 98 65 120 50 120Z",
              ],
            }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Hot core - white/yellow center */}
          <motion.path
            d="M50 115
               C40 115 34 100 38 85
               C41 75 44 65 47 55
               C49 45 50 35 50 30
               C50 35 51 45 53 55
               C56 65 59 75 62 85
               C66 100 60 115 50 115Z"
            fill="url(#flameCore)"
            animate={{
              d: [
                "M50 115 C40 115 34 100 38 85 C41 75 44 65 47 55 C49 45 50 35 50 30 C50 35 51 45 53 55 C56 65 59 75 62 85 C66 100 60 115 50 115Z",
                "M50 115 C42 115 36 98 40 83 C43 73 46 63 48 53 C50 43 50 33 50 28 C51 37 52 47 54 57 C57 67 60 77 63 87 C68 102 58 115 50 115Z",
                "M50 115 C38 115 32 102 36 87 C39 77 42 67 46 57 C48 47 49 37 50 32 C50 37 51 47 52 55 C55 65 58 75 61 83 C64 98 62 115 50 115Z",
                "M50 115 C40 115 34 100 38 85 C41 75 44 65 47 55 C49 45 50 35 50 30 C50 35 51 45 53 55 C56 65 59 75 62 85 C66 100 60 115 50 115Z",
              ],
            }}
            transition={{ duration: 0.25, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Flickering tongue flames - left */}
          <motion.path
            d="M35 70 C30 65 28 55 32 45 C34 40 36 35 38 42 C40 50 38 60 35 70Z"
            fill="url(#flameMiddle)"
            opacity="0.8"
            animate={{
              d: [
                "M35 70 C30 65 28 55 32 45 C34 40 36 35 38 42 C40 50 38 60 35 70Z",
                "M33 68 C27 62 24 52 28 42 C30 36 33 30 36 40 C40 52 37 62 33 68Z",
                "M36 72 C32 68 30 58 34 48 C36 42 38 38 40 45 C42 53 40 63 36 72Z",
                "M35 70 C30 65 28 55 32 45 C34 40 36 35 38 42 C40 50 38 60 35 70Z",
              ],
              opacity: [0.8, 0.5, 0.9, 0.8],
            }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Flickering tongue flames - right */}
          <motion.path
            d="M65 70 C70 65 72 55 68 45 C66 40 64 35 62 42 C60 50 62 60 65 70Z"
            fill="url(#flameMiddle)"
            opacity="0.8"
            animate={{
              d: [
                "M65 70 C70 65 72 55 68 45 C66 40 64 35 62 42 C60 50 62 60 65 70Z",
                "M67 68 C73 62 76 52 72 42 C70 36 67 30 64 40 C60 52 63 62 67 68Z",
                "M64 72 C68 68 70 58 66 48 C64 42 62 38 60 45 C58 53 60 63 64 72Z",
                "M65 70 C70 65 72 55 68 45 C66 40 64 35 62 42 C60 50 62 60 65 70Z",
              ],
              opacity: [0.8, 0.9, 0.5, 0.8],
            }}
            transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          />
        </svg>

        {/* Base glow underneath flame */}
        <motion.div
          animate={{
            scaleX: [1, 1.2, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-2 w-20 h-6 rounded-full blur-md"
          style={{
            background: 'radial-gradient(ellipse, #ff6600 0%, #ff4400 40%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* SwipeMatch text with fire glow */}
      <motion.span
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 text-4xl font-black tracking-tight"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #ffdd88 30%, #ff8844 70%, #ff4400 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 20px rgba(255,100,0,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
        }}
      >
        SwipeMatch
      </motion.span>

      {/* Animated loading text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex items-center gap-1.5"
      >
        <span className="text-sm text-orange-300/70 font-medium tracking-wide">Loading</span>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{
              opacity: [0.3, 1, 0.3],
              y: [0, -3, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            className="text-orange-400 text-lg font-bold"
          >
            •
          </motion.span>
        ))}
      </motion.div>

      {/* Refresh button */}
      {showRefresh && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,100,0,0.2)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="mt-10 px-6 py-3 text-sm text-orange-200/90 bg-orange-500/10 hover:bg-orange-500/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-orange-500/20"
        >
          Taking too long? Tap to refresh
        </motion.button>
      )}
    </motion.div>
  );
}
