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

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-12 max-w-md w-full">
        
        {/* Pure Lucide Flame Icon - No Containers */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            duration: 0.8, 
            delay: 0.2,
            bounce: 0.6 
          }}
          className="flex justify-center mb-8 relative cursor-pointer"
          onClick={handleFlameClick}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={flameClicked ? {
              rotate: [0, 8, -5, 3, -2, 0],
              scaleY: [1, 1.3, 0.9, 1.1, 1],
              scaleX: [1, 0.9, 1.1, 0.95, 1],
              filter: [
                "brightness(1) saturate(1) drop-shadow(0 0 15px rgba(251, 146, 60, 0.6))",
                "brightness(1.5) saturate(1.3) drop-shadow(0 0 25px rgba(251, 146, 60, 0.9))",
                "brightness(1.2) saturate(1.1) drop-shadow(0 0 20px rgba(251, 146, 60, 0.7))",
                "brightness(1) saturate(1) drop-shadow(0 0 15px rgba(251, 146, 60, 0.6))"
              ]
            } : {
              y: [0, -3, 0, -2, 0],
              rotate: [0, 2, -1, 1, 0],
              scaleY: [1, 1.05, 0.98, 1.02, 1],
              scaleX: [1, 0.98, 1.02, 0.99, 1],
              filter: [
                "drop-shadow(0 0 10px rgba(251, 146, 60, 0.5))",
                "drop-shadow(0 0 15px rgba(251, 146, 60, 0.7))",
                "drop-shadow(0 0 10px rgba(251, 146, 60, 0.5))"
              ]
            }}
            transition={flameClicked ? {
              duration: 1.5,
              ease: [0.4, 0, 0.2, 1]
            } : {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Flame 
              className="w-20 h-20 text-transparent"
              fill="url(#flameGradient)"
              strokeWidth={0}
            />
          </motion.div>

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

          {/* Flame Particles */}
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  background: `linear-gradient(45deg, #f97316, #dc2626)`
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: particle.x,
                  y: particle.y,
                  opacity: [1, 0.8, 0],
                  rotate: [0, 180, 360]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          <h1 className="text-6xl font-bold text-white tracking-wider drop-shadow-lg text-center">
            TINDE<span className="text-red-500">R</span>ENT
          </h1>
          <p className="text-white/90 text-xl font-medium px-4">
            Swipe to discover your ideal property or perfect client - rent, buy & connect
          </p>
        </motion.div>

        {/* Buttons Container with Smooth Entrance Effects */}
        <div className="space-y-6 mt-16">
          
          {/* I'm a Client Button - Slides in from LEFT smoothly */}
          <motion.button
            onClick={() => openAuthDialog('client')}
            className="w-full py-6 px-8 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
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
              delay: 0.8,
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
            <Users className="w-6 h-6" />
            <span>I'm a Client</span>
          </motion.button>

          {/* I'm an Owner Button - Slides in from RIGHT smoothly */}
          <motion.button
            onClick={() => openAuthDialog('owner')}
            className="w-full py-6 px-8 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
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
              delay: 1.0,
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

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </motion.div>
  );
}
export default memo(LegendaryLandingPage);
