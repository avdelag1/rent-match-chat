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
    <div className="min-h-screen bg-black flex flex-col relative">

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-full max-w-lg mx-auto space-y-16">
          
          {/* Brand Section */}
          <div className="space-y-8">
            <div className="border-b border-white/10 pb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-white tracking-wider mb-2">
                TINDERENT
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto"></div>
            </div>
            
            <p className="text-xl text-white/70 leading-relaxed max-w-md mx-auto">
              Find your perfect rental property or tenant with ease.
            </p>
          </div>

          {/* Action Sections */}
          <div className="space-y-8">
            {/* Client Section */}
            <div className="border border-white/10 rounded-lg p-6 hover:border-primary/30 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-3">Looking for a place?</h3>
              <Button 
                size="lg"
                className="w-full h-14 text-lg font-medium bg-primary hover:bg-primary/90 text-white"
                onClick={() => openAuthDialog('client')}
              >
                I'm a Client
              </Button>
            </div>
            
            {/* Owner Section */}
            <div className="border border-white/10 rounded-lg p-6 hover:border-secondary/30 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-3">Have properties to rent?</h3>
              <Button 
                size="lg"
                className="w-full h-14 text-lg font-medium bg-secondary hover:bg-secondary/90 text-white"
                onClick={() => openAuthDialog('owner')}
              >
                I'm an Owner
              </Button>
            </div>
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