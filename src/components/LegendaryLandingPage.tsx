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
    <div className="min-h-screen relative overflow-hidden bg-theme-primary">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 opacity-20 rounded-full blur-3xl"
          style={{ background: 'var(--accent-gradient)' }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 opacity-20 rounded-full blur-3xl"
          style={{ background: 'var(--accent-gradient)' }}
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-8 text-theme-text-primary"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          >
            TINDERENT 🔥
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-theme-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          >
            Swipe your way to the perfect rental match. Modern property discovery meets intuitive design.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="w-64 h-16 text-lg font-semibold text-white border-none relative overflow-hidden"
                style={{ 
                  background: 'var(--accent-gradient)',
                  boxShadow: 'var(--shadow-lg)'
                }}
                onClick={() => openAuthDialog('client')}
              >
                I'm Looking for a Place
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="w-64 h-16 text-lg font-semibold border-2 bg-transparent text-theme-text-primary hover:text-white transition-all duration-300"
                style={{ 
                  borderColor: 'var(--accent-primary)',
                  boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-gradient)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onClick={() => openAuthDialog('owner')}
              >
                I'm a Property Owner
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

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