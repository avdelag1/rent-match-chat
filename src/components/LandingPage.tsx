
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-4 relative">
      
      <div className="relative z-10 w-full max-w-sm mx-auto">
        {/* Logo and title */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-4xl font-bold text-white tracking-wide">
              TINDERENT
            </h1>
            <span className="text-3xl ml-2">🔥</span>
          </div>
          <p className="text-lg text-gray-300 px-4 leading-relaxed">
            Find your perfect rental property or tenant with ease.
          </p>
        </div>

        {/* Role selection buttons */}
        <div className="space-y-4 mb-8">
          <Button 
            onClick={() => openAuthDialog('client')}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold text-lg py-6 rounded-full shadow-lg transition-all duration-300"
            size="lg"
          >
            I'm a Client
          </Button>

          <Button 
            onClick={() => openAuthDialog('owner')}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-lg py-6 rounded-full shadow-lg transition-all duration-300"
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
