
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, MessageCircle, Eye } from 'lucide-react';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { DashboardLayout } from '@/components/DashboardLayout';

const OwnerDashboard = () => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const handleProfileTap = (profileId: string) => {
    setSelectedProfileId(profileId);
    // TODO: Open profile details modal
    console.log('Profile tapped:', profileId);
  };

  return (
    <DashboardLayout userRole="owner">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Discover Potential Tenants</h1>
            <p className="text-white/80 text-lg">Swipe through client profiles to find your ideal tenants</p>
          </div>

          {/* Main Swipe Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-center">
                Potential Tenants
              </CardTitle>
              <p className="text-white/80 text-center text-sm">
                Review client profiles and find the perfect match for your properties
              </p>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <ClientSwipeContainer onProfileTap={handleProfileTap} />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">List Property</h3>
                <p className="text-white/80 text-sm mb-4">Add your property to attract potential tenants</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Tenant Matches</h3>
                <p className="text-white/80 text-sm mb-4">View potential tenant matches for your properties</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Messages</h3>
                <p className="text-white/80 text-sm mb-4">Communicate with interested tenants</p>
              </CardContent>
            </Card>
          </div>

          {/* Property Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-bold text-white mb-1">3</div>
                <p className="text-white/80 text-xs">Active Properties</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-bold text-white mb-1">24</div>
                <p className="text-white/80 text-xs">Profile Views</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-bold text-white mb-1">8</div>
                <p className="text-white/80 text-xs">Interested Clients</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-bold text-white mb-1">5</div>
                <p className="text-white/80 text-xs">Messages</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
