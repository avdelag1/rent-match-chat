import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientProfileSettings } from "@/components/ClientProfileSettings";
import { ClientProfilePreview } from "@/components/ClientProfilePreview";
import { ThemeSelector } from "@/components/ThemeSelector";
import { FilterColorPreferences } from "@/components/FilterColorPreferences";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Eye, Palette, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ReferralInviteDialog } from "@/components/ReferralInviteDialog";

const ClientSettings = () => {
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");

  // Support deep-linking to specific tabs via URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "appearance"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <DashboardLayout userRole="client">
      <div className="w-full overflow-x-hidden pb-24">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <PageHeader 
              title="Settings" 
              subtitle="Manage your profile and preferences"
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Horizontally scrollable tabs on mobile */}
              <div className="relative -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
                <TabsList className="w-max sm:w-full flex sm:grid sm:grid-cols-2 gap-1 p-1 bg-card/80 backdrop-blur-sm rounded-xl border border-border">
                  <TabsTrigger value="profile" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Profile</TabsTrigger>
                  <TabsTrigger value="appearance" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">
                    <Palette className="w-3.5 h-3.5 mr-1.5" />
                    Appearance
                  </TabsTrigger>
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

                  {/* Referral & Rewards Section */}
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-green-500/10 backdrop-blur-sm rounded-xl border border-primary/20 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <h2 className="text-lg sm:text-xl font-bold">Invite Friends & Earn Rewards</h2>
                    </div>
                    <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                      Share your invitation link with friends and you both get free message activations!
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold">1</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Share your unique link</p>
                          <p className="text-xs text-muted-foreground">Invite friends via WhatsApp, email, or social media</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold">2</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">They sign up with your link</p>
                          <p className="text-xs text-muted-foreground">Your friends create a new account</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 font-bold">3</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">You both get free messages!</p>
                          <p className="text-xs text-muted-foreground">You get 1 free message, they get 2 free messages</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowReferralDialog(true)}
                      size="lg"
                      className="w-full mt-4"
                      variant="default"
                    >
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Share My Invitation Link
                    </Button>
                  </div>
                </div>
              </TabsContent>


              <TabsContent value="appearance" className="mt-4 sm:mt-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Theme Selector */}
                  <ThemeSelector />

                  {/* Filter Color Preferences */}
                  <FilterColorPreferences />
                </div>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>

      {/* Referral Invite Dialog */}
      <ReferralInviteDialog
        open={showReferralDialog}
        onOpenChange={setShowReferralDialog}
      />
    </DashboardLayout>
  );
};

export default ClientSettings;
