import { DashboardLayout } from "@/components/DashboardLayout";
import { OwnerProfileDialog } from "@/components/OwnerProfileDialog";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerStats } from "@/hooks/useOwnerStats";
import { useOwnerProfile } from "@/hooks/useOwnerProfile";
import {
  User, Mail, Calendar, Building2, Eye, MessageCircle,
  LogOut, Settings, Shield, Bell, Crown, ChevronRight, Camera, ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fastSpring = { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.8 };

const OwnerProfile = () => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { user, signOut } = useAuth();
  const { data: stats, isLoading: statsLoading } = useOwnerStats();
  const { data: ownerProfile, isLoading: profileLoading } = useOwnerProfile();
  const navigate = useNavigate();

  const isLoading = statsLoading || profileLoading;

  if (isLoading) {
    return (
      <DashboardLayout userRole="owner">
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

  const menuItems = [
    { icon: User, label: 'Edit Profile', action: (_e: React.MouseEvent) => setShowEditDialog(true), color: 'text-blue-500' },
    { icon: Building2, label: 'Manage Listings', action: (_e: React.MouseEvent) => navigate('/owner/properties'), color: 'text-primary' },
    { icon: Crown, label: 'Subscription', action: (_e: React.MouseEvent) => navigate('/subscription-packages'), color: 'text-amber-500' },
    { icon: Settings, label: 'Settings', action: (_e: React.MouseEvent) => navigate('/owner/settings'), color: 'text-gray-500' },
    { icon: Shield, label: 'Security', action: (_e: React.MouseEvent) => navigate('/owner/security'), color: 'text-green-500' },
    { icon: Bell, label: 'Notifications', action: (_e: React.MouseEvent) => navigate('/notifications'), color: 'text-blue-500' },
  ];

  return (
    <DashboardLayout userRole="owner">
      <div className="w-full px-5 py-4 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-2 text-muted-foreground hover:text-foreground"
          >
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
                onClick={() => setShowEditDialog(true)}
              >
                {ownerProfile?.profile_images?.[0] ? (
                  <img 
                    src={ownerProfile.profile_images[0]} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-primary-foreground" />
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
                {ownerProfile?.business_name || 'Set up your business'}
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </motion.div>

          {/* Business Stats */}
          <motion.div
            className="grid grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fastSpring, delay: 0.05 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <Building2 className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">{stats?.activeProperties || 0}</div>
                <div className="text-xs text-muted-foreground">Listings</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">{stats?.totalInquiries || 0}</div>
                <div className="text-xs text-muted-foreground">Views</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <MessageCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">{stats?.activeMatches || 0}</div>
                <div className="text-xs text-muted-foreground">Inquiries</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fastSpring, delay: 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Account Info</h3>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground text-sm">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground text-sm">
                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {ownerProfile?.business_location && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground text-sm">{ownerProfile.business_location}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Menu */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fastSpring, delay: 0.15 }}
          >
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => item.action(e)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="flex-1 text-left text-foreground">{item.label}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fastSpring, delay: 0.2 }}
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

      <OwnerProfileDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />
    </DashboardLayout>
  );
};

export default OwnerProfile;
