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
      {/* Enhanced Floating Embers */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? '#fbbf24' : 
                i % 3 === 1 ? '#f97316' : '#dc2626'
              }, transparent)`,
              boxShadow: `0 0 ${4 + Math.random() * 8}px ${
                i % 3 === 0 ? '#fbbf24' : 
                i % 3 === 1 ? '#f97316' : '#dc2626'
              }60`,
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
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight
              ],
              scale: [0.3, 1, 0.6, 1.2, 0.4],
              opacity: [0.2, 0.8, 0.4, 0.9, 0.3],
              rotate: [0, 180, 360, 540, 720]
            }}
            transition={{
              duration: 25 + Math.random() * 15, // Much slower: 25-40 seconds
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10 // Staggered start
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
            TINDERENT
          </h1>
          <p className="text-white/90 text-xl font-medium px-4">
            Swipe your way to the perfect deal - rent, buy, or find clients
          </p>
        </motion.div>

        {/* Buttons Container */}
        <div className="space-y-6 mt-16">
          
          {/* I'm a Client Button - Clean & Fast */}
          <button
            onClick={() => openAuthDialog('client')}
            className="w-full py-4 px-6 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold text-lg rounded-2xl transform transition-transform duration-100 active:scale-98 flex items-center justify-center gap-3"
          >
            <Users className="w-5 h-5" />
            <span>I'm a Client</span>
          </button>

          {/* I'm an Owner Button - Clean & Fast */}
          <button
            onClick={() => openAuthDialog('owner')}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-lg rounded-2xl transform transition-transform duration-100 active:scale-98 flex items-center justify-center gap-3"
          >
            <Flame className="w-5 h-5" />
            <span>I'm an Owner</span>
          </button>
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