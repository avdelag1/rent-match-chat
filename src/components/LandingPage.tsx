
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Shield } from "lucide-react";
import { AuthDialog } from "./AuthDialog";
import { Link } from "react-router-dom";

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
      
      {/* Enhanced background decorative elements with staggered animations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-red-600 to-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-red-500 to-red-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-pink-500 to-red-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-40 right-20 w-28 h-28 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-8 sm:px-12 flex-1 flex flex-col justify-center">
        {/* Logo and title with enhanced animations */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative mb-4 w-full flex justify-center px-4">
              <h1 className="font-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg text-center animate-scale-in">
                TINDE<span className="text-red-500">R</span>ENT
              </h1>
              {/* Enhanced layered shadow */}
              <div className="absolute inset-0 font-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white/20 blur-sm transform translate-x-0.5 translate-y-0.5">
                TINDE<span className="text-red-500">R</span>ENT
              </div>
              <div className="absolute inset-0 font-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-red-400/30 blur-md transform translate-x-1 translate-y-1">
                TINDE<span className="text-red-500">R</span>ENT
              </div>
            </div>
            <div className="text-5xl animate-bounce filter drop-shadow-2xl">🔥</div>
          </div>
          <p className="text-lg text-gray-200 px-6 leading-relaxed font-light text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Find your perfect rental property or tenant with ease.
          </p>
        </div>

        {/* Role selection buttons with enhanced animations */}
        <div className="space-y-4 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button 
            onClick={() => openAuthDialog('client')}
            className="group w-full bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-semibold text-lg py-7 rounded-full shadow-lg transform transition-all duration-150 hover:scale-105 hover:shadow-2xl active:scale-95 relative overflow-hidden will-change-transform"
            size="lg"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              I'm a Client
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
          </Button>

          <Button 
            onClick={() => openAuthDialog('owner')}
            className="group w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-lg py-7 rounded-full shadow-lg transform transition-all duration-150 hover:scale-105 hover:shadow-2xl active:scale-95 relative overflow-hidden will-change-transform"
            size="lg"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              I'm an Owner
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
          </Button>
        </div>
      </div>

      {/* Footer with Terms & Privacy */}
      <footer className="relative z-10 w-full py-6 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <Link 
            to="/terms-of-service" 
            className="hover:text-white transition-colors duration-150 underline-offset-2 hover:underline"
          >
            Terms of Service
          </Link>
          <span className="text-gray-600">•</span>
          <Link 
            to="/privacy-policy" 
            className="hover:text-white transition-colors duration-150 underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
        <p className="text-xs text-gray-500 mt-2">© 2025 TindeRent. All rights reserved.</p>
      </footer>

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
