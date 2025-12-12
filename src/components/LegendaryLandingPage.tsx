import { useState, useRef, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Users } from 'lucide-react';
import { AuthDialog } from './AuthDialog';

// Pre-computed spark configurations to avoid Math.random() in render
const SPARK_CONFIGS = [
  { width: 2, height: 4, color: '#ff6b35', delay: 0, duration: 18 },
  { width: 3, height: 6, color: '#f7931e', delay: 2, duration: 20 },
  { width: 2, height: 5, color: '#ffcc02', delay: 4, duration: 16 },
  { width: 4, height: 7, color: '#ff4757', delay: 1, duration: 22 },
];

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
    <div 
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black cursor-pointer"
      onMouseMove={handleMouseMove}
      onClick={createRipple}
    >
      {/* Simplified animated sparks - no Math.random() in render */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {SPARK_CONFIGS.map((config, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: config.width,
              height: config.height,
              background: `linear-gradient(45deg, ${config.color}, transparent)`,
              boxShadow: `0 0 10px ${config.color}80`,
              left: `${20 + i * 20}%`,
              top: '100%',
            }}
            animate={{
              y: [0, -800, -1600],
              x: [0, (i % 2 === 0 ? 50 : -50), 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2, 0.3],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              ease: "easeOut",
              delay: config.delay
            }}
          />
        ))}
      </div>

      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute border-2 border-orange-400/40 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 25,
              top: ripple.y - 25,
            }}
            initial={{ width: 50, height: 50, opacity: 0.8 }}
            animate={{ 
              width: 300, 
              height: 300, 
              opacity: 0,
              x: -125,
              y: -125
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* SVG Filters */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="flameGradientR" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="40%" stopColor="#ea580c" />
            <stop offset="70%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <filter id="sFlameGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
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
          <h1 className="text-7xl md:text-8xl font-bold tracking-wider drop-shadow-lg text-center flex items-center justify-center">
            {/* Fire S Letter */}
            <span
              className="relative inline-block mr-[-0.05em]"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.8)) drop-shadow(0 0 20px rgba(234, 88, 12, 0.6))'
              }}
            >
              <svg viewBox="0 0 60 90" className="w-[0.7em] h-[1.1em] inline-block align-baseline" style={{ marginBottom: '-0.05em' }}>
                <defs>
                  <linearGradient id="fireSGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="30%" stopColor="#f97316" />
                    <stop offset="60%" stopColor="#ea580c" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                  <linearGradient id="fireSCore" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#fef3c7" />
                    <stop offset="50%" stopColor="#fde047" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                  <filter id="sFlameGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* S letter shape made of fire */}
                <motion.path
                  d="M45 18 C45 8 35 5 28 5 C18 5 10 12 10 22 C10 32 18 36 28 40 C38 44 45 48 45 58 C45 72 35 80 25 80 C15 80 8 72 8 62"
                  fill="none"
                  stroke="url(#fireSGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  filter="url(#sFlameGlow)"
                  animate={{ strokeWidth: [12, 14, 12] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Inner bright core of S */}
                <motion.path
                  d="M45 18 C45 8 35 5 28 5 C18 5 10 12 10 22 C10 32 18 36 28 40 C38 44 45 48 45 58 C45 72 35 80 25 80 C15 80 8 72 8 62"
                  fill="none"
                  stroke="url(#fireSCore)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  animate={{ strokeWidth: [5, 7, 5], opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>
              {/* Flame particles around S */}
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: '4px',
                    height: '6px',
                    background: 'linear-gradient(to top, #fbbf24, #f97316)',
                    left: `${20 + i * 25}%`,
                    bottom: '10%',
                  }}
                  animate={{ y: [0, -20, -40], opacity: [0, 1, 0], scale: [0.5, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
                />
              ))}
            </span>
            {/* Rest of title with animated gradient */}
            <motion.span
              className="inline-block"
              style={{
                background: 'linear-gradient(90deg, #f97316 0%, #fbbf24 20%, #fff 40%, #fbbf24 60%, #f97316 80%, #fff 100%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              wipeMatch
            </motion.span>
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
    </div>
  );
}
export default memo(LegendaryLandingPage);
