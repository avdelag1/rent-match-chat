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

  return <motion.div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 cursor-pointer" style={{
    willChange: 'background',
    contain: 'paint'
  }} onMouseMove={handleMouseMove} onClick={createRipple} animate={{
    background: `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgb(17 17 17), rgb(3 3 3), rgb(10 10 10))`
  }} transition={{
    duration: 0.3
  }}>
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 30%, rgba(249, 115, 22, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)'
      }} animate={{
        opacity: [0.3, 0.5, 0.3]
      }} transition={{
        duration: 8,
        repeat: Infinity
      }} />
      </div>

      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map(ripple => <motion.div key={ripple.id} className="absolute border-2 border-orange-400/30 rounded-full pointer-events-none" style={{
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
      <div className="relative z-10 text-center space-y-8 max-w-2xl w-full px-4">

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
          <h1
            className="font-bold text-center leading-none relative overflow-hidden"
            style={{ fontFamily: "'Quicksand', 'Poppins', system-ui, sans-serif" }}
          >
            <motion.span className="block relative" style={{
            fontSize: 'clamp(2.5rem, 14vw, 5rem)',
            fontWeight: 700,
            letterSpacing: '0.02em',
            width: '100%',
            textAlign: 'center',
            background: 'linear-gradient(90deg, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 2px 10px rgba(249, 115, 22, 0.35))'
          }} animate={{
            backgroundPosition: ['200% 50%', '0% 50%']
          }} transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}>
              Swipess
            </motion.span>
          </h1>
          <motion.p className="text-white/80 text-lg sm:text-xl font-medium px-4 max-w-md mx-auto" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.4
        }}>
            Swipe and find your perfect deal
          </motion.p>
        </motion.div>

        {/* Buttons Container with Enhanced Effects */}
        <div className="space-y-2 mt-8">

          {/* I'm a Client Button - Vibrant Cyan to Electric Blue */}
          <motion.button onClick={() => openAuthDialog('client')} onMouseEnter={() => setHoveredButton('client')} onMouseLeave={() => setHoveredButton(null)} className="w-full max-w-xl mx-auto py-1.5 px-14 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(6,182,212,0.5)] backdrop-blur-sm border border-white/40 relative overflow-hidden group" style={{
            background: 'linear-gradient(135deg, #06b6d4, #0ea5e9, #3b82f6, #6366f1, #8b5cf6)'
          }} initial={{
          opacity: 0,
          x: 300,
          scale: 0.8,
          rotate: 5
        }} animate={{
          opacity: 1,
          x: 0,
          scale: 1,
          rotate: 0
        }} transition={{
          type: "spring",
          stiffness: 200,
          damping: 8,
          mass: 0.6,
          delay: 0.4,
          velocity: 2
        }} whileHover={{
          scale: 1.05,
          y: -6,
          boxShadow: '0 20px 60px rgba(6,182,212,0.6), 0 0 30px rgba(99,102,241,0.4)'
        }} whileTap={{
          scale: 0.95
        }}>
            {/* Animated shimmer background on hover */}
            <motion.div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, #22d3ee, #38bdf8, #60a5fa, #818cf8, #a78bfa)'
            }} initial={{
            opacity: 0
          }} animate={{
            opacity: hoveredButton === 'client' ? 1 : 0
          }} transition={{
            duration: 0.3
          }} />

            {/* Rainbow shiny reflection effect */}
            <motion.div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 w-40"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), rgba(255,255,255,0.8), rgba(255,255,255,0.3), transparent)',
                  filter: 'blur(2px)'
                }}
                animate={{
                  x: ['-200%', '500%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>

            {/* Particle sparkle effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 40%)'
              }}
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <Home className="w-5 h-5 relative z-10" />
            <span className="relative z-10 drop-shadow-lg">I'm a Client</span>
            <motion.div className="relative z-10" animate={{
            x: hoveredButton === 'client' ? 5 : 0,
            scale: hoveredButton === 'client' ? 1.2 : 1
          }} transition={{
            type: "spring",
            stiffness: 300,
            damping: 10
          }}>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </motion.button>

          {/* I'm an Owner Button - Vibrant Magenta to Gold */}
          <motion.button onClick={() => openAuthDialog('owner')} onMouseEnter={() => setHoveredButton('owner')} onMouseLeave={() => setHoveredButton(null)} className="w-full max-w-xl mx-auto py-1.5 px-14 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(236,72,153,0.5)] backdrop-blur-sm border border-white/40 relative overflow-hidden group" style={{
            background: 'linear-gradient(135deg, #f43f5e, #ec4899, #d946ef, #a855f7, #8b5cf6)'
          }} initial={{
          opacity: 0,
          x: -300,
          scale: 0.8,
          rotate: -5
        }} animate={{
          opacity: 1,
          x: 0,
          scale: 1,
          rotate: 0
        }} transition={{
          type: "spring",
          stiffness: 200,
          damping: 8,
          mass: 0.6,
          delay: 0.55,
          velocity: 2
        }} whileHover={{
          scale: 1.05,
          y: -6,
          boxShadow: '0 20px 60px rgba(236,72,153,0.6), 0 0 30px rgba(168,85,247,0.4)'
        }} whileTap={{
          scale: 0.95
        }}>
            {/* Animated shimmer background on hover */}
            <motion.div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, #fb7185, #f472b6, #e879f9, #c084fc, #a78bfa)'
            }} initial={{
            opacity: 0
          }} animate={{
            opacity: hoveredButton === 'owner' ? 1 : 0
          }} transition={{
            duration: 0.3
          }} />

            {/* Rainbow shiny reflection effect */}
            <motion.div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 w-40"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), rgba(255,255,255,0.8), rgba(255,255,255,0.3), transparent)',
                  filter: 'blur(2px)'
                }}
                animate={{
                  x: ['-200%', '500%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: 'easeInOut',
                  delay: 1.5
                }}
              />
            </motion.div>

            {/* Particle sparkle effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 0%, transparent 40%)'
              }}
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />

            <Building2 className="w-5 h-5 relative z-10" />
            <span className="relative z-10 drop-shadow-lg">I'm a Seller</span>
            <motion.div className="relative z-10" animate={{
            x: hoveredButton === 'owner' ? 5 : 0,
            scale: hoveredButton === 'owner' ? 1.2 : 1
          }} transition={{
            type: "spring",
            stiffness: 300,
            damping: 10
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
      }} className="pt-4 space-y-2 border-0 border-none rounded-none">
          {/* Role selector hint */}


          {/* Features badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <motion.div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10" whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(255,255,255,0.1)'
          }}>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white/70 text-xs font-medium">Perfect Deals</span>
            </motion.div>
            <motion.div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10" whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(255,255,255,0.1)'
          }}>
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span className="text-white/70 text-xs font-medium">Secure Chat</span>
            </motion.div>
            <motion.div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10" whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(255,255,255,0.1)'
          }}>
              <Users className="w-3.5 h-3.5 text-blue-400" />
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