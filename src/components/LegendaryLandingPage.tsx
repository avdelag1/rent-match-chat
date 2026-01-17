import { memo, useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Shield, Sparkles, Users } from 'lucide-react';
import { AuthDialog } from './AuthDialog';
import { SwipessLogo } from './SwipessLogo';
import { AnimatedBackground, BackgroundTheme } from './AnimatedBackground';
import { RadioPlayer } from './RadioPlayer';

// Background themes with animations and radio stations
const BACKGROUND_THEMES = [
  {
    theme: 'stars' as BackgroundTheme,
    statusBar: '#0a0a0a',
    name: 'Starry Night'
  },
  {
    theme: 'ny-red' as BackgroundTheme,
    statusBar: '#FF4458',
    name: 'New York Vibes'
  },
  {
    theme: 'ducks' as BackgroundTheme,
    statusBar: '#FFD700',
    name: 'Happy Ducks'
  },
  {
    theme: 'vehicles-properties' as BackgroundTheme,
    statusBar: '#667eea',
    name: 'Urban Life'
  },
  {
    theme: 'sunset-coconuts' as BackgroundTheme,
    statusBar: '#FF6B35',
    name: 'Tropical Sunset'
  },
];

const SWIPE_THRESHOLD = 120;

function LegendaryLandingPage() {
  const [colorIndex, setColorIndex] = useState(0);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [radioEnabled, setRadioEnabled] = useState(false);
  const isDragging = useRef(false);

  // Motion values for swipe - straight horizontal movement
  const x = useMotionValue(0);
  
  // Fade out as it moves right (like being banished into light)
  const logoOpacity = useTransform(x, [0, 80, 200], [1, 0.6, 0]);
  
  // Scale down slightly as it fades
  const logoScale = useTransform(x, [0, 100, 200], [1, 0.95, 0.85]);
  
  // Blur effect increases as it moves right (like dissolving)
  const logoBlur = useTransform(x, [0, 80, 200], [0, 4, 12]);

  // Update status bar color when background changes
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) metaThemeColor.setAttribute('content', BACKGROUND_THEMES[colorIndex].statusBar);

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
    setColorIndex(prev => (prev + 1) % BACKGROUND_THEMES.length);
    // Auto-enable radio on first tap if not already enabled
    if (!radioEnabled) {
      setRadioEnabled(true);
    }
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
    
    // Reset position smoothly
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

  const currentTheme = BACKGROUND_THEMES[colorIndex];

  return (
    <div
      className="min-h-screen min-h-dvh flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden transition-all duration-500 ease-out cursor-pointer"
      onClick={handleBackgroundTap}
    >
      {/* Animated background */}
      <AnimatedBackground theme={currentTheme.theme} isActive={true} />

      {/* Subtle overlay for depth */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-6 max-w-2xl w-full px-4 safe-area-pt">
        {/* Swipable Swipess Logo - Only the logo moves */}
        <div className="space-y-6 text-center">
          <motion.div
            data-swipe-logo
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleTap}
            style={{ 
              x,
              opacity: logoOpacity,
              scale: logoScale,
              filter: useTransform(logoBlur, (v) => `blur(${v}px)`)
            }}
            whileTap={{ scale: 0.98 }}
            className="cursor-grab active:cursor-grabbing focus:outline-none group touch-none select-none relative inline-block"
          >
            <SwipessLogo size="3xl" />
            {/* Glow effect on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl -z-10"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
              }}
            />
          </motion.div>

          <motion.p 
            className="text-white text-xl sm:text-2xl font-medium whitespace-nowrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Swipe and find your perfect deal
          </motion.p>

          {/* Swipe hint */}
          <motion.p
            className="text-white/60 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Swipe right or tap to get started →
          </motion.p>
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

      {/* Auth Dialog - defaults to client role, user can switch roles after login */}
      <AuthDialog isOpen={authDialogOpen} onClose={closeAuthDialog} role="client" />

      {/* Radio Player */}
      <RadioPlayer
        stationKey={currentTheme.theme}
        isEnabled={radioEnabled}
        onToggle={() => setRadioEnabled(!radioEnabled)}
      />
    </div>
  );
}

export default memo(LegendaryLandingPage);
