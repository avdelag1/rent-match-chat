import { useState, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Users } from 'lucide-react';
import { AuthDialog } from './AuthDialog';

function LegendaryLandingPage() {
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; role: 'client' | 'owner' }>({
    isOpen: false,
    role: 'client'
  });
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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


  return (
    <motion.div 
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 cursor-pointer"
      onMouseMove={handleMouseMove}
      onClick={createRipple}
      animate={{
        background: `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgb(17 17 17), rgb(0 0 0), rgb(23 23 23))`
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated Fire Sparks - Reduced for performance */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: `${1 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 6}px`,
              background: `linear-gradient(45deg, ${
                i % 4 === 0 ? '#ff6b35' : 
                i % 4 === 1 ? '#f7931e' : 
                i % 4 === 2 ? '#ffcc02' :
                '#ff4757'
              }, transparent)`,
              boxShadow: `0 0 ${6 + Math.random() * 12}px ${
                i % 4 === 0 ? '#ff6b35' : 
                i % 4 === 1 ? '#f7931e' : 
                i % 4 === 2 ? '#ffcc02' :
                '#ff4757'
              }80`,
              borderRadius: '50%',
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight - 100,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight + 50
              ],
              scale: [0.2, 1.2, 0.4, 1.8, 0.1],
              opacity: [0.1, 0.9, 0.3, 1, 0.2],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 8
            }}
          />
        ))}
        
        {/* Additional floating particles - Reduced for performance */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${0.5 + Math.random() * 2}px`,
              height: `${0.5 + Math.random() * 2}px`,
              background: `radial-gradient(circle, #ffa726, transparent)`,
              boxShadow: `0 0 ${3 + Math.random() * 6}px #ffa726`,
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth
              ],
              y: [
                window.innerHeight + 20,
                Math.random() * window.innerHeight,
                -20
              ],
              opacity: [0, 0.8, 0],
              scale: [0.3, 1, 0.2]
            }}
            transition={{
              duration: 25 + Math.random() * 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
          />
        ))}
      </div>

      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute border-2 border-red-400/40 rounded-full pointer-events-none"
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
      <div className="relative z-10 text-center space-y-12 max-w-md w-full">

        {/* Title with Flame H */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="font-black tracking-tight drop-shadow-2xl text-center leading-none relative">
            {/* Smoke/glow background layer for Swipe */}
            <motion.span
              className="block absolute inset-0 opacity-60 blur-[2px] pointer-events-none"
              style={{
                fontSize: 'clamp(4.5rem, 22vw, 9rem)',
                background: 'linear-gradient(90deg, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'url(#flameDistortion)',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Swipe
            </motion.span>
            {/* Main Swipe text */}
            <motion.span
              className="block relative"
              style={{
                fontSize: 'clamp(4.5rem, 22vw, 9rem)',
                background: 'linear-gradient(90deg, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'url(#flameGlow)',
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
            {/* Smoke/glow background layer for Match */}
            <motion.span
              className="block absolute opacity-60 blur-[2px] pointer-events-none"
              style={{
                fontSize: 'clamp(3.5rem, 18vw, 7rem)',
                background: 'linear-gradient(90deg, #ea580c, #f97316, #fbbf24, #ff6b35, #dc2626, #ea580c)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'url(#flameDistortion)',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
            >
              Match
            </motion.span>
            {/* Main Match text */}
            <motion.span
              className="block relative"
              style={{
                fontSize: 'clamp(3.5rem, 18vw, 7rem)',
                background: 'linear-gradient(90deg, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'url(#flameGlow)',
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
          <p className="text-white/90 text-xl font-medium px-4">
            Swipe to discover your ideal property or perfect client - rent, buy & connect
          </p>
        </motion.div>

        {/* Buttons Container with Smooth Entrance Effects */}
        <div className="space-y-5 mt-16">
          
          {/* I'm a Client Button - Slides in from LEFT with elastic bounce */}
          <motion.button
            onClick={() => openAuthDialog('client')}
            className="w-full py-5 px-8 bg-gradient-to-r from-red-500/90 to-orange-500/90 text-white font-bold text-xl rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(239,68,68,0.4)] backdrop-blur-sm border border-white/20 relative overflow-hidden group"
            initial={{
              opacity: 0,
              x: -200,
              scale: 0.8,
              rotateY: -15,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              rotateY: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 20,
              mass: 0.8,
              delay: 0.4,
            }}
            whileHover={{
              scale: 1.03,
              y: -4,
              boxShadow: '0 16px 48px rgba(239,68,68,0.5)',
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 15
              }
            }}
            whileTap={{
              scale: 0.97,
              transition: { duration: 0.1 }
            }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
            <Users className="w-6 h-6 relative z-10" />
            <span className="relative z-10">I'm a Client</span>
          </motion.button>

          {/* I'm an Owner Button - Slides in from RIGHT with elastic bounce */}
          <motion.button
            onClick={() => openAuthDialog('owner')}
            className="w-full py-5 px-8 bg-gradient-to-r from-orange-500/90 to-red-600/90 text-white font-bold text-xl rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(249,115,22,0.4)] backdrop-blur-sm border border-white/20 relative overflow-hidden group"
            initial={{
              opacity: 0,
              x: 200,
              scale: 0.8,
              rotateY: 15,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              rotateY: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 20,
              mass: 0.8,
              delay: 0.55,
            }}
            whileHover={{
              scale: 1.03,
              y: -4,
              boxShadow: '0 16px 48px rgba(249,115,22,0.5)',
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 15
              }
            }}
            whileTap={{
              scale: 0.97,
              transition: { duration: 0.1 }
            }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, delay: 0.5 }}
            />
            <Flame className="w-6 h-6 relative z-10" />
            <span className="relative z-10">I'm an Owner</span>
          </motion.button>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="text-white/70 text-base mt-10"
        >
          Choose your role to get started
        </motion.p>

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
