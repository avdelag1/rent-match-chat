
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { DashboardLayout } from '@/components/DashboardLayout';

interface OwnerDashboardProps {
  onClientInsights?: (profileId: string) => void;
}

const OwnerDashboard = ({ onClientInsights }: OwnerDashboardProps) => {
  const handleProfileTap = (profileId: string) => {
    console.log('Profile tapped:', profileId);
  };

  const handleInsights = (profileId: string) => {
    if (onClientInsights) {
      onClientInsights(profileId);
    }
  };

  const handleMessageClick = () => {
    console.log('Message requires premium subscription');
  };

  return (
    <DashboardLayout userRole="owner">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Discover Potential Tenants</h1>
          </div>

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
