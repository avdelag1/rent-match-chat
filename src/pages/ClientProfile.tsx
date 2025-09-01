import { DashboardLayout } from "@/components/DashboardLayout";
import { ClientProfileDialog } from "@/components/ClientProfileDialog";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClientProfile } from "@/hooks/useClientProfile";

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
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">My Profile</h1>
            <p className="text-white/80">Manage your profile information and preferences.</p>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/90 text-sm font-medium">Name</label>
                      <p className="text-white mt-1">{profile.name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-white/90 text-sm font-medium">Age</label>
                      <p className="text-white mt-1">{profile.age || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-white/90 text-sm font-medium">Bio</label>
                    <p className="text-white mt-1">{profile.bio || 'No bio added yet'}</p>
                  </div>

                  <div>
                    <label className="text-white/90 text-sm font-medium">Interests</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.interests?.map((interest, index) => (
                        <span key={index} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                          {interest}
                        </span>
                      )) || <p className="text-white/60">No interests added</p>}
                    </div>
                  </div>

                  <Button 
                    onClick={() => setShowEditDialog(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/80 mb-4">Complete your profile to get better matches!</p>
                  <Button 
                    onClick={() => setShowEditDialog(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Create Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ClientProfileDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
      />
    </DashboardLayout>
  );
};

export default ClientProfile;