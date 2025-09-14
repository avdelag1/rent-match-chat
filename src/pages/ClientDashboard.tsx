
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { Home, Users, Settings, Heart } from 'lucide-react';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

const ClientDashboard = ({ onPropertyInsights, onMessageClick }: ClientDashboardProps) => {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);

  return (
    <DashboardLayout userRole="client">
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to Tinderent</h1>
            <p className="text-white/80 text-xl">Find your perfect rental property</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card className="bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Home className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle>Browse Properties</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Discover properties that match your preferences
                </p>
                <Button className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Heart className="w-12 h-12 mx-auto text-red-500 mb-2" />
                <CardTitle>Liked Properties</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  View your favorite properties
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Chat with property owners
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* Temporary Message */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Dashboard Temporarily Simplified</h3>
              <p className="text-blue-700">
                The full dashboard with property swiping will be restored shortly. 
                Your account is working correctly!
              </p>
            </CardContent>
          </Card>

        </div>
      </div>

      <PropertyInsightsDialog
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
        listing={null}
      />
    </DashboardLayout>
  );
};

export default ClientDashboard;
