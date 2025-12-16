import { useState, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Building2, Home, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { AuthDialog } from './AuthDialog';

function LegendaryLandingPage() {
  const [authDialog, setAuthDialog] = useState<{
    isOpen: boolean;
    role: 'client' | 'owner';
  }>({
    isOpen: false,
    role: 'client'
  });
  const [ripples, setRipples] = useState<Array<{
    id: number;
    x: number;
    y: number;
  }>>([]);
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  const [hoveredButton, setHoveredButton] = useState<'client' | 'owner' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const openAuthDialog = (role: 'client' | 'owner') => {
    setAuthDialog({
      isOpen: true,
      role
    });
  };

  const closeAuthDialog = () => {
    setAuthDialog({
      isOpen: false,
      role: 'client'
    });
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

  return <motion.div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 cursor-pointer" onMouseMove={handleMouseMove} onClick={createRipple} animate={{
    background: `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgb(17 17 17), rgb(3 3 3), rgb(10 10 10))`
  }} transition={{
    duration: 0.3
  }}>
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
      }} animate={{
        opacity: [0.3, 0.5, 0.3]
      }} transition={{
        duration: 8,
        repeat: Infinity
      }} />
      </div>

      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map(ripple => <motion.div key={ripple.id} className="absolute border-2 border-blue-400/30 rounded-full pointer-events-none" style={{
        left: ripple.x - 25,
        top: ripple.y - 25
      }} initial={{
        width: 50,
        height: 50,
        opacity: 0.8
      }} animate={{
        width: 400,
        height: 400,
        opacity: 0,
        x: -175,
        y: -175
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 1.5,
        ease: "easeOut"
      }} />)}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-10 max-w-lg w-full">

        {/* Title */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.2
      }} className="space-y-4">
          <h1 className="font-black tracking-tight drop-shadow-2xl text-center leading-none">
            <motion.span className="block" style={{
            fontSize: 'clamp(4rem, 20vw, 8rem)',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }} animate={{
            backgroundPosition: ['200% 50%', '0% 50%']
          }} transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}>
              Swipe
            </motion.span>
            <motion.span className="block" style={{
            fontSize: 'clamp(3rem, 16vw, 6rem)',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }} animate={{
            backgroundPosition: ['200% 50%', '0% 50%']
          }} transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}>
              Match
            </motion.span>
          </h1>
          <motion.p className="text-white/80 text-lg sm:text-xl font-medium px-4 max-w-md mx-auto" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.4
        }}>
            Swipe to discover your ideal property or perfect client — rent, buy & connect
          </motion.p>
        </motion.div>

        {/* Buttons Container with Enhanced Effects */}
        <div className="space-y-3 mt-12">

          {/* I'm a Client Button */}
          <motion.button onClick={() => openAuthDialog('client')} onMouseEnter={() => setHoveredButton('client')} onMouseLeave={() => setHoveredButton(null)} className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white font-semibold text-base sm:text-lg rounded-xl flex items-center justify-center gap-2 shadow-[0_6px_24px_rgba(59,130,246,0.3)] backdrop-blur-sm border border-white/20 relative overflow-hidden group" initial={{
          opacity: 0,
          x: -150,
          scale: 0.9
        }} animate={{
          opacity: 1,
          x: 0,
          scale: 1
        }} transition={{
          type: "spring",
          stiffness: 120,
          damping: 18,
          delay: 0.5
        }} whileHover={{
          scale: 1.03,
          y: -4,
          boxShadow: '0 16px 48px rgba(59,130,246,0.45)'
        }} whileTap={{
          scale: 0.97
        }}>
            {/* Animated background gradient on hover */}
            <motion.div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-500 to-teal-600" initial={{
            opacity: 0
          }} animate={{
            opacity: hoveredButton === 'client' ? 1 : 0
          }} transition={{
            duration: 0.3
          }} />

            {/* Shine effect */}
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full" animate={{
            x: ['100%', '-100%']
          }} transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 2
          }} />

            <Home className="w-5 h-5 relative z-10" />
            <span className="relative z-10">I'm Looking for a Place</span>
            <motion.div className="relative z-10" animate={{
            x: hoveredButton === 'client' ? 3 : 0
          }} transition={{
            duration: 0.2
          }}>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </motion.button>

          {/* I'm an Owner Button */}
          <motion.button onClick={() => openAuthDialog('owner')} onMouseEnter={() => setHoveredButton('owner')} onMouseLeave={() => setHoveredButton(null)} className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-semibold text-base sm:text-lg rounded-xl flex items-center justify-center gap-2 shadow-[0_6px_24px_rgba(139,92,246,0.3)] backdrop-blur-sm border border-white/20 relative overflow-hidden group" initial={{
          opacity: 0,
          x: 150,
          scale: 0.9
        }} animate={{
          opacity: 1,
          x: 0,
          scale: 1
        }} transition={{
          type: "spring",
          stiffness: 120,
          damping: 18,
          delay: 0.65
        }} whileHover={{
          scale: 1.03,
          y: -4,
          boxShadow: '0 16px 48px rgba(139,92,246,0.45)'
        }} whileTap={{
          scale: 0.97
        }}>
            {/* Animated background gradient on hover */}
            <motion.div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-500 to-rose-600" initial={{
            opacity: 0
          }} animate={{
            opacity: hoveredButton === 'owner' ? 1 : 0
          }} transition={{
            duration: 0.3
          }} />

            {/* Shine effect */}
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full" animate={{
            x: ['100%', '-100%']
          }} transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatDelay: 2,
            delay: 0.5
          }} />

            <Building2 className="w-5 h-5 relative z-10" />
            <span className="relative z-10">I'm a Property Owner</span>
            <motion.div className="relative z-10" animate={{
            x: hoveredButton === 'owner' ? 3 : 0
          }} transition={{
            duration: 0.2
          }}>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>

        {/* Bottom Info Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 1.0
      }} className="pt-8 space-y-4 border-0 border-none rounded-none">
          {/* Role selector hint */}
          

          {/* Features badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <motion.div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10" whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(255,255,255,0.1)'
          }}>
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-white/70 text-xs font-medium">Perfect Deals</span>
            </motion.div>
            <motion.div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10" whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(255,255,255,0.1)'
          }}>
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white/70 text-xs font-medium">Secure Chat</span>
            </motion.div>
            <motion.div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10" whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(255,255,255,0.1)'
          }}>
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-white/70 text-xs font-medium">Instant Connect</span>
            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* Auth Dialog */}
      <AuthDialog isOpen={authDialog.isOpen} onClose={closeAuthDialog} role={authDialog.role} />
    </motion.div>;
}
export default memo(LegendaryLandingPage);