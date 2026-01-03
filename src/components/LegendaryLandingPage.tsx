import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Key, Shield, Sparkles, UserCircle, Users } from 'lucide-react';
import { AuthDialog } from './AuthDialog';
import { SwipessLogo } from './SwipessLogo';

function LegendaryLandingPage() {
  // Set orange status bar for landing page
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#f97316');

    return () => {
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#1a1a1a');
    };
  }, []);

  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; role: 'client' | 'owner' }>({
    isOpen: false,
    role: 'client'
  });

  const openAuthDialog = (role: 'client' | 'owner') => setAuthDialog({ isOpen: true, role });
  const closeAuthDialog = () => setAuthDialog({ isOpen: false, role: 'client' });

  return (
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Static mesh gradient - no animation for performance */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 30%, rgba(249, 115, 22, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)'
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
          <p className="text-white/80 text-2xl sm:text-3xl font-medium px-4 max-w-md mx-auto">
            Swipe and find your perfect deal
          </p>
        </motion.div>

        {/* Buttons Container (tap only; swipe effects removed) */}
        <div className="space-y-3 mt-8">
          <motion.button
            type="button"
            onClick={() => openAuthDialog('client')}
            className="w-full max-w-sm mx-auto h-14 px-8 text-white font-bold text-base sm:text-lg rounded-xl flex items-center justify-center gap-3 backdrop-blur-sm border border-white/40 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0ea5e9, #3b82f6, #6366f1)',
              boxShadow: '0 4px 20px rgba(6,182,212,0.4)'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <UserCircle className="w-5 h-5" />
            <span className="drop-shadow-lg">I'm a Client</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            type="button"
            onClick={() => openAuthDialog('owner')}
            className="w-full max-w-sm mx-auto h-14 px-8 text-white font-bold text-base sm:text-lg rounded-xl flex items-center justify-center gap-3 backdrop-blur-sm border border-white/40 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #f43f5e, #ec4899, #d946ef, #a855f7)',
              boxShadow: '0 4px 20px rgba(236,72,153,0.4)'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Key className="w-5 h-5" />
            <span className="drop-shadow-lg">I'm an Owner</span>
            <ChevronRight className="w-5 h-5" />
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

      <AuthDialog isOpen={authDialog.isOpen} onClose={closeAuthDialog} role={authDialog.role} />
    </div>
  );
}

export default memo(LegendaryLandingPage);
