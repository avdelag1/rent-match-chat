import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Users, Sparkles } from 'lucide-react';
import { AuthDialog } from './AuthDialog';

export default function LegendaryLandingPage() {
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
      className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-br from-red-400 via-red-500 to-orange-500 cursor-pointer"
      onMouseMove={handleMouseMove}
      onClick={createRipple}
      animate={{
        background: `linear-gradient(${135 + mousePosition.x}deg, rgb(248 113 113), rgb(239 68 68), rgb(251 146 60))`
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Floating Embers */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-300 rounded-full opacity-60"
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight
              ],
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute border-2 border-white/30 rounded-full pointer-events-none"
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

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-12 max-w-md w-full">
        
        {/* Custom Real Flame SVG */}
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
            className="relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={flameClicked ? {
              scale: [1, 1.3, 1.1, 1.2, 1],
              filter: [
                "brightness(1) saturate(1) drop-shadow(0 0 15px rgba(251, 146, 60, 0.6))",
                "brightness(1.5) saturate(1.3) drop-shadow(0 0 25px rgba(251, 146, 60, 0.9))",
                "brightness(1.2) saturate(1.1) drop-shadow(0 0 20px rgba(251, 146, 60, 0.7))",
                "brightness(1) saturate(1) drop-shadow(0 0 15px rgba(251, 146, 60, 0.6))"
              ]
            } : {
              y: [0, -3, 0, -2, 0],
              rotate: [0, 1, -1, 0.5, 0],
              scale: [1, 1.02, 1, 1.01, 1],
              filter: [
                "drop-shadow(0 0 10px rgba(251, 146, 60, 0.5))",
                "drop-shadow(0 0 15px rgba(251, 146, 60, 0.7))",
                "drop-shadow(0 0 10px rgba(251, 146, 60, 0.5))"
              ]
            }}
            transition={flameClicked ? {
              duration: 2,
              ease: "easeOut"
            } : {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.svg
              width="80"
              height="100"
              viewBox="0 0 80 100"
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible"
              animate={flameClicked ? {
                rotate: [0, 8, -5, 3, -2, 0],
                scaleY: [1, 1.3, 0.9, 1.1, 1],
                scaleX: [1, 0.9, 1.1, 0.95, 1]
              } : {
                rotate: [0, 2, -1, 1, 0],
                scaleY: [1, 1.05, 0.98, 1.02, 1],
                scaleX: [1, 0.98, 1.02, 0.99, 1]
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
              <defs>
                <radialGradient id="flameGradient" cx="50%" cy="80%" r="60%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="30%" stopColor="#f97316" />
                  <stop offset="60%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#dc2626" />
                </radialGradient>
                <radialGradient id="innerFlame" cx="50%" cy="70%" r="40%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </radialGradient>
              </defs>
              
              {/* Main flame shape */}
              <path
                d="M40 95 C20 85, 15 70, 20 55 C25 45, 30 40, 35 30 C38 20, 42 15, 45 10 C48 5, 52 8, 55 15 C58 25, 60 35, 65 45 C70 55, 68 65, 60 75 C55 85, 50 90, 40 95 Z"
                fill="url(#flameGradient)"
                stroke="none"
              />
              
              {/* Inner flame highlight */}
              <path
                d="M40 85 C28 78, 25 68, 28 58 C30 52, 33 48, 36 42 C38 35, 40 32, 42 28 C44 25, 46 27, 48 32 C50 38, 52 44, 54 50 C56 56, 55 62, 52 68 C49 74, 45 80, 40 85 Z"
                fill="url(#innerFlame)"
                stroke="none"
                opacity="0.8"
              />
              
              {/* Flame tip */}
              <ellipse
                cx="45"
                cy="12"
                rx="3"
                ry="8"
                fill="#fef3c7"
                opacity="0.9"
              />
            </motion.svg>
          </motion.div>

          {/* Flame Particles */}
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 rounded-full pointer-events-none"
                style={{
                  left: '50%',
                  top: '40%',
                  background: `radial-gradient(circle, #fbbf24, #f97316)`
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
            TINDERENT
          </h1>
          <p className="text-white/90 text-xl font-medium px-4">
            Swipe your way to the perfect deal - rent, buy, or find clients
          </p>
        </motion.div>

        {/* Buttons Container */}
        <div className="space-y-6 mt-16">
          
          {/* I'm a Client Button - Enhanced with trail effect */}
          <motion.button
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ 
              duration: 0.25, 
              delay: 0.4,
              ease: [0.68, -0.55, 0.265, 1.55]
            }}
            whileHover={{ 
              scale: 1.02,
              y: -2,
              boxShadow: "0 10px 25px rgba(251, 146, 60, 0.2)",
              transition: { type: "spring", bounce: 0.3, duration: 0.4 }
            }}
            whileTap={{ 
              scale: 0.99,
              y: 0,
              transition: { type: "spring", bounce: 0.5, duration: 0.2 }
            }}
            onClick={() => openAuthDialog('client')}
            className="w-full py-6 px-8 bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 text-white font-bold text-xl rounded-full shadow-2xl border-0 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400 opacity-0 group-hover:opacity-10"
              animate={{ 
                x: [-100, 400],
                opacity: [0, 0.15, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut"
              }}
            />
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Users className="w-6 h-6" />
            </motion.div>
            <span>I'm a Client</span>
          </motion.button>

          {/* I'm an Owner Button - Enhanced with flame trail */}
          <motion.button
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ 
              duration: 0.25, 
              delay: 0.55,
              ease: [0.68, -0.55, 0.265, 1.55]
            }}
            whileHover={{ 
              scale: 1.02,
              y: -2,
              boxShadow: "0 10px 25px rgba(239, 68, 68, 0.2)",
              transition: { type: "spring", bounce: 0.3, duration: 0.4 }
            }}
            whileTap={{ 
              scale: 0.99,
              y: 0,
              transition: { type: "spring", bounce: 0.5, duration: 0.2 }
            }}
            onClick={() => openAuthDialog('owner')}
            className="w-full py-6 px-8 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white font-bold text-xl rounded-full shadow-2xl border-0 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-300 via-red-400 to-red-500 opacity-0 group-hover:opacity-10"
              animate={{ 
                x: [400, -100],
                opacity: [0, 0.15, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut"
              }}
            />
            <motion.div
              whileHover={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Flame className="w-6 h-6" />
            </motion.div>
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