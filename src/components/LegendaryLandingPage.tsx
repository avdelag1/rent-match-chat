import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Users } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-br from-red-400 via-red-500 to-orange-500">
      
      {/* Main Content */}
      <div className="relative z-10 text-center space-y-12 max-w-md w-full">
        
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
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          <h1 className="text-6xl font-bold text-white tracking-wider drop-shadow-lg text-center">
            TINDERENT
          </h1>
          <p className="text-white/90 text-xl font-medium px-4">
            Find your perfect rental property or tenant with ease.
          </p>
        </motion.div>

        {/* Buttons Container */}
        <div className="space-y-6 mt-16">
          
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
              transition: { type: "spring", bounce: 0.4, duration: 0.3 }
            }}
            whileTap={{ 
              scale: 0.98,
              y: 0,
              transition: { type: "spring", bounce: 0.7, duration: 0.15 }
            }}
            onClick={() => openAuthDialog('client')}
            className="w-full py-6 px-8 bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 text-white font-bold text-xl rounded-full shadow-2xl border-0 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden hover:shadow-3xl"
          >
            <Users className="w-6 h-6" />
            <span>I'm a Client</span>
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
              transition: { type: "spring", bounce: 0.4, duration: 0.3 }
            }}
            whileTap={{ 
              scale: 0.98,
              y: 0,
              transition: { type: "spring", bounce: 0.7, duration: 0.15 }
            }}
            onClick={() => openAuthDialog('owner')}
            className="w-full py-6 px-8 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white font-bold text-xl rounded-full shadow-2xl border-0 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden hover:shadow-3xl"
          >
            <Flame className="w-6 h-6" />
            <span>I'm an Owner</span>
          </motion.button>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-white/90 text-lg mt-12"
        >
          Choose your role to get started
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