
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { DashboardLayout } from '@/components/DashboardLayout';

const OwnerDashboard = () => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const handleProfileTap = (profileId: string) => {
    setSelectedProfileId(profileId);
    console.log('Profile tapped:', profileId);
  };

  const handleInsights = (profileId: string) => {
    console.log('View insights for profile:', profileId);
    // TODO: Implement insights modal/page
  };

  const handleMessageClick = () => {
    console.log('Message requires premium subscription');
    // This will be handled by the layout to show subscription packages
  };

  return (
    <DashboardLayout userRole="owner">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Discover Potential Tenants</h1>
          </div>

          {/* Main Swipe Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">
                Potential Tenants
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <ClientSwipeContainer 
                onProfileTap={handleProfileTap}
                onInsights={handleInsights}
                onMessageClick={handleMessageClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
