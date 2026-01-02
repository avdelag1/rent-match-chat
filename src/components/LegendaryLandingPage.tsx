import { useState, useRef, useCallback, memo, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Users, Key, UserCircle, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { AuthDialog } from './AuthDialog';
import { SwipessLogo } from './SwipessLogo';

function LegendaryLandingPage() {
  // Set orange status bar for landing page
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#f97316');
    }
    
    return () => {
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

  const [swipeProgress, setSwipeProgress] = useState<{ client: number; owner: number }>({ client: 0, owner: 0 });
  const [isDragging, setIsDragging] = useState<{ client: boolean; owner: boolean }>({ client: false, owner: false });
  const [dragPosition, setDragPosition] = useState<{ client: { x: number; rotate: number }; owner: { x: number; rotate: number } }>({
    client: { x: 0, rotate: 0 },
    owner: { x: 0, rotate: 0 }
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const clientControls = useAnimation();
  const ownerControls = useAnimation();
  const SWIPE_THRESHOLD = 150;
  const MAX_ROTATION = 15; // degrees

  const handleDragStart = useCallback((role: 'client' | 'owner') => {
    setIsDragging(prev => ({ ...prev, [role]: true }));
  }, []);

  const handleDrag = useCallback((role: 'client' | 'owner', info: { offset: { x: number } }) => {
    // Calculate rotation based on drag distance (like Tinder cards)
    const rotation = (info.offset.x / SWIPE_THRESHOLD) * MAX_ROTATION;
    const clampedRotation = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, rotation));

    // Update real-time position and rotation
    setDragPosition(prev => ({
      ...prev,
      [role]: { x: info.offset.x, rotate: clampedRotation }
    }));

    // Track progress for background fill
    const progress = Math.min(Math.abs(info.offset.x) / SWIPE_THRESHOLD, 1);
    setSwipeProgress(prev => ({ ...prev, [role]: progress }));
  }, []);

  const handleDragEnd = useCallback((role: 'client' | 'owner', info: { offset: { x: number }; velocity: { x: number } }) => {
    const controls = role === 'client' ? clientControls : ownerControls;
    setIsDragging(prev => ({ ...prev, [role]: false }));

    const absOffset = Math.abs(info.offset.x);
    const absVelocity = Math.abs(info.velocity.x);
    const direction = info.offset.x > 0 ? 1 : -1;

    // Swipe threshold met - trigger action
    if (absOffset >= SWIPE_THRESHOLD || absVelocity > 500) {
      const finalX = 400 * direction;
      const finalRotation = MAX_ROTATION * direction * 1.5;

      // Animate off-screen with rotation
      controls.start({
        x: finalX,
        rotate: finalRotation,
        opacity: 0,
        transition: { type: "spring", stiffness: 300, damping: 25 }
      });

      setSwipeProgress(prev => ({ ...prev, [role]: 1 }));

      setTimeout(() => {
        setSwipeProgress(prev => ({ ...prev, [role]: 0 }));
        setDragPosition(prev => ({ ...prev, [role]: { x: 0, rotate: 0 } }));
        controls.start({
          x: 0,
          rotate: 0,
          opacity: 1,
          transition: { type: "spring", stiffness: 300, damping: 25 }
        });
        openAuthDialog(role);
      }, 200);
    } else {
      // Snap back to center with smooth spring
      controls.start({
        x: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 500, damping: 30 }
      });
      setDragPosition(prev => ({ ...prev, [role]: { x: 0, rotate: 0 } }));
      setSwipeProgress(prev => ({ ...prev, [role]: 0 }));
    }
  }, [clientControls, ownerControls]);

  const openAuthDialog = (role: 'client' | 'owner') => {
    setAuthDialog({ isOpen: true, role });
  };

  const closeAuthDialog = () => {
    setAuthDialog({ isOpen: false, role: 'client' });
  };

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen min-h-dvh flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
    >
      {/* Static mesh gradient - no animation for performance */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 30%, rgba(249, 115, 22, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)'
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
          <SwipessLogo size="2xl" />
          <p className="text-white/80 text-lg sm:text-xl font-medium px-4 max-w-md mx-auto">
            Swipe and find your perfect deal
          </p>
        </motion.div>

        {/* Buttons Container */}
        <div className="space-y-2 mt-8">

          {/* I'm a Client Button */}
          <div className="relative w-full max-w-sm mx-auto h-14">
            {/* Track background */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-indigo-950/80 border border-cyan-500/30 overflow-hidden">
              {/* Progress fill - only animates when dragging */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-indigo-500/40 transition-[width] duration-75"
                style={{ width: `${swipeProgress.client * 100}%` }}
              />
              {/* CSS shimmer - GPU accelerated */}
              <div className="absolute inset-0 shimmer-animation" />
              {/* Hint text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span 
                  className={`text-white/40 text-sm font-medium flex items-center gap-1 transition-opacity duration-200 ${isDragging.client ? 'opacity-0' : 'opacity-100'}`}
                >
                  <ChevronRight className="w-4 h-4 animate-pulse-subtle" />
                  <ChevronRight className="w-4 h-4 -ml-2 animate-pulse-subtle" />
                  <span className="ml-1">Swipe to continue</span>
                </span>
              </div>
            </div>

            {/* Draggable button */}
            <motion.button
              onClick={() => !isDragging.client && openAuthDialog('client')}
              drag="x"
              dragConstraints={{ left: -300, right: 300 }}
              dragElastic={0.7}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              animate={clientControls}
              onDragStart={() => handleDragStart('client')}
              onDrag={(_, info) => handleDrag('client', info)}
              onDragEnd={(_, info) => handleDragEnd('client', info)}
              className="w-full py-3 px-8 text-white font-bold text-base sm:text-lg rounded-xl flex items-center justify-center gap-3 backdrop-blur-sm border border-white/40 relative overflow-visible cursor-grab active:cursor-grabbing touch-pan-y select-none"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #0ea5e9, #3b82f6, #6366f1)',
                boxShadow: isDragging.client
                  ? '0 8px 30px rgba(6,182,212,0.6)'
                  : '0 4px 20px rgba(6,182,212,0.4)',
                rotate: dragPosition.client.rotate,
              }}
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <UserCircle className="w-5 h-5" />
              <span className="drop-shadow-lg">I'm a Client</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* I'm an Owner Button */}
          <div className="relative w-full max-w-sm mx-auto h-14">
            {/* Track background */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-950/80 to-purple-950/80 border border-pink-500/30 overflow-hidden">
              {/* Progress fill */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-violet-500/40 transition-[width] duration-75"
                style={{ width: `${swipeProgress.owner * 100}%` }}
              />
              {/* CSS shimmer */}
              <div className="absolute inset-0 shimmer-animation" style={{ animationDelay: '1s' }} />
              {/* Hint text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span 
                  className={`text-white/40 text-sm font-medium flex items-center gap-1 transition-opacity duration-200 ${isDragging.owner ? 'opacity-0' : 'opacity-100'}`}
                >
                  <ChevronRight className="w-4 h-4 animate-pulse-subtle" />
                  <ChevronRight className="w-4 h-4 -ml-2 animate-pulse-subtle" />
                  <span className="ml-1">Swipe to continue</span>
                </span>
              </div>
            </div>

            {/* Draggable button */}
            <motion.button
              onClick={() => !isDragging.owner && openAuthDialog('owner')}
              drag="x"
              dragConstraints={{ left: -300, right: 300 }}
              dragElastic={0.7}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              animate={ownerControls}
              onDragStart={() => handleDragStart('owner')}
              onDrag={(_, info) => handleDrag('owner', info)}
              onDragEnd={(_, info) => handleDragEnd('owner', info)}
              className="w-full py-3 px-8 text-white font-bold text-base sm:text-lg rounded-xl flex items-center justify-center gap-3 backdrop-blur-sm border border-white/40 relative overflow-visible cursor-grab active:cursor-grabbing touch-pan-y select-none"
              style={{
                background: 'linear-gradient(135deg, #f43f5e, #ec4899, #d946ef, #a855f7)',
                boxShadow: isDragging.owner
                  ? '0 8px 30px rgba(236,72,153,0.6)'
                  : '0 4px 20px rgba(236,72,153,0.4)',
                rotate: dragPosition.owner.rotate,
              }}
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Key className="w-5 h-5" />
              <span className="drop-shadow-lg">I'm an Owner</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Bottom Info Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="pt-4 space-y-2"
        >
          {/* Features badges - static, no hover animations */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white/70 text-xs font-medium">Perfect Deals</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span className="text-white/70 text-xs font-medium">Secure Chat</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-white/70 text-xs font-medium">Instant Connect</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Auth Dialog */}
      <AuthDialog isOpen={authDialog.isOpen} onClose={closeAuthDialog} role={authDialog.role} />
    </div>
  );
}

export default memo(LegendaryLandingPage);