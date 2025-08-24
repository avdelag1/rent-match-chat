
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Home, Shield, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-primary flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <div className="relative z-10 w-full max-w-md mx-auto animate-slide-up">
        {/* Logo and title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-5xl font-bold text-white tracking-tight">
              TINDERENT
            </h1>
            <span className="text-4xl ml-2 animate-float">🔥</span>
          </div>
          <p className="text-lg text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Find your perfect rental property or tenant with ease.
          </p>
        </div>

        {/* Role selection cards */}
        <div className="space-y-4 mb-8">
          <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="p-6">
              <Button 
                onClick={() => openAuthDialog('client')}
                className="w-full bg-gradient-button hover:bg-gradient-button/90 text-white font-semibold text-lg py-6 rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 animate-pulse-glow"
                size="lg"
              >
                <Home className="mr-3 h-5 w-5" />
                I'm a Client
              </Button>
            </div>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="p-6">
              <Button 
                onClick={() => openAuthDialog('owner')}
                variant="secondary"
                className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg py-6 rounded-xl shadow-lg hover:shadow-glow transition-all duration-300"
                size="lg"
              >
                <Shield className="mr-3 h-5 w-5" />
                I'm an Owner
              </Button>
            </div>
          </Card>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Smart Matching</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Premium Features</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Verified Owners</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Join thousands of happy users finding their perfect match</p>
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
