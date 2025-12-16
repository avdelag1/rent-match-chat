import { useState, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Users, Building2, Home, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { AuthDialog } from './AuthDialog';

function LegendaryLandingPage() {
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; role: 'client' | 'owner' }>({
    isOpen: false,
    role: 'client'
  });
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredButton, setHoveredButton] = useState<'client' | 'owner' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const openAuthDialog = (role: 'client' | 'owner') => {
    setAuthDialog({ isOpen: true, role });
  };

  const closeAuthDialog = () => {
    setAuthDialog({ isOpen: false, role: 'client' });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 20
      });
    }
  }, []);

  const createRipple = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newRipple = {
        id: Date.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      setRipples(prev => [...prev, newRipple]);

      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 1000);
    }
  }, []);

  // Enhanced floating fire particles
  const FireParticles = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: `${2 + Math.random() * 5}px`,
            height: `${4 + Math.random() * 10}px`,
            background: `linear-gradient(45deg, ${
              i % 4 === 0 ? '#ff6b35' :
              i % 4 === 1 ? '#f7931e' :
              i % 4 === 2 ? '#ffcc02' :
              '#ff4757'
            }, transparent)`,
            boxShadow: `0 0 ${8 + Math.random() * 16}px ${
              i % 4 === 0 ? '#ff6b35' :
              i % 4 === 1 ? '#f7931e' :
              i % 4 === 2 ? '#ffcc02' :
              '#ff4757'
            }80`,
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            bottom: '-20px',
          }}
          animate={{
            y: [0, -(window.innerHeight + 100)],
            x: [0, (Math.random() - 0.5) * 150],
            opacity: [0, 0.9, 0.7, 0],
            scale: [0.2, 1.2, 0.8, 0.1],
            rotate: [0, Math.random() * 360]
          }}
          transition={{
            duration: 10 + Math.random() * 8,
            repeat: Infinity,
            ease: "easeOut",
            delay: Math.random() * 6
          }}
        />
      ))}

      {/* Glowing orbs */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full blur-xl"
          style={{
            width: `${60 + Math.random() * 80}px`,
            height: `${60 + Math.random() * 80}px`,
            background: `radial-gradient(circle, ${
              i % 3 === 0 ? 'rgba(249,115,22,0.3)' :
              i % 3 === 1 ? 'rgba(251,146,60,0.25)' :
              'rgba(245,158,11,0.2)'
            }, transparent)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 100, 0],
            y: [0, (Math.random() - 0.5) * 100, 0],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  return (
    <motion.div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 cursor-pointer"
      onMouseMove={handleMouseMove}
      onClick={createRipple}
      animate={{
        background: `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgb(17 17 17), rgb(3 3 3), rgb(10 10 10))`
      }}
      transition={{ duration: 0.3 }}
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
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Fire Particles */}
      <FireParticles />

      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute border-2 border-orange-400/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 25,
              top: ripple.y - 25,
            }}
            initial={{ width: 50, height: 50, opacity: 0.8 }}
            animate={{
              width: 400,
              height: 400,
              opacity: 0,
              x: -175,
              y: -175
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* SVG Filter for Organic Flame Effect */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="flameGradientR" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="40%" stopColor="#ea580c" />
            <stop offset="70%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <filter id="flameDistortion" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="5" result="noise">
              <animate attributeName="baseFrequency" values="0.015;0.02;0.015" dur="4s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="flameGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-10 max-w-lg w-full">

        {/* Animated Logo Icon */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <motion.div
            className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 via-red-500 to-rose-500 rounded-[2rem] shadow-[0_0_60px_rgba(249,115,22,0.4)]"
            animate={{
              boxShadow: [
                '0 0 40px rgba(249,115,22,0.3)',
                '0 0 60px rgba(249,115,22,0.5)',
                '0 0 40px rgba(249,115,22,0.3)',
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Flame className="w-12 h-12 text-white drop-shadow-lg" />
            </motion.div>

            {/* Sparkle effects around logo */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                style={{
                  top: i === 0 ? '-8px' : i === 1 ? '50%' : i === 2 ? 'auto' : '50%',
                  bottom: i === 2 ? '-8px' : 'auto',
                  left: i === 3 ? '-8px' : i === 1 ? 'auto' : '50%',
                  right: i === 1 ? '-8px' : 'auto',
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Title with Flame H */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="font-black tracking-tight drop-shadow-2xl text-center leading-none">
            <motion.span
              className="block"
              style={{
                fontSize: 'clamp(4rem, 20vw, 8rem)',
                background: 'linear-gradient(90deg, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{
                backgroundPosition: ['200% 50%', '0% 50%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              Swipe
            </motion.span>
            <motion.span
              className="block"
              style={{
                fontSize: 'clamp(3rem, 16vw, 6rem)',
                background: 'linear-gradient(90deg, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{
                backgroundPosition: ['200% 50%', '0% 50%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              Match
            </motion.span>
          </h1>
          <motion.p
            className="text-white/80 text-lg sm:text-xl font-medium px-4 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Swipe to discover your ideal property or perfect client — rent, buy & connect
          </motion.p>
        </motion.div>

        {/* Buttons Container with Enhanced Effects */}
        <div className="space-y-4 mt-12">

          {/* I'm a Client Button */}
          <motion.button
            onClick={() => openAuthDialog('client')}
            onMouseEnter={() => setHoveredButton('client')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-full py-5 px-8 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white font-bold text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(244,63,94,0.35)] backdrop-blur-sm border border-white/20 relative overflow-hidden group"
            initial={{
              opacity: 0,
              x: -150,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
              delay: 0.5,
            }}
            whileHover={{
              scale: 1.03,
              y: -4,
              boxShadow: '0 16px 48px rgba(244,63,94,0.45)',
            }}
            whileTap={{
              scale: 0.97,
            }}
          >
            {/* Animated background gradient on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-rose-600 via-red-500 to-pink-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredButton === 'client' ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full"
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
            />

            <Home className="w-6 h-6 relative z-10" />
            <span className="relative z-10">I'm Looking for a Place</span>
            <motion.div
              className="relative z-10"
              animate={{ x: hoveredButton === 'client' ? 4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>

          {/* I'm an Owner Button */}
          <motion.button
            onClick={() => openAuthDialog('owner')}
            onMouseEnter={() => setHoveredButton('owner')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-full py-5 px-8 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white font-bold text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(249,115,22,0.35)] backdrop-blur-sm border border-white/20 relative overflow-hidden group"
            initial={{
              opacity: 0,
              x: 150,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
              delay: 0.65,
            }}
            whileHover={{
              scale: 1.03,
              y: -4,
              boxShadow: '0 16px 48px rgba(249,115,22,0.45)',
            }}
            whileTap={{
              scale: 0.97,
            }}
          >
            {/* Animated background gradient on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredButton === 'owner' ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full"
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, delay: 0.5 }}
            />

            <Building2 className="w-6 h-6 relative z-10" />
            <span className="relative z-10">I'm a Property Owner</span>
            <motion.div
              className="relative z-10"
              animate={{ x: hoveredButton === 'owner' ? 4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </div>

        {/* Bottom Info Section */}
        <motion.div
          className="pt-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          {/* Role selector hint */}
          <p className="text-white/50 text-sm">
            Choose your role to get started
          </p>

          {/* Features badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-white/70 text-xs font-medium">Smart Matching</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white/70 text-xs font-medium">Verified Users</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-white/70 text-xs font-medium">Instant Connect</span>
            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={authDialog.isOpen}
        onClose={closeAuthDialog}
        role={authDialog.role}
      />
    </motion.div>
  );
}

export default memo(LegendaryLandingPage);
