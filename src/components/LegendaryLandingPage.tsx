import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthDialog } from "./AuthDialog";
import { motion } from "framer-motion";
import { Flame, User, Home } from "lucide-react";

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
    <div className="min-h-screen relative overflow-hidden" 
         style={{ 
           background: 'linear-gradient(135deg, #ec4899 0%, #f97316 50%, #ea580c 100%)'
         }}>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-4xl mx-auto">
          
          {/* Flame Icon with Zoom Animation */}
          <motion.div 
            className="flex justify-center mb-12"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: "backOut",
              delay: 0.2 
            }}
          >
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Flame className="w-10 h-10 text-white" />
              </div>
            </div>
          </motion.div>
          
          {/* Title with Fade In */}
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-8 text-white tracking-wider"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          >
            TINDERENT
          </motion.h1>
          
          {/* Subtitle with Fade In */}
          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-16 max-w-2xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          >
            Find your perfect rental property or tenant with ease.
          </motion.p>

          {/* Buttons with Enhanced Bouncing Slide Animations */}
          <div className="flex flex-col gap-6 items-center max-w-md mx-auto">
            
            {/* Client Button - Slides from Left with Bounce */}
            <motion.div
              className="w-full"
              initial={{ x: -400, opacity: 0, scale: 0.3 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              transition={{ 
                delay: 1.0, 
                duration: 1.2,
                type: "spring",
                damping: 8,
                stiffness: 100,
                bounce: 0.6
              }}
              whileHover={{ 
                scale: 1.08,
                y: -5,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              whileTap={{ scale: 0.92 }}
            >
              <Button 
                size="lg" 
                className="w-full h-16 text-xl font-semibold text-white border-none rounded-full shadow-2xl bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 hover:shadow-3xl"
                onClick={() => openAuthDialog('client')}
              >
                <User className="mr-3 h-6 w-6" />
                I'm a Client
              </Button>
            </motion.div>
            
            {/* Owner Button - Slides from Right with Bounce */}
            <motion.div
              className="w-full"
              initial={{ x: 400, opacity: 0, scale: 0.3 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              transition={{ 
                delay: 1.3, 
                duration: 1.2,
                type: "spring",
                damping: 8,
                stiffness: 100,
                bounce: 0.6
              }}
              whileHover={{ 
                scale: 1.08,
                y: -5,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              whileTap={{ scale: 0.92 }}
            >
              <Button 
                size="lg" 
                className="w-full h-16 text-xl font-semibold text-white border-none rounded-full shadow-2xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transition-all duration-300 hover:shadow-3xl"
                onClick={() => openAuthDialog('owner')}
              >
                <Home className="mr-3 h-6 w-6" />
                I'm an Owner
              </Button>
            </motion.div>
          </div>
        </div>
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