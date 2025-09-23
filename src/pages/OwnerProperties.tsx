import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const OwnerProperties = () => {
  const openAddProperty = () => {
    // Set hash so DashboardLayout opens the PropertyForm
    if (location.hash !== '#add-property') {
      location.hash = '#add-property';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-400 to-red-500">
        <AppSidebar userRole="owner" />
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 text-center">
            <h1 className="text-2xl font-bold text-white">My Properties</h1>
            <p className="text-white/80">Manage your listings and add new properties</p>
          </div>
          
          <div className="flex-1 p-4">
            <div className="max-w-6xl mx-auto">
              <Card className="bg-white/90 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-gray-800">Get Started</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <p className="text-gray-600 text-center">
                    Click the button below to upload a new property. You can also use the "Add Property" item in the left sidebar anytime.
                  </p>
                  <Button onClick={openAddProperty} className="bg-green-500 hover:bg-green-600">
                    Add Property
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OwnerProperties;