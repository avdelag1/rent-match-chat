
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
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-pink-500 to-red-500 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Logo and title */}
        <div className="text-center mb-16">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative mb-4 w-full flex justify-center">
              <h1 className="font-brand text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
                TINDERENT
              </h1>
              {/* Clean modern shadow */}
              <div className="absolute inset-0 font-brand text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white/20 blur-sm transform translate-x-0.5 translate-y-0.5">
                TINDERENT
              </div>
            </div>
            <span className="text-3xl animate-bounce filter drop-shadow-md">🔥</span>
          </div>
          <p className="text-lg text-gray-200 px-4 leading-relaxed font-light">
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
