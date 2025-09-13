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
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/15 to-black/30" />
      
      {/* Additional contrast layer for buttons */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
      
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
        <div className="space-y-6 mt-12">
          
          {/* I'm a Client Button - Smooth slide from left */}
          <motion.button
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ 
              duration: 0.25, 
              delay: 0.4,
              ease: [0.68, -0.55, 0.265, 1.55]
            }}
            whileHover={{ 
              scale: 1.05,
              y: -3,
              boxShadow: "0 20px 40px rgba(255, 138, 0, 0.4), 0 8px 25px rgba(0,0,0,0.15)",
              transition: { type: "spring", bounce: 0.4, duration: 0.3 }
            }}
            whileTap={{ 
              scale: 0.98,
              y: 0,
              transition: { type: "spring", bounce: 0.7, duration: 0.15 }
            }}
            onClick={() => openAuthDialog('client')}
            className="w-full py-5 px-8 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold text-lg rounded-full shadow-xl border-0 hover:from-orange-500 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
            style={{ 
              boxShadow: '0 10px 30px rgba(255, 138, 0, 0.3), 0 4px 15px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #FF8A00 0%, #FF6B00 100%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <Users className="w-6 h-6 relative z-10" />
            <span className="relative z-10">I'm a Client</span>
          </motion.button>

          {/* I'm an Owner Button - Smooth slide from right */}
          <motion.button
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ 
              duration: 0.25, 
              delay: 0.55,
              ease: [0.68, -0.55, 0.265, 1.55]
            }}
            whileHover={{ 
              scale: 1.05,
              y: -3,
              boxShadow: "0 20px 40px rgba(239, 68, 68, 0.4), 0 8px 25px rgba(0,0,0,0.15)",
              transition: { type: "spring", bounce: 0.4, duration: 0.3 }
            }}
            whileTap={{ 
              scale: 0.98,
              y: 0,
              transition: { type: "spring", bounce: 0.7, duration: 0.15 }
            }}
            onClick={() => openAuthDialog('owner')}
            className="w-full py-5 px-8 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg rounded-full shadow-xl border-0 hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
            style={{ 
              boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3), 0 4px 15px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <Heart className="w-6 h-6 relative z-10" />
            <span className="relative z-10">I'm an Owner</span>
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