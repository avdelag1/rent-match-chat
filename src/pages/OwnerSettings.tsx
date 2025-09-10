import { DashboardLayout } from "@/components/DashboardLayout";
import { OwnerSettingsDialog } from "@/components/OwnerSettingsDialog";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Shield, Zap, Users, Building2 } from "lucide-react";
import { PremiumSubscriptionManager } from "@/components/PremiumSubscriptionManager";

const OwnerSettings = () => {
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [tenantInquiries, setTenantInquiries] = useState(true);
  const [propertyAlerts, setPropertyAlerts] = useState(true);
  const [autoApproval, setAutoApproval] = useState(false);

  return (
    <DashboardLayout userRole="owner">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Owner Settings</h1>
            <p className="text-white/80">Configure your account preferences and business settings.</p>
          </div>

          <div className="grid gap-6">
            {/* Notification Settings */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">Email notifications</label>
                    <p className="text-white/60 text-sm">Receive updates via email</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">Push notifications</label>
                    <p className="text-white/60 text-sm">Get instant alerts on your device</p>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">Tenant inquiries</label>
                    <p className="text-white/60 text-sm">Notifications for new tenant applications</p>
                  </div>
                  <Switch checked={tenantInquiries} onCheckedChange={setTenantInquiries} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">Property alerts</label>
                    <p className="text-white/60 text-sm">Updates about your property performance</p>
                  </div>
                  <Switch checked={propertyAlerts} onCheckedChange={setPropertyAlerts} />
                </div>
              </CardContent>
            </Card>

            {/* Business Settings */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-white font-medium">Auto-approval for qualified tenants</label>
                    <p className="text-white/60 text-sm">Automatically approve tenants who meet your criteria</p>
                    <Badge variant="secondary" className="mt-1">Premium Feature</Badge>
                  </div>
                  <Switch checked={autoApproval} onCheckedChange={setAutoApproval} disabled />
                </div>

                <div className="pt-4 space-y-2">
                  <label className="text-white font-medium">Tenant Requirements</label>
                  <p className="text-white/60 text-sm">Set minimum requirements for potential tenants</p>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    disabled
                  >
                    Configure Requirements <Badge variant="secondary" className="ml-2">Premium</Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-white font-medium">Profile Visibility</label>
                    <p className="text-white/60 text-sm">Control who can see your business profile</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="border-green-500 text-green-400">Public - Verified Owner</Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-white font-medium">Contact Information</label>
                    <p className="text-white/60 text-sm">Manage how tenants can contact you</p>
                    <Button 
                      variant="outline" 
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 mt-2"
                    >
                      Manage Contact Preferences
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Advanced Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => setShowSettingsDialog(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Open Advanced Settings
                </Button>
                
                <div className="pt-4 border-t border-white/20">
                  <p className="text-white/60 text-sm mb-2">Need help with your account?</p>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Advanced Features */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Advanced Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '/owner/saved-searches'}
                >
                  Manage Saved Searches
                </Button>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '/owner/match-history'}
                >
                  View Match History
                </Button>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '/owner/activity-feed'}
                >
                  Activity Feed
                </Button>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '/owner/security'}
                >
                  Account Security
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Management */}
            <div id="subscription">
              <PremiumSubscriptionManager userRole="owner" />
            </div>
          </div>
        </div>
      </div>

      <OwnerSettingsDialog 
        open={showSettingsDialog} 
        onOpenChange={setShowSettingsDialog} 
      />
    </DashboardLayout>
  );
};

export default OwnerSettings;