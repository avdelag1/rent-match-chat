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

        {/* Title with Flame R */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-6xl font-bold text-white tracking-wider drop-shadow-lg text-center flex items-center justify-center">
            <span>TINDE</span>
            {/* Animated Flame R - Organic slow movement */}
            <motion.span
              className="relative inline-block mx-0.5"
              style={{ filter: 'url(#flameDistortion)' }}
            >
              {/* Outer flame aura - slow organic movement */}
              <motion.span
                className="absolute -inset-3 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center bottom, rgba(251, 146, 60, 0.6) 0%, rgba(234, 88, 12, 0.4) 30%, rgba(220, 38, 38, 0.2) 60%, transparent 80%)',
                  filter: 'blur(12px)',
                }}
                animate={{
                  scale: [1, 1.15, 1.05, 1.2, 1],
                  opacity: [0.5, 0.7, 0.55, 0.65, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Inner flame glow - subtle pulse */}
              <motion.span
                className="absolute -inset-1 rounded pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(249, 115, 22, 0.8), rgba(220, 38, 38, 0.5), transparent)',
                  filter: 'blur(6px)',
                }}
                animate={{
                  opacity: [0.6, 0.9, 0.7, 0.85, 0.6],
                  y: [0, -2, 1, -1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Main R with gradient - slow breathing glow */}
              <motion.span
                className="relative"
                style={{
                  background: 'linear-gradient(to top, #f97316 0%, #ea580c 25%, #dc2626 50%, #fb923c 75%, #fbbf24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'url(#flameGlow)',
                }}
                animate={{
                  filter: [
                    'drop-shadow(0 0 8px rgba(251, 146, 60, 0.7)) drop-shadow(0 -4px 12px rgba(220, 38, 38, 0.5))',
                    'drop-shadow(0 0 14px rgba(251, 146, 60, 0.9)) drop-shadow(0 -6px 18px rgba(220, 38, 38, 0.7))',
                    'drop-shadow(0 0 10px rgba(234, 88, 12, 0.8)) drop-shadow(0 -5px 15px rgba(251, 191, 36, 0.6))',
                    'drop-shadow(0 0 12px rgba(251, 146, 60, 0.85)) drop-shadow(0 -4px 14px rgba(220, 38, 38, 0.6))',
                    'drop-shadow(0 0 8px rgba(251, 146, 60, 0.7)) drop-shadow(0 -4px 12px rgba(220, 38, 38, 0.5))',
                  ],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                R
              </motion.span>
            </motion.span>
            <span>ENT</span>
          </h1>
          <p className="text-white/90 text-xl font-medium px-4">
            Swipe to discover your ideal property or perfect client - rent, buy & connect
          </p>
        </motion.div>

        {/* Buttons Container with Smooth Entrance Effects */}
        <div className="space-y-6 mt-16">
          
          {/* I'm a Client Button - Slides in from LEFT with elastic bounce */}
          <motion.button
            onClick={() => openAuthDialog('client')}
            className="w-full py-6 px-8 bg-gradient-to-r from-red-400 to-red-500 text-white font-semibold text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            initial={{
              opacity: 0,
              x: -300,
              scale: 0.8
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1
            }}
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 18,
              mass: 0.8,
              delay: 0.7,
              bounce: 0.5
            }}
            whileHover={{
              scale: 1.03,
              y: -3,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }}
            whileTap={{
              scale: 0.97,
              transition: { duration: 0.1 }
            }}
          >
            <Users className="w-6 h-6" />
            <span>I'm a Client</span>
          </motion.button>

          {/* I'm an Owner Button - Slides in from RIGHT with elastic bounce */}
          <motion.button
            onClick={() => openAuthDialog('owner')}
            className="w-full py-6 px-8 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            initial={{
              opacity: 0,
              x: 300,
              scale: 0.8
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1
            }}
            transition={{
              type: "spring",
              stiffness: 140,
              damping: 18,
              mass: 0.8,
              delay: 0.9,
              bounce: 0.5
            }}
            whileHover={{
              scale: 1.03,
              y: -3,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }}
            whileTap={{
              scale: 0.97,
              transition: { duration: 0.1 }
            }}
          >
            <Flame className="w-6 h-6" />
            <span>I'm an Owner</span>
          </motion.button>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-white/90 text-lg mt-12"
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
