import { useState, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Users, Sparkles } from 'lucide-react';
import { AuthDialog } from './AuthDialog';
import { PWAInstallPrompt } from './PWAInstallPrompt';

function LegendaryLandingPage() {
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; role: 'client' | 'owner' }>({
    isOpen: false,
    role: 'client'
  });
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [flameClicked, setFlameClicked] = useState(false);
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

  const createFlameParticles = useCallback(() => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50
    }));
    
    setParticles(newParticles);
    setFlameClicked(true);
    
    setTimeout(() => {
      setParticles([]);
      setFlameClicked(false);
    }, 1500);
  }, []);

  const handleFlameClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    createFlameParticles();
  }, [createFlameParticles]);

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
            className="absolute border-2 border-orange-400/40 rounded-full pointer-events-none"
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

      {/* Main Content - Centered Layout */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md w-full">

        {/* Title with Flame as the dot on 'i' */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mb-8"
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white tracking-wider drop-shadow-lg text-center relative">
            T<span className="relative inline-block">
              I
              {/* Animated Flame as the dot on 'i' */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  duration: 0.8,
                  delay: 0.4,
                  bounce: 0.6
                }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 cursor-pointer"
                onClick={handleFlameClick}
              >
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  animate={flameClicked ? {
                    rotate: [0, 10, -6, 4, -2, 0],
                    scaleY: [1, 1.4, 0.85, 1.15, 1],
                    scaleX: [1, 0.85, 1.15, 0.92, 1],
                    filter: [
                      "brightness(1) saturate(1) drop-shadow(0 0 8px rgba(251, 146, 60, 0.7))",
                      "brightness(1.6) saturate(1.4) drop-shadow(0 0 15px rgba(251, 146, 60, 1))",
                      "brightness(1.3) saturate(1.2) drop-shadow(0 0 12px rgba(251, 146, 60, 0.8))",
                      "brightness(1) saturate(1) drop-shadow(0 0 8px rgba(251, 146, 60, 0.7))"
                    ]
                  } : {
                    y: [0, -2, 0, -1.5, 0],
                    rotate: [0, 2, -1, 1, 0],
                    scaleY: [1, 1.08, 0.96, 1.04, 1],
                    scaleX: [1, 0.96, 1.04, 0.98, 1],
                    filter: [
                      "drop-shadow(0 0 6px rgba(251, 146, 60, 0.6))",
                      "drop-shadow(0 0 10px rgba(251, 146, 60, 0.8))",
                      "drop-shadow(0 0 6px rgba(251, 146, 60, 0.6))"
                    ]
                  }}
                  transition={flameClicked ? {
                    duration: 1.5,
                    ease: [0.4, 0, 0.2, 1]
                  } : {
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Flame
                    className="w-10 h-10 md:w-12 md:h-12 text-transparent"
                    fill="url(#flameGradient)"
                    strokeWidth={0}
                  />
                </motion.div>

                {/* Flame Particles */}
                <AnimatePresence>
                  {particles.map((particle) => (
                    <motion.div
                      key={particle.id}
                      className="absolute w-1 h-1 rounded-full pointer-events-none"
                      style={{
                        left: '50%',
                        top: '50%',
                        background: `linear-gradient(45deg, #f97316, #dc2626)`
                      }}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1.2, 0],
                        x: particle.x * 0.5,
                        y: particle.y * 0.5,
                        opacity: [1, 0.9, 0],
                        rotate: [0, 180, 360]
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </span>NDE<span className="text-red-500">R</span>ENT
          </h1>

          {/* SVG Gradient Definition */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-white/90 text-lg md:text-xl font-medium px-4 mb-12"
        >
          Swipe to discover your ideal property or perfect client - rent, buy & connect
        </motion.p>

        {/* Buttons Container with Smooth Entrance Effects */}
        <div className="space-y-5 w-full">

          {/* I'm a Client Button - Slides in from LEFT smoothly */}
          <motion.button
            onClick={() => openAuthDialog('client')}
            className="w-full py-5 px-8 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold text-lg md:text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            initial={{
              opacity: 0,
              x: -200
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 20,
              delay: 0.7,
              duration: 1.0
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            whileTap={{
              scale: 0.98,
              transition: { duration: 0.1 }
            }}
          >
            <Users className="w-5 h-5 md:w-6 md:h-6" />
            <span>I'm a Client</span>
          </motion.button>

          {/* I'm an Owner Button - Slides in from RIGHT smoothly */}
          <motion.button
            onClick={() => openAuthDialog('owner')}
            className="w-full py-5 px-8 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-lg md:text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            initial={{
              opacity: 0,
              x: 200
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 20,
              delay: 0.9,
              duration: 1.0
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            whileTap={{
              scale: 0.98,
              transition: { duration: 0.1 }
            }}
          >
            <Flame className="w-5 h-5 md:w-6 md:h-6" />
            <span>I'm an Owner</span>
          </motion.button>
        </div>

        {/* Call to action */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="text-white/80 text-base md:text-lg mt-10"
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

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </motion.div>
  );
}
export default memo(LegendaryLandingPage);
