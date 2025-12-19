import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientProfileSettings } from "@/components/ClientProfileSettings";
import { ClientProfilePreview } from "@/components/ClientProfilePreview";
import { ClientPreferencesDialog } from "@/components/ClientPreferencesDialog";
import { ThemeSelector } from "@/components/ThemeSelector";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Flame, Home, Bike, Ship, Eye } from "lucide-react";
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
    if (tab && ["profile", "preferences", "theme"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <DashboardLayout userRole="client">
      <div className="w-full h-full overflow-y-auto overflow-x-hidden pb-24">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <PageHeader 
              title="Settings" 
              subtitle="Manage your profile and preferences"
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Horizontally scrollable tabs on mobile */}
              <div className="relative -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
                <TabsList className="w-max sm:w-full flex sm:grid sm:grid-cols-3 gap-1 p-1 bg-card/80 backdrop-blur-sm rounded-xl border border-border">
                  <TabsTrigger value="profile" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Profile</TabsTrigger>
                  <TabsTrigger value="preferences" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Preferences</TabsTrigger>
                  <TabsTrigger value="theme" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Theme</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="profile" className="mt-4 sm:mt-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 sm:p-6">
                    <ClientProfileSettings />
                  </div>

                  {/* Profile Preview Section */}
                  <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <h2 className="text-lg sm:text-xl font-bold">Profile Preview</h2>
                    </div>
                    <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm">
                      This is how property owners will see your profile when browsing potential clients.
                    </p>
                    <ClientProfilePreview mode="self" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="mt-4 sm:mt-6">
                <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-2">What Are You Looking For?</h2>
                      <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                        Set your preferences for properties, motorcycles, bicycles, and yachts.
                        Owners will see these when browsing your profile, helping them match you with the perfect listing.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border-2 border-blue-500/20">
                        <Home className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 mb-2 sm:mb-3" />
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Properties</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Set preferences for apartments, houses, villas, and more
                        </p>
                      </div>

                      <div className="p-4 sm:p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-lg border-2 border-red-500/20">
                        <Car className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 mb-2 sm:mb-3" />
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Motorcycles</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Specify your preferred bike types, engine size, and features
                        </p>
                      </div>

                      <div className="p-4 sm:p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border-2 border-green-500/20">
                        <Bike className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 mb-2 sm:mb-3" />
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Bicycles</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Choose your ideal bicycle type, size, and specifications
                        </p>
                      </div>

                      <div className="p-4 sm:p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-lg border-2 border-cyan-500/20">
                        <Ship className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-500 mb-2 sm:mb-3" />
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Yachts</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Define your yacht preferences, size, and amenities
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowPreferences(true)}
                      size="lg"
                      className="w-full"
                    >
                      <Flame className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Set My Preferences
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="theme" className="mt-4 sm:mt-6">
                <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 sm:p-6">
                  <ThemeSelector />
                </div>
              </TabsContent>
            </Tabs>
          </div>
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
