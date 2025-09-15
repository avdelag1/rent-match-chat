
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Shield } from "lucide-react";
import { AuthDialog } from "./AuthDialog";

const LandingPage = () => {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-pink-500 to-red-500 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto">
        {/* Logo and title */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <h1 className="font-brand text-6xl sm:text-7xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 drop-shadow-2xl">
                TINDERENT
              </h1>
              {/* Enhanced shadow layers */}
              <div className="absolute inset-0 font-brand text-6xl sm:text-7xl font-black tracking-wider text-red-500/20 blur-sm transform translate-x-1 translate-y-1">
                TINDERENT
              </div>
              <div className="absolute inset-0 font-brand text-6xl sm:text-7xl font-black tracking-wider text-orange-500/10 blur-md transform translate-x-2 translate-y-2">
                TINDERENT
              </div>
              {/* Glowing underline */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse"></div>
            </div>
            <span className="text-4xl ml-4 animate-bounce-gentle filter drop-shadow-lg">🔥</span>
          </div>
          <p className="text-xl text-gray-300 px-4 leading-relaxed font-inter font-light">
            Find your perfect rental property or tenant with ease.
          </p>
        </div>

        {/* Role selection buttons */}
        <div className="space-y-4 mb-8">
          <Button 
            onClick={() => openAuthDialog('client')}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold text-lg py-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 active:animate-elastic-bounce"
            size="lg"
          >
            I'm a Client
          </Button>

          <Button 
            onClick={() => openAuthDialog('owner')}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-lg py-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 active:animate-elastic-bounce"
            size="lg"
          >
            I'm an Owner
          </Button>
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

export default LandingPage;
