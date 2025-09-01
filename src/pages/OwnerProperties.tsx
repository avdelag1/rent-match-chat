
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";

const OwnerProperties = () => {
  const openAddProperty = () => {
    // Set hash so DashboardLayout opens the PropertyForm
    if (location.hash !== '#add-property') {
      location.hash = '#add-property';
    }
  };

  return (
    <DashboardLayout userRole="owner">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">My Properties</h1>
            <p className="text-white/80">Manage your listings and add new properties.</p>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Get Started</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-white/80 text-center">
                Click the button below to upload a new property. You can also use the “Add Property” item in the left sidebar anytime.
              </p>
              <Button onClick={openAddProperty} className="bg-green-500 hover:bg-green-600">
                Add Property
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerProperties;
