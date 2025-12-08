import { PageTransition } from '@/components/PageTransition';
import { DashboardLayout } from "@/components/DashboardLayout";
import { OwnerProfileDialog } from "@/components/OwnerProfileDialog";
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerStats } from "@/hooks/useOwnerStats";
import { User, Mail, Calendar, MapPin, TrendingUp, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Faster animation configs
const fastSpring = { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.8 };

const OwnerProfile = () => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { user, signOut } = useAuth();
  const { data: stats, isLoading: statsLoading } = useOwnerStats();
  const navigate = useNavigate();

  return (
    <DashboardLayout userRole="owner">
      <motion.div
        className="w-full h-full overflow-y-auto p-4 sm:p-8 pb-24 sm:pb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={fastSpring}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fastSpring, delay: 0.05 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-4">Owner Profile</h1>
            <p className="text-muted-foreground">Manage your profile and business information.</p>
          </motion.div>

          <div className="grid gap-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fastSpring, delay: 0.08 }}
            >
              <Card className="dynamic-card interactive-card bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">Email</label>
                        <p className="text-card-foreground">{user?.email || 'Not available'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">Member Since</label>
                        <p className="text-card-foreground">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">Business Location</label>
                      <p className="text-muted-foreground">Not set - Click edit to add your business location</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowEditDialog(true)}
                      className="flex-1 group bg-primary hover:bg-primary/90 transform transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <span className="group-hover:animate-pulse">Edit Profile</span>
                    </Button>
                    <Button
                      onClick={signOut}
                      variant="outline"
                      className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transform transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Business Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fastSpring, delay: 0.12 }}
            >
              <Card className="dynamic-card interactive-card bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Business Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="text-center text-muted-foreground">Loading statistics...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <motion.div 
                        className="text-center p-4 rounded-lg hover:bg-muted/50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-2xl font-bold text-primary mb-2">{stats?.activeProperties || 0}</div>
                        <p className="text-muted-foreground">Active Properties</p>
                      </motion.div>
                      <motion.div 
                        className="text-center p-4 rounded-lg hover:bg-muted/50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-2xl font-bold text-primary mb-2">{stats?.totalInquiries || 0}</div>
                        <p className="text-muted-foreground">Total Inquiries</p>
                      </motion.div>
                      <motion.div 
                        className="text-center p-4 rounded-lg hover:bg-muted/50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-2xl font-bold text-primary mb-2">{stats?.activeMatches || 0}</div>
                        <p className="text-muted-foreground">Active Conversations</p>
                      </motion.div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Status */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fastSpring, delay: 0.16 }}
            >
              <Card className="dynamic-card interactive-card bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      className="w-full group bg-primary hover:bg-primary/90 transform transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={() => navigate('/owner/settings?tab=subscription')}
                    >
                      <span className="group-hover:animate-pulse">View Subscription Options</span>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Manage premium packages and messaging activations in Settings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <OwnerProfileDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />
    </DashboardLayout>
  );
};

export default OwnerProfile;