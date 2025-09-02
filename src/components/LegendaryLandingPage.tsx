import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthDialog } from "./AuthDialog";
import { Heart, Zap, Crown, Star, Users, Home, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const LegendaryLandingPage = () => {
  const [authDialog, setAuthDialog] = useState<{ isOpen: boolean; role: 'client' | 'owner' | null }>({
    isOpen: false,
    role: null
  });

  const [stats, setStats] = useState({
    users: 0,
    matches: 0,
    properties: 0
  });

  // Animate numbers on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        users: 12847,
        matches: 3249,
        properties: 5672
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const openAuthDialog = (role: 'client' | 'owner') => {
    setAuthDialog({ isOpen: true, role });
  };

  const closeAuthDialog = () => {
    setAuthDialog({ isOpen: false, role: null });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">TINDERENT</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <motion.div 
        className="relative z-10 flex-1 flex flex-col items-center justify-center p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-4xl mx-auto text-center space-y-8">
          
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-none animate-pulse-glow">
              <Sparkles className="w-4 h-4 mr-1" />
              The Future of Property Matching
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Find Your Perfect
              <span className="gradient-text block">Match</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Revolutionary property matching that connects dream tenants with perfect landlords. 
              Swipe, match, and discover your ideal rental experience.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {stats.users.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">
                {stats.matches.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Successful Matches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {stats.properties.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Properties Listed</div>
            </div>
          </motion.div>

          {/* Action Cards */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            
            {/* Client Card */}
            <Card className="glass-morphism border-border/50 p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
                  onClick={() => openAuthDialog('client')}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto group-hover:animate-bounce-in">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">I'm a Tenant</h3>
                  <p className="text-muted-foreground text-sm">
                    Find your dream property with smart matching
                  </p>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 text-primary" />
                    Smart Property Matching
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    Super Likes & Priority
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    Verified Listings
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white">
                  Start Searching
                </Button>
              </div>
            </Card>

            {/* Owner Card */}
            <Card className="glass-morphism border-border/50 p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
                  onClick={() => openAuthDialog('owner')}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto group-hover:animate-bounce-in">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">I'm a Landlord</h3>
                  <p className="text-muted-foreground text-sm">
                    Find perfect tenants for your properties
                  </p>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-3 h-3 text-primary" />
                    Quality Tenant Matching
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Crown className="w-3 h-3 text-purple-400" />
                    Premium Visibility Boost
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    Verified Tenant Profiles
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white">
                  List Property
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Premium Teasers */}
          <motion.div variants={itemVariants} className="mt-12">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="outline" className="border-yellow-400/50 text-yellow-300">
                <Crown className="w-3 h-3 mr-1" />
                Premium Plans Available
              </Badge>
              <Badge variant="outline" className="border-blue-400/50 text-blue-300">
                <Zap className="w-3 h-3 mr-1" />
                10x Better Results
              </Badge>
              <Badge variant="outline" className="border-green-400/50 text-green-300">
                <Star className="w-3 h-3 mr-1" />
                Advanced Matching
              </Badge>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-muted-foreground text-sm">
        <p>© 2024 Tinderent. Revolutionizing property rentals one swipe at a time.</p>
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

export default LegendaryLandingPage;