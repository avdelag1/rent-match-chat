import { memo, useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Shield, Sparkles, Users } from 'lucide-react';
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

const SWIPE_THRESHOLD = 100;

function LegendaryLandingPage() {
  const [colorIndex, setColorIndex] = useState(0);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const isDragging = useRef(false);

  // Motion values for swipe
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 40, 80, 120], [0, 0.3, 0.6, 1]);

  // Update status bar color when background changes
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) metaThemeColor.setAttribute('content', BACKGROUND_COLORS[colorIndex].statusBar);

    return () => {
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#1a1a1a');
    };
  }, [colorIndex]);

  const openAuthDialog = () => setAuthDialogOpen(true);
  const closeAuthDialog = () => setAuthDialogOpen(false);

  // Handle tap on background to change color (not on the logo button)
  const handleBackgroundTap = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only change color if clicking on background, not on the logo button
    if ((e.target as HTMLElement).closest('[data-swipe-logo]')) return;
    setColorIndex(prev => (prev + 1) % BACKGROUND_COLORS.length);
  };

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    
    // If swiped right past threshold, open auth dialog
    if (offset > SWIPE_THRESHOLD) {
      openAuthDialog();
    }
    
    // Reset position
    x.set(0);
    
    // Reset dragging state after a short delay
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  };

  const handleTap = () => {
    // Only open if not dragging
    if (!isDragging.current) {
      openAuthDialog();
    }
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
      <div className="relative z-10 text-center space-y-6 max-w-2xl w-full px-4 safe-area-pt">
        {/* Swipable Swipess Logo */}
        <motion.div
          data-swipe-logo
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.4}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={handleTap}
          style={{ x, rotate }}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="space-y-4 cursor-grab active:cursor-grabbing focus:outline-none group relative touch-pan-y"
        >
          {/* Like overlay when swiping right */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/40 via-amber-400/30 to-yellow-600/40 backdrop-blur-sm" />
            <span className="text-4xl font-bold text-white drop-shadow-lg tracking-wider">START</span>
          </motion.div>

          {/* Logo with glow effect on hover */}
          <div className="relative">
            <SwipessLogo size="3xl" />
            {/* Glow effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl -z-10"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
              }}
            />
          </div>

          <p className="text-white text-xl sm:text-2xl font-medium whitespace-nowrap">
            Swipe and find your perfect deal
          </p>

          {/* Swipe hint */}
          <motion.p
            className="text-white/60 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Swipe right or tap to get started →
          </motion.p>
        </motion.div>

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

      {/* Auth Dialog - defaults to client role, user can switch roles after login */}
      <AuthDialog isOpen={authDialogOpen} onClose={closeAuthDialog} role="client" />
    </div>
  );
}

export default memo(LegendaryLandingPage);
