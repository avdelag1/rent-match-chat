import { DashboardLayout } from "@/components/DashboardLayout";
import { OwnerProfileDialog } from "@/components/OwnerProfileDialog";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerStats } from "@/hooks/useOwnerStats";
import { User, Mail, Calendar, MapPin, TrendingUp } from "lucide-react";

const OwnerProfile = () => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useOwnerStats();

  return (
    <DashboardLayout userRole="owner">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Owner Profile</h1>
            <p className="text-white/80">Manage your profile and business information.</p>
          </div>

          <div className="grid gap-6">
            {/* Basic Information */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-white/60" />
                    <div>
                      <label className="text-white/90 text-sm font-medium">Email</label>
                      <p className="text-white">{user?.email || 'Not available'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-white/60" />
                    <div>
                      <label className="text-white/90 text-sm font-medium">Member Since</label>
                      <p className="text-white">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-white/60" />
                  <div>
                    <label className="text-white/90 text-sm font-medium">Business Location</label>
                    <p className="text-white/60">Not set - Click edit to add your business location</p>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowEditDialog(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Business Stats */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Business Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="text-center text-white/60">Loading statistics...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-2">{stats?.activeProperties || 0}</div>
                      <p className="text-white/60">Active Properties</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-2">{stats?.totalInquiries || 0}</div>
                      <p className="text-white/60">Total Inquiries</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-2">{stats?.activeMatches || 0}</div>
                      <p className="text-white/60">Active Conversations</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Subscription Plan</p>
                    <p className="text-white/60">Free Plan - Limited features</p>
                  </div>
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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