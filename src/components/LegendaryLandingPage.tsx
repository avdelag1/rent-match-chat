import { useState, useRef, useCallback, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, Shield } from 'lucide-react';
import { AuthDialog } from './AuthDialog';

function LegendaryLandingPage() {
  // Set orange status bar for landing page
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#f97316');
    }
    
    return () => {
      // Reset to default when leaving landing page
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#1a1a1a');
      }
    };
  }, []);

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

  return (
    <motion.div 
      ref={containerRef} 
      className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 cursor-pointer" 
      style={{
        willChange: 'background',
        contain: 'paint'
      }} 
      onMouseMove={handleMouseMove} 
      onClick={createRipple} 
      animate={{
        background: `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgb(17 17 17), rgb(3 3 3), rgb(10 10 10))`
      }} 
      transition={{
        duration: 0.3
      }}
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <motion.div 
          className="absolute inset-0" 
          style={{
            background: 'radial-gradient(ellipse at 20% 30%, rgba(249, 115, 22, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)'
          }} 
          animate={{
            opacity: [0.3, 0.5, 0.3]
          }} 
          transition={{
            duration: 8,
            repeat: Infinity
          }} 
        />
      </div>

      {/* Ripple Effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div 
            key={ripple.id} 
            className="absolute border-2 border-orange-400/30 rounded-full pointer-events-none" 
            style={{
              left: ripple.x - 25,
              top: ripple.y - 25
            }} 
            initial={{
              width: 50,
              height: 50,
              opacity: 0.8
            }} 
            animate={{
              width: 400,
              height: 400,
              opacity: 0,
              x: -175,
              y: -175
            }} 
            exit={{
              opacity: 0
            }} 
            transition={{
              duration: 1.5,
              ease: "easeOut"
            }} 
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
      <div className="relative z-10 text-center space-y-8 max-w-2xl w-full px-4">

        {/* Title - 3D Game-Style Logo */}
        <motion.div 
          initial={{
            opacity: 0,
            y: 30,
            scale: 0.9
          }} 
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }} 
          transition={{
            duration: 0.6,
            delay: 0.2,
            type: "spring",
            bounce: 0.3
          }} 
          className="space-y-4"
        >
          {/* Logo with beautiful shine effect */}
          <div className="relative">
            <h1 className="text-center leading-none relative">
              <span
                className="swipess-logo-simple swipess-logo-shine-container block"
                style={{
                  fontSize: 'clamp(2.5rem, 14vw, 5rem)',
                }}
              >
                SWIPESS
              </span>
            </h1>
          </div>
          <motion.p 
            className="text-white/80 text-lg sm:text-xl font-medium px-4 max-w-md mx-auto" 
            initial={{
              opacity: 0
            }} 
            animate={{
              opacity: 1
            }} 
            transition={{
              delay: 0.4
            }}
          >
            Swipe and find your perfect deal
          </motion.p>
        </motion.div>

        {/* Theater Marquee Text - No Buttons, Just Glowing Text */}
        <div className="space-y-4 mt-12">

          {/* I AM A CLIENT - Marquee Text */}
          <motion.div
            onClick={() => openAuthDialog('client')}
            className="marquee-container cursor-pointer"
            initial={{
              opacity: 0,
              x: 200,
              scale: 0.8
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 12,
              delay: 0.4
            }}
            whileHover={{ 
              scale: 1.08,
            }}
            whileTap={{ 
              scale: 0.95,
            }}
          >
            <motion.span 
              className="marquee-text marquee-text-client"
              animate={{
                x: ['-3%', '3%', '-3%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              I AM A CLIENT
            </motion.span>
          </motion.div>

          {/* I AM AN OWNER - Marquee Text */}
          <motion.div
            onClick={() => openAuthDialog('owner')}
            className="marquee-container cursor-pointer"
            initial={{
              opacity: 0,
              x: -200,
              scale: 0.8
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 12,
              delay: 0.55
            }}
            whileHover={{ 
              scale: 1.08,
            }}
            whileTap={{ 
              scale: 0.95,
            }}
          >
            <motion.span 
              className="marquee-text marquee-text-owner"
              animate={{
                x: ['3%', '-3%', '3%'],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              I AM AN OWNER
            </motion.span>
          </motion.div>
        </div>

        {/* Bottom Info Section */}
        <motion.div 
          initial={{
            opacity: 0,
            y: 20
          }} 
          animate={{
            opacity: 1,
            y: 0
          }} 
          transition={{
            duration: 0.5,
            delay: 1.0
          }} 
          className="pt-8 space-y-2 border-0 border-none rounded-none"
        >
          {/* Features badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <motion.div 
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10" 
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white/70 text-xs font-medium">Perfect Deals</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10" 
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
            >
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span className="text-white/70 text-xs font-medium">Secure Chat</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10" 
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-white/70 text-xs font-medium">Instant Connect</span>
            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* Auth Dialog */}
      <AuthDialog isOpen={authDialog.isOpen} onClose={closeAuthDialog} role={authDialog.role} />
    </motion.div>
  );
}

export default memo(LegendaryLandingPage);
