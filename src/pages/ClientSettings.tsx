import { DashboardLayout } from "@/components/DashboardLayout";
import { ClientPreferencesDialog } from "@/components/ClientPreferencesDialog";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useClientFilterPreferences } from "@/hooks/useClientFilterPreferences";
import { PremiumSubscriptionManager } from "@/components/PremiumSubscriptionManager";
import { ThemeSelector } from "@/components/ThemeSelector";

const ClientSettings = () => {
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const { data: preferences } = useClientFilterPreferences();

  return (
    <DashboardLayout userRole="client">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences and account settings.</p>
          </div>

          <div className="grid gap-6">
            {/* Theme Settings */}
            <ThemeSelector />

            {/* General Settings */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-foreground font-medium">Email notifications</label>
                    <p className="text-muted-foreground text-sm">Receive updates about new matches and messages</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
              </CardContent>
            </Card>

            {/* Search Preferences */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Search Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {preferences ? (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-foreground text-sm font-medium">Price Range</label>
                        <p className="text-foreground mt-1">
                          ${preferences.min_price || 0} - ${preferences.max_price || 'No limit'}
                        </p>
                      </div>
                      <div>
                        <label className="text-foreground text-sm font-medium">Bedrooms</label>
                        <p className="text-foreground mt-1">
                          {preferences.min_bedrooms || 0} - {preferences.max_bedrooms || 'Any'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-foreground text-sm font-medium">Location Zones</label>
                      <p className="text-foreground mt-1">
                        {preferences.location_zones?.join(', ') || 'Any location'}
                      </p>
                    </div>

                    {preferences.amenities_required && preferences.amenities_required.length > 0 && (
                      <div>
                        <label className="text-foreground text-sm font-medium">Required Amenities</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {preferences.amenities_required.map((amenity, index) => (
                            <span key={index} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No search preferences set</p>
                )}
                
                <Button 
                  onClick={() => setShowPreferencesDialog(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Update Preferences
                </Button>
              </CardContent>
            </Card>
            {/* Advanced Features */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Advanced Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '/client/saved-searches'}
                >
                  Manage Saved Searches
                </Button>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '/client/match-history'}
                >
                  View Match History
                </Button>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '/client/activity-feed'}
                >
                  Activity Feed
                </Button>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '/client/security'}
                >
                  Account Security
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Management */}
            <div id="subscription">
              <PremiumSubscriptionManager userRole="client" />
            </div>
          </div>
        </div>
      </div>

      <ClientPreferencesDialog 
        open={showPreferencesDialog} 
        onOpenChange={setShowPreferencesDialog} 
      />
    </DashboardLayout>
  );
};

export default ClientSettings;