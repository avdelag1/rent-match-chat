import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Key, Shield, Sparkles, UserCircle, Users } from 'lucide-react';
import { AuthDialog } from './AuthDialog';
import { SwipessLogo } from './SwipessLogo';

// Background color themes that cycle on tap
const BACKGROUND_COLORS = [
  { 
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)', // Black
    statusBar: '#0a0a0a'
  },
  { 
    bg: 'linear-gradient(135deg, #FF4458 0%, #FE3C72 50%, #FF6B6B 100%)', // Tinder pink/coral
    statusBar: '#FF4458'
  },
  { 
    bg: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FFA500 100%)', // Yellow to orange
    statusBar: '#FF8C00'
  },
  { 
    bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)', // Orange to red
    statusBar: '#f97316'
  },
  { 
    bg: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFB347 100%)', // Warm orange
    statusBar: '#FF6B35'
  },
];

function LegendaryLandingPage() {
  const [colorIndex, setColorIndex] = useState(0);
  
  // Update status bar color when background changes
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) metaThemeColor.setAttribute('content', BACKGROUND_COLORS[colorIndex].statusBar);

    return () => {
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#1a1a1a');
    };
  }, [colorIndex]);

  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; role: 'client' | 'owner' }>({
    isOpen: false,
    role: 'client'
  });

  // Lantern sweep animation cycle state
  const [sweepCycle, setSweepCycle] = useState(0);

  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setSweepCycle(1);
    }, 1500);

    const interval = setInterval(() => {
      setSweepCycle(prev => prev + 1);
    }, 12000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  const openAuthDialog = (role: 'client' | 'owner') => setAuthDialog({ isOpen: true, role });
  const closeAuthDialog = () => setAuthDialog({ isOpen: false, role: 'client' });

  // Handle tap on background to change color (not on buttons)
  const handleBackgroundTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only change color if clicking on background, not on buttons
    if ((e.target as HTMLElement).closest('button')) return;
    setColorIndex(prev => (prev + 1) % BACKGROUND_COLORS.length);
  };

  return (
    <div 
      className="min-h-screen min-h-dvh flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden transition-all duration-500 ease-out cursor-pointer"
      style={{ background: BACKGROUND_COLORS[colorIndex].bg }}
      onClick={handleBackgroundTap}
    >
      {/* Subtle overlay for depth */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8 max-w-2xl w-full px-4 safe-area-pt">
        {/* Title - Swipess Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="space-y-4"
        >
          <SwipessLogo size="3xl" />
          <p className="text-white text-xl sm:text-2xl font-medium whitespace-nowrap">
            Swipe and find your perfect deal
          </p>
        </motion.div>

        {/* Buttons Container with Lantern Sweep Animation */}
        <div className="space-y-3 mt-8">
          <motion.button
            key={`client-btn-${sweepCycle}`}
            type="button"
            onClick={() => openAuthDialog('client')}
            className="w-full max-w-sm mx-auto h-14 px-8 text-white font-bold text-base sm:text-lg rounded-xl flex items-center justify-center gap-3 backdrop-blur-sm border border-white/40 relative overflow-hidden lantern-sweep"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0ea5e9, #3b82f6, #6366f1)',
              boxShadow: '0 4px 20px rgba(6,182,212,0.4)'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <span
              key={`sweep-a-${sweepCycle}`}
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
              style={{
                animation: sweepCycle > 0 ? 'lantern-sweep 1.2s ease-in-out forwards' : 'none',
              }}
            >
              <span
                className="absolute top-0 left-0 w-1/2 h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 75%, transparent 100%)',
                  transform: 'skewX(-15deg)',
                  animation: sweepCycle > 0 ? 'lantern-sweep 1.2s ease-in-out forwards' : 'none',
                }}
              />
            </span>
            <UserCircle className="w-5 h-5 relative z-10" />
            <span className="drop-shadow-lg relative z-10">I'm a Client</span>
            <ChevronRight className="w-5 h-5 relative z-10" />
          </motion.button>

          <motion.button
            key={`owner-btn-${sweepCycle}`}
            type="button"
            onClick={() => openAuthDialog('owner')}
            className="w-full max-w-sm mx-auto h-14 px-8 text-white font-bold text-base sm:text-lg rounded-xl flex items-center justify-center gap-3 backdrop-blur-sm border border-white/40 relative overflow-hidden lantern-sweep"
            style={{
              background: 'linear-gradient(135deg, #f43f5e, #ec4899, #d946ef, #a855f7)',
              boxShadow: '0 4px 20px rgba(236,72,153,0.4)'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <span
              key={`sweep-b-${sweepCycle}`}
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
            >
              <span
                className="absolute top-0 left-0 w-1/2 h-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 75%, transparent 100%)',
                  transform: 'skewX(-15deg)',
                  animation: sweepCycle > 0 ? 'lantern-sweep 1.2s ease-in-out 1s forwards' : 'none',
                }}
              />
            </span>
            <Key className="w-5 h-5 relative z-10" />
            <span className="drop-shadow-lg relative z-10">I'm an Owner</span>
            <ChevronRight className="w-5 h-5 relative z-10" />
          </motion.button>
        </div>

        {/* Bottom Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="pt-4 space-y-2"
        >
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-white/90 text-xs font-medium">Perfect Deals</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full border border-white/20">
              <Shield className="w-3.5 h-3.5 text-white" />
              <span className="text-white/90 text-xs font-medium">Secure Chat</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full border border-white/20">
              <Users className="w-3.5 h-3.5 text-white" />
              <span className="text-white/90 text-xs font-medium">Instant Connect</span>
            </div>
          </div>
          
        </motion.div>
      </div>

      <AuthDialog isOpen={authDialog.isOpen} onClose={closeAuthDialog} role={authDialog.role} />
    </div>
  );
}

export default memo(LegendaryLandingPage);
