import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

export function AppLoadingScreen() {
  const [showRefresh, setShowRefresh] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowRefresh(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Animated fire particles (reduced count for better performance)
  const FireParticles = () => {
    const particles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: 2 + (i % 3) * 1.5,
      delay: i * 0.4,
      duration: 2 + (i % 3) * 0.5,
      x: (i % 5 - 2) * 40,
    }));

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{
        willChange: 'transform',
        contain: 'layout style paint'
      }}>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute left-1/2 bottom-0"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `radial-gradient(circle, #ff6b35, #f97316, transparent)`,
              borderRadius: '50%',
              boxShadow: `0 0 ${particle.size * 2}px #ff6b35`,
              willChange: 'transform, opacity',
            }}
            animate={{
              y: [-400, -100],
              x: [0, particle.x, particle.x * 0.5],
              opacity: [0, 0.8, 0.5, 0],
              scale: [0.5, 1, 0.8, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeOut",
              delay: particle.delay,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{
        willChange: 'opacity',
        contain: 'layout style paint'
      }}
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 20% 30%, rgba(249, 115, 22, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)',
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Fire Particles */}
      <FireParticles />

      {/* Brand Name - 3D Game-Style Logo */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="relative z-10 mb-16"
      >
        {/* Glow effect behind the logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="w-64 h-16 rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 180, 0, 0.5) 0%, rgba(255, 140, 0, 0.3) 40%, transparent 70%)',
              filter: 'blur(20px)',
            }}
            animate={{
              opacity: [0.6, 0.9, 0.6],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        <h1 className="text-center leading-none relative">
          <span
            className="swipess-logo-simple block"
            style={{
              fontSize: 'clamp(3.5rem, 14vw, 5.5rem)',
            }}
          >
            Swipess
          </span>
        </h1>
      </motion.div>

      {/* Enhanced spinner with fire theme */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        {/* Fire-themed spinner */}
        <div className="relative w-20 h-20">
          {/* Outer glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(249, 115, 22, 0.2), transparent)',
              filter: 'blur(10px)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Rotating fire icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Flame className="w-10 h-10 text-orange-500" />
          </motion.div>

          {/* Inner spinning ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: '#f97316',
              borderRightColor: '#ff6b35',
            }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Outer spinning ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: '#fbbf24',
              borderLeftColor: '#dc2626',
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Animated loading text */}
        <motion.span
          className="text-base font-medium bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Loading your experience...
        </motion.span>
      </motion.div>

      {/* Enhanced refresh button */}
      {showRefresh && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="relative z-10 mt-16 px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg transition-all"
        >
          Taking too long? Tap to refresh
        </motion.button>
      )}
    </motion.div>
  );
}
