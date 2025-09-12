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
        <div className="absolute -top-40 -right-40 w-80 h-80 opacity-10 rounded-full blur-3xl animate-pulse" 
             style={{ backgroundColor: 'var(--accent-primary)' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 opacity-10 rounded-full blur-3xl animate-pulse animation-delay-1000"
             style={{ backgroundColor: 'var(--accent-primary)' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="animate-fade-in max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 text-theme-text-primary">
            TINDERENT 🔥
          </h1>
          
          <p className="text-xl md:text-2xl text-theme-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
            Swipe your way to the perfect rental match. Modern property discovery meets intuitive design.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="w-64 h-16 text-lg font-semibold text-white shadow-theme-lg hover:shadow-theme-lg transition-all duration-300 transform hover:scale-105 border-none"
              style={{ 
                background: 'var(--accent-gradient)'
              }}
              onClick={() => openAuthDialog('client')}
            >
              I'm Looking for a Place
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-64 h-16 text-lg font-semibold border-2 bg-transparent text-theme-text-primary hover:text-white shadow-theme-lg hover:shadow-theme-lg transition-all duration-300 transform hover:scale-105"
              style={{ 
                borderColor: 'var(--accent-primary)'
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