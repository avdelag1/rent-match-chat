import { DashboardLayout } from "@/components/DashboardLayout";
import { ClientProfileDialog } from "@/components/ClientProfileDialog";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClientProfile } from "@/hooks/useClientProfile";
import { motion } from "framer-motion";

const ClientProfile = () => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { data: profile, isLoading } = useClientProfile();

  // Auto-open dialog if no profile exists yet
  useEffect(() => {
    if (!isLoading && !profile) {
      setShowEditDialog(true);
    }
  }, [profile, isLoading]);

  return (
    <DashboardLayout userRole="client">
      <motion.div 
        className="p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-4">My Profile</h1>
            <p className="text-muted-foreground">Manage your profile information and preferences.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Card className="dynamic-card interactive-card bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile ? (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">Name</label>
                        <p className="text-card-foreground mt-1">{profile.name || 'Not set'}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">Age</label>
                        <p className="text-card-foreground mt-1">{profile.age || 'Not set'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">Bio</label>
                      <p className="text-card-foreground mt-1">{profile.bio || 'No bio added yet'}</p>
                    </div>

                    <div>
                      <label className="text-muted-foreground text-sm font-medium">Interests</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.interests?.map((interest, index) => (
                          <motion.span 
                            key={index} 
                            className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {interest}
                          </motion.span>
                        )) || <p className="text-muted-foreground">No interests added</p>}
                      </div>
                    </div>

                    <Button 
                      onClick={() => setShowEditDialog(true)}
                      className="group bg-primary hover:bg-primary/90 transform transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <span className="group-hover:animate-pulse">Edit Profile</span>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Complete your profile to get better matches!</p>
                    <Button 
                      onClick={() => setShowEditDialog(true)}
                      className="group bg-primary hover:bg-primary/90 transform transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <span className="group-hover:animate-pulse">Create Profile</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <ClientProfileDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />
    </DashboardLayout>
  );
};

export default ClientProfile;