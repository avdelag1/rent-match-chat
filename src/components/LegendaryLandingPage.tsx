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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-800/40 to-blue-950/60"></div>
      
      <div className="relative z-10 w-full max-w-sm mx-auto">
        {/* Logo and title */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-wider">
              TINDERENT
            </h1>
            <span className="text-4xl ml-3">🔥</span>
          </div>
          <p className="text-lg text-slate-300 px-4 leading-relaxed">
            Find your perfect rental property or tenant with ease.
          </p>
        </div>

        {/* Role selection buttons */}
        <div className="space-y-6 mb-8">
          <Button 
            onClick={() => openAuthDialog('client')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg py-8 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-orange-500/25"
            size="lg"
          >
            I'm a Client
          </Button>

          <Button 
            onClick={() => openAuthDialog('owner')}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-lg py-8 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-red-500/25"
            size="lg"
          >
            I'm an Owner
          </Button>
        </div>

        {/* Subtle hint text */}
        <div className="text-center">
          <p className="text-slate-400 text-sm">
            Swipe your way to the perfect match
          </p>
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