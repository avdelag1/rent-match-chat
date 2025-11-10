import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumSubscriptionManager } from "@/components/PremiumSubscriptionManager";
import { AccountSecurity } from "@/components/AccountSecurity";
import { PropertySearch } from "@/components/PropertySearch";
import { ClientProfileSettings } from "@/components/ClientProfileSettings";
import { ClientProfilePreview } from "@/components/ClientProfilePreview";
import { ClientPreferencesDialog } from "@/components/ClientPreferencesDialog";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Button } from "@/components/ui/button";
import { Heart, Home, Bike, Ship, Eye } from "lucide-react";
import { Car } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const ClientSettings = () => {
  const [showPreferences, setShowPreferences] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");

  // Support deep-linking to specific tabs via URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "preferences", "subscription", "security", "search", "theme"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <DashboardLayout userRole="client">
      <div className="w-full h-full overflow-y-auto max-h-[calc(100vh-8rem)] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Client Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and search settings</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full gap-1 p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <TabsTrigger value="profile" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Profile</TabsTrigger>
              <TabsTrigger value="preferences" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Preferences</TabsTrigger>
              <TabsTrigger value="subscription" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Subscription</TabsTrigger>
              <TabsTrigger value="security" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Security</TabsTrigger>
              <TabsTrigger value="search" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Search</TabsTrigger>
              <TabsTrigger value="theme" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Theme</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                  <ClientProfileSettings />
                </div>
                
                {/* Profile Preview Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">Profile Preview</h2>
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm">
                    This is how property owners will see your profile when browsing potential clients.
                  </p>
                  <ClientProfilePreview mode="self" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">What Are You Looking For?</h2>
                    <p className="text-muted-foreground mb-6">
                      Set your preferences for properties, motorcycles, bicycles, and yachts.
                      Owners will see these when browsing your profile, helping them match you with the perfect listing.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="w-full h-full overflow-y-auto p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                      <Home className="w-10 h-10 text-blue-600 mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Properties</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Set preferences for apartments, houses, villas, and more
                      </p>
                    </div>

                    <div className="w-full h-full overflow-y-auto p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200">
                      <Car className="w-10 h-10 text-orange-600 mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Motorcycles</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Specify your preferred bike types, engine size, and features
                      </p>
                    </div>

                    <div className="w-full h-full overflow-y-auto p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                      <Bike className="w-10 h-10 text-green-600 mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Bicycles</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Choose your ideal bicycle type, size, and specifications
                      </p>
                    </div>

                    <div className="w-full h-full overflow-y-auto p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border-2 border-cyan-200">
                      <Ship className="w-10 h-10 text-cyan-600 mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Yachts</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Define your yacht preferences, size, and amenities
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowPreferences(true)}
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Set My Preferences
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <PremiumSubscriptionManager userRole="client" />
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <AccountSecurity userRole="client" />
              </div>
            </TabsContent>

            <TabsContent value="search" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <PropertySearch />
              </div>
            </TabsContent>

            <TabsContent value="theme" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <ThemeSelector />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Client Preferences Dialog */}
      <ClientPreferencesDialog
        open={showPreferences}
        onOpenChange={setShowPreferences}
      />
    </DashboardLayout>
  );
};

export default ClientSettings;