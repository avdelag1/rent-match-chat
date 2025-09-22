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
        
        {/* Flame Icon - Interactive Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            duration: 0.8, 
            delay: 0.2,
            bounce: 0.6 
          }}
          className="flex justify-center mb-8 relative"
        >
          <motion.div 
            className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl cursor-pointer relative"
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 0 40px rgba(251, 146, 60, 0.6)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFlameClick}
            animate={flameClicked ? {
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1]
            } : {}}
          >
            <motion.div 
              className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative overflow-hidden"
              animate={flameClicked ? {
                background: [
                  "linear-gradient(135deg, rgb(251 146 60), rgb(239 68 68))",
                  "linear-gradient(135deg, rgb(59 130 246), rgb(147 51 234))",
                  "linear-gradient(135deg, rgb(251 146 60), rgb(239 68 68))"
                ]
              } : {
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                background: { duration: 1.5 }
              }}
            >
              <motion.div
                animate={flameClicked ? {
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360]
                } : {
                  y: [0, -2, 0]
                }}
                transition={{
                  y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 0.8 },
                  rotate: { duration: 0.8 }
                }}
              >
                <Flame className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Flame Particles */}
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 bg-orange-400 rounded-full pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: particle.x,
                  y: particle.y,
                  opacity: [1, 0.8, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
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