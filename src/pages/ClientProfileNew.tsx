import { DashboardLayout } from "@/components/DashboardLayout";
import { ClientProfileDialog } from "@/components/ClientProfileDialog";
import { ClientPreferencesDialog } from "@/components/ClientPreferencesDialog";
import { PhotoPreview } from "@/components/PhotoPreview";
import { FilterColorPreferences } from "@/components/FilterColorPreferences";
import { ThemeSelector } from "@/components/ThemeSelector";
import { ShareDialog } from "@/components/ShareDialog";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import {
  LogOut, User, Camera, Sparkles, Crown,
  Share2, Radio, ArrowLeft, Flame, MessageCircle, Filter,
  Palette, Settings as SettingsIcon, Home, Bike, Ship, Car
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const fastSpring = { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.8 };

const ClientProfileNew = () => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const { data: profile, isLoading } = useClientProfile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handlePhotoClick = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoPreview(true);
  }, []);

  const handleRadioClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/radio');
  }, [navigate]);

  // Calculate profile completion
  const calculateCompletion = () => {
    if (!profile) return 0;
    let completed = 0;
    const total = 5;
    if (profile.name) completed++;
    if (profile.age) completed++;
    if (profile.bio) completed++;
    if (profile.profile_images?.length) completed++;
    if (profile.interests?.length) completed++;
    return Math.round((completed / total) * 100);
  };

  const completionPercent = calculateCompletion();

  if (isLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="w-full p-4 pb-32">
          <div className="max-w-lg mx-auto space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <div className="w-full px-5 py-4 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Profile Header */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={fastSpring}
          >
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => profile?.profile_images?.length ? handlePhotoClick(0) : setShowEditDialog(true)}
              >
                {profile?.profile_images?.[0] ? (
                  <img
                    src={profile.profile_images[0]}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-primary-foreground" />
                )}
              </div>
              <button
                onClick={() => setShowEditDialog(true)}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg"
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                {profile?.name || 'Set up your profile'}
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </motion.div>

          {/* Profile Completion */}
          {completionPercent < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fastSpring, delay: 0.05 }}
            >
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Complete your profile</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{completionPercent}%</span>
                  </div>
                  <Progress value={completionPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Complete profiles get more matches!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fastSpring, delay: 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">0</div>
                <div className="text-xs text-muted-foreground">Likes</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">0</div>
                <div className="text-xs text-muted-foreground">Matches</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <MessageCircle className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">0</div>
                <div className="text-xs text-muted-foreground">Chats</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* About & Interests Section */}
          {(profile?.bio || profile?.interests?.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fastSpring, delay: 0.15 }}
              className="space-y-3"
            >
              {profile?.bio && (
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">About</h3>
                    <p className="text-foreground">{profile.bio}</p>
                  </CardContent>
                </Card>
              )}

              {profile?.interests?.length > 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* My Preferences - PROMINENT PLACEMENT */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fastSpring, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <CardTitle>What I'm Looking For</CardTitle>
                </div>
                <CardDescription>
                  Set your preferences for properties and rentals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20 text-center">
                    <Home className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs font-medium">Properties</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-lg border border-red-500/20 text-center">
                    <Car className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <p className="text-xs font-medium">Motorcycles</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20 text-center">
                    <Bike className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-xs font-medium">Bicycles</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-lg border border-cyan-500/20 text-center">
                    <Ship className="w-6 h-6 text-cyan-500 mx-auto mb-1" />
                    <p className="text-xs font-medium">Yachts</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowPreferences(true)}
                  className="w-full"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Set My Preferences
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <Separator className="my-4" />

          {/* Personalization Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fastSpring, delay: 0.25 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-muted-foreground px-2">
              Personalization
            </h3>

            {/* Theme Selector */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">Theme</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Choose your preferred color theme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeSelector />
              </CardContent>
            </Card>

            {/* Filter Color Preferences */}
            <FilterColorPreferences compact />
          </motion.div>

          <Separator className="my-4" />

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fastSpring, delay: 0.3 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <button
                  onClick={handleRadioClick}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border"
                >
                  <Radio className="w-5 h-5 text-cyan-500" />
                  <span className="flex-1 text-left text-foreground">Radio</span>
                </button>
                <button
                  onClick={() => setShowShareDialog(true)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border"
                >
                  <Share2 className="w-5 h-5 text-purple-500" />
                  <span className="flex-1 text-left text-foreground">Share Profile</span>
                </button>
                <button
                  onClick={() => navigate('/subscription-packages')}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border"
                >
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span className="flex-1 text-left text-foreground">Subscription</span>
                </button>
                <button
                  onClick={() => navigate('/client/settings')}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  <SettingsIcon className="w-5 h-5 text-gray-500" />
                  <span className="flex-1 text-left text-foreground">Settings</span>
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fastSpring, delay: 0.35 }}
          >
            <Button
              onClick={signOut}
              variant="outline"
              className="w-full h-12 gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </motion.div>

          {/* Bottom spacing for navigation */}
          <div className="h-8" />
        </div>
      </div>

      <ClientProfileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <ClientPreferencesDialog
        open={showPreferences}
        onOpenChange={setShowPreferences}
      />

      <PhotoPreview
        photos={profile?.profile_images || []}
        isOpen={showPhotoPreview}
        onClose={() => setShowPhotoPreview(false)}
        initialIndex={selectedPhotoIndex}
      />

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        profileId={user?.id}
        title={profile?.name || 'My Profile'}
        description={`Check out ${profile?.name || 'this profile'} on Zwipes! See their interests, lifestyle, and more.`}
      />
    </DashboardLayout>
  );
};

export default ClientProfileNew;
