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

  // Realistic fire embers rising from ground
  const FireParticles = () => {
    // Pre-calculated values for consistent renders (reduced for better mobile performance)
    const embers = Array.from({
      length: 18
    }, (_, i) => ({
      id: i,
      size: 1.5 + i % 5 * 1.2,
      left: i * 4.2 % 100,
      color: i % 5 === 0 ? '#ff4500' : i % 5 === 1 ? '#ff6b35' : i % 5 === 2 ? '#ff8c42' : i % 5 === 3 ? '#ffa756' : '#ffb86c',
      duration: 8 + i % 7 * 2,
      delay: i * 0.4 % 5,
      drift: (i % 11 - 5) * 25,
      glowSize: 4 + i % 4 * 3
    }));
    const orbs = Array.from({
      length: 6
    }, (_, i) => ({
      id: i,
      size: 40 + i % 5 * 30,
      left: i * 10 % 100,
      startY: 70 + i % 3 * 10,
      color: i % 4 === 0 ? 'rgba(255,69,0,0.15)' : i % 4 === 1 ? 'rgba(255,107,53,0.12)' : i % 4 === 2 ? 'rgba(255,140,66,0.1)' : 'rgba(255,167,86,0.08)',
      innerColor: i % 4 === 0 ? 'rgba(255,120,50,0.25)' : i % 4 === 1 ? 'rgba(255,150,80,0.2)' : i % 4 === 2 ? 'rgba(255,180,100,0.15)' : 'rgba(255,200,120,0.12)',
      duration: 12 + i % 5 * 4,
      delay: i * 0.8 % 4,
      drift: (i % 7 - 3) * 40
    }));
    return <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{
      willChange: 'transform',
      contain: 'layout style paint'
    }}>
        {/* Ground glow effect */}
        <motion.div className="absolute bottom-0 left-0 right-0 h-32" style={{
        background: 'linear-gradient(to top, rgba(255,69,0,0.08), rgba(255,107,53,0.04), transparent)'
      }} animate={{
        opacity: [0.6, 1, 0.6]
      }} transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }} />

        {/* Rising embers from ground */}
        {embers.map(ember => <motion.div key={`ember-${ember.id}`} className="absolute" style={{
        width: `${ember.size}px`,
        height: `${ember.size * 1.5}px`,
        background: `radial-gradient(ellipse at center, ${ember.color}, ${ember.color}80 40%, transparent 70%)`,
        boxShadow: `0 0 ${ember.glowSize}px ${ember.color}90, 0 0 ${ember.glowSize * 2}px ${ember.color}50`,
        borderRadius: '50% 50% 50% 50%',
        left: `${ember.left}%`,
        bottom: '0px'
      }} animate={{
        y: [0, -window.innerHeight * 0.9],
        x: [0, ember.drift, ember.drift * 0.5],
        opacity: [0, 0.9, 0.8, 0.5, 0],
        scale: [0.3, 1, 0.9, 0.6, 0.2]
      }} transition={{
        duration: ember.duration,
        repeat: Infinity,
        ease: [0.25, 0.1, 0.25, 1],
        delay: ember.delay
      }} />)}

        {/* Floating fire orbs rising from bottom */}
        {orbs.map(orb => <motion.div key={`orb-${orb.id}`} className="absolute rounded-full" style={{
        width: `${orb.size}px`,
        height: `${orb.size}px`,
        background: `radial-gradient(circle at 30% 30%, ${orb.innerColor}, ${orb.color} 50%, transparent 70%)`,
        filter: 'blur(8px)',
        left: `${orb.left}%`,
        bottom: '0%'
      }} animate={{
        y: [0, -window.innerHeight * 1.1],
        x: [0, orb.drift, orb.drift * 0.3],
        opacity: [0, 0.7, 0.5, 0.3, 0],
        scale: [0.5, 1.2, 1, 0.8, 0.4]
      }} transition={{
        duration: orb.duration,
        repeat: Infinity,
        ease: "easeOut",
        delay: orb.delay
      }} />)}

        {/* Subtle heat distortion waves */}
        <motion.div className="absolute bottom-0 left-0 right-0 h-48" style={{
        background: 'linear-gradient(to top, rgba(255,100,50,0.03), transparent)',
        filter: 'blur(20px)'
      }} animate={{
        scaleY: [1, 1.1, 1],
        opacity: [0.5, 0.8, 0.5]
      }} transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
      </div>;
  };
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

      {/* Fire Particles */}
      <FireParticles />

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
          <h1 className="font-black text-center leading-none" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
            <motion.span className="block" style={{
            fontSize: 'clamp(4rem, 20vw, 8rem)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316)',
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
              Swipe
            </motion.span>
            <motion.span className="block -mt-3 sm:-mt-4" style={{
            fontSize: 'clamp(3rem, 16vw, 6rem)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316)',
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
            Swipe and find your perfect deal
          </motion.p>
        </motion.div>

        {/* Buttons Container with Enhanced Effects */}
        <div className="space-y-2 mt-8">

          {/* I'm a Client Button - Orange Red Fire */}
          <motion.button onClick={() => openAuthDialog('client')} onMouseEnter={() => setHoveredButton('client')} onMouseLeave={() => setHoveredButton(null)} className="w-full max-w-xl mx-auto py-1.5 px-14 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(249,115,22,0.5)] backdrop-blur-sm border border-white/40 relative overflow-hidden group" style={{
            background: 'linear-gradient(135deg, #ff4500, #f97316, #ea580c, #dc2626, #ff6b35)'
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
          delay: 0.4,
          velocity: 2
        }} whileHover={{
          scale: 1.05,
          y: -6,
          boxShadow: '0 20px 60px rgba(249,115,22,0.6), 0 0 30px rgba(220,38,38,0.4)'
        }} whileTap={{
          scale: 0.95
        }}>
            {/* Animated shimmer background on hover */}
            <motion.div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, #ff6b35, #fb923c, #f97316, #ea580c, #dc2626)'
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

          {/* I'm an Owner Button - Orange Red Fire */}
          <motion.button onClick={() => openAuthDialog('owner')} onMouseEnter={() => setHoveredButton('owner')} onMouseLeave={() => setHoveredButton(null)} className="w-full max-w-xl mx-auto py-1.5 px-14 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(249,115,22,0.5)] backdrop-blur-sm border border-white/40 relative overflow-hidden group" style={{
            background: 'linear-gradient(135deg, #ff4500, #f97316, #ea580c, #dc2626, #ff6b35)'
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
          boxShadow: '0 20px 60px rgba(249,115,22,0.6), 0 0 30px rgba(220,38,38,0.4)'
        }} whileTap={{
          scale: 0.95
        }}>
            {/* Animated shimmer background on hover */}
            <motion.div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, #ff6b35, #fb923c, #f97316, #ea580c, #dc2626)'
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
            <span className="relative z-10 drop-shadow-lg">I'm an Owner</span>
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