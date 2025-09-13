import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Users, Heart } from 'lucide-react';
import { AuthDialog } from './AuthDialog';

export default function LegendaryLandingPage() {
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; role: 'client' | 'owner' }>({
    isOpen: false,
    role: 'client'
  });

  const openAuthDialog = (role: 'client' | 'owner') => {
    setAuthDialog({ isOpen: true, role });
  };

  const closeAuthDialog = () => {
    setAuthDialog({ isOpen: false, role: 'client' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--app-gradient)' }}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/20" />
      
      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8 max-w-md w-full">
        
        {/* Flame Icon - Zoom In Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            duration: 0.8, 
            delay: 0.2,
            bounce: 0.6 
          }}
          className="flex justify-center mb-6"
        >
          <div className="p-6 rounded-full bg-white/20 backdrop-blur-md shadow-theme-lg">
            <Flame className="w-16 h-16 text-white animate-pulse" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-2"
        >
          <h1 className="text-5xl font-bold text-white tracking-wider drop-shadow-lg">
            TINDERENT
          </h1>
          <p className="text-white/90 text-lg font-medium">
            Swipe Your Way to the Perfect Home
          </p>
        </motion.div>

        {/* Buttons Container */}
        <div className="space-y-4 mt-12">
          
          {/* I'm a Client Button - Slide from Left */}
          <motion.button
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              duration: 0.6, 
              delay: 0.4,
              bounce: 0.5
            }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)" 
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { type: "spring", bounce: 0.7, duration: 0.15 }
            }}
            onClick={() => openAuthDialog('client')}
            className="w-full py-4 px-6 bg-white/20 backdrop-blur-md text-white font-semibold text-lg rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-3"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <Users className="w-6 h-6" />
            I'm a Client
          </motion.button>

          {/* I'm an Owner Button - Slide from Right */}
          <motion.button
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ 
              type: "spring", 
              duration: 0.6, 
              delay: 0.6,
              bounce: 0.5
            }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)" 
            }}
            whileTap={{ 
              scale: 0.98,
              transition: { type: "spring", bounce: 0.7, duration: 0.15 }
            }}
            onClick={() => openAuthDialog('owner')}
            className="w-full py-4 px-6 bg-white/20 backdrop-blur-md text-white font-semibold text-lg rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-3"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <Heart className="w-6 h-6" />
            I'm an Owner
          </motion.button>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-white/80 text-sm mt-8"
        >
          Find your perfect match in real estate
        </motion.p>
      </div>

      {/* Auth Dialog */}
      <AuthDialog 
        isOpen={authDialog.isOpen}
        onClose={closeAuthDialog}
        role={authDialog.role}
      />
    </div>
  );
}