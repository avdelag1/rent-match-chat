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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-accent/15 flex flex-col relative overflow-hidden animate-dynamic-gradient">

      {/* Main Content - Centered */}
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-md mx-auto space-y-12">
          
          {/* Brand Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold gradient-text tracking-wider animate-glow-pulse">
              TINDERENT <span className="text-5xl animate-float">🔥</span>
            </h1>
            
            <p className="text-lg text-foreground/80 leading-relaxed px-4">
              Find your perfect rental property or tenant with ease.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4 w-full"
          >
            <Button 
              size="lg"
              className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-xl transform hover:scale-105 transition-all duration-300 animate-dynamic-gradient"
              onClick={() => openAuthDialog('client')}
            >
              I'm a Client
            </Button>
            
            <Button 
              size="lg"
              className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-secondary to-destructive hover:from-secondary/90 hover:to-destructive/90 text-white shadow-xl transform hover:scale-105 transition-all duration-300 animate-dynamic-gradient"
              onClick={() => openAuthDialog('owner')}
            >
              I'm an Owner
            </Button>
          </motion.div>
        </div>
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