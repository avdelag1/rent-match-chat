import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthDialog } from "./AuthDialog";
import { motion } from "framer-motion";

const LegendaryLandingPage = () => {
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; role: 'client' | 'owner' | null }>({
    isOpen: false,
    role: null
  });

  const openAuthDialog = (role: 'client' | 'owner') => {
    setAuthDialog({ isOpen: true, role });
  };

  const closeAuthDialog = () => {
    setAuthDialog({ isOpen: false, role: null });
  };


  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Subtle background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/10 rounded-full animate-subtle-float"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-accent/20 rounded-full animate-subtle-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-20 w-1 h-1 bg-primary/15 rounded-full animate-subtle-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-secondary/10 rounded-full animate-subtle-float" style={{animationDelay: '1s'}}></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm mx-auto"
      >
        {/* Logo and title */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-5xl md:text-6xl font-bold gradient-text tracking-wider">
              TINDERENT
            </h1>
            <motion.span 
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, repeatDelay: 8 }}
              className="text-4xl ml-3"
            >
              🔥
            </motion.span>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg text-white/80 px-4 leading-relaxed"
          >
            Swipe your way to the perfect match
          </motion.p>
        </motion.div>

        {/* Role selection buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="subtle-hover-glow"
          >
            <Button 
              onClick={() => openAuthDialog('client')}
              className="w-full bg-gradient-button text-white font-bold text-lg py-8 rounded-full shadow-lg transition-all duration-500 hover:shadow-xl"
              size="lg"
            >
              🏠 I'm Looking for a Home
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="subtle-hover-glow"
          >
            <Button 
              onClick={() => openAuthDialog('owner')}
              className="w-full bg-gradient-to-r from-secondary to-accent text-white font-bold text-lg py-8 rounded-full shadow-lg transition-all duration-500 hover:shadow-xl"
              size="lg"
            >
              🏢 I'm a Property Owner
            </Button>
          </motion.div>
        </motion.div>

        {/* Features showcase */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center space-y-3 mb-8"
        >
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-2xl mb-1">💝</div>
              <p className="text-white/60 text-xs">Smart Matching</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-white/60 text-xs">Instant Connect</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-white/60 text-xs">Secure & Safe</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Auth Dialog */}
      {authDialog.role && (
        <AuthDialog
          isOpen={authDialog.isOpen}
          onClose={closeAuthDialog}
          role={authDialog.role}
        />
      )}
    </div>
  );
};

export default LegendaryLandingPage;