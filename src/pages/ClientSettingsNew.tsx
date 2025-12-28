import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Bell, FileText, Crown, HelpCircle, Bookmark, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AccountSecurity } from "@/components/AccountSecurity";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { SwipeNavigationWrapper } from "@/components/SwipeNavigationWrapper";
import { clientSettingsRoutes } from "@/config/swipeNavigationRoutes";

const fastSpring = { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.8 };

const ClientSettingsNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Handle hash fragment navigation (e.g., #subscription)
  useEffect(() => {
    if (location.hash === '#subscription') {
      // Navigate to subscription packages page
      navigate('/subscription-packages', { replace: true });
    }
  }, [location.hash, navigate]);

  const settingsItems = [
    {
      icon: Shield,
      label: 'Security',
      description: 'Password, 2FA, and account security',
      color: 'text-green-500',
      section: 'security'
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage notification preferences',
      color: 'text-blue-500',
      action: () => navigate('/notifications')
    },
    {
      icon: Bookmark,
      label: 'Saved Searches',
      description: 'View your saved property searches',
      color: 'text-purple-500',
      action: () => navigate('/client/saved-searches')
    },
    {
      icon: FileText,
      label: 'Contracts',
      description: 'View and manage your contracts',
      color: 'text-orange-500',
      action: () => navigate('/client/contracts')
    },
    {
      icon: FileText,
      label: 'Legal Documents',
      description: 'Terms of service and privacy policy',
      color: 'text-amber-500',
      action: () => alert('Legal documents - Coming soon')
    },
    {
      icon: Crown,
      label: 'Premium Packages',
      description: 'Upgrade your subscription',
      color: 'text-yellow-500',
      action: () => navigate('/subscription-packages')
    },
    {
      icon: HelpCircle,
      label: 'Support',
      description: 'Get help and contact support',
      color: 'text-cyan-500',
      action: () => alert('Support - Coming soon')
    },
  ];

  if (activeSection === 'security') {
    return (
      <DashboardLayout userRole="client">
        <SwipeNavigationWrapper routes={clientSettingsRoutes}>
          <div className="w-full px-5 py-4 pb-24">
            <div className="max-w-3xl mx-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection(null)}
                className="mb-4 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Settings
              </Button>

              <PageHeader
                title="Account Security"
                subtitle="Manage your password and security settings"
              />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={fastSpring}
              >
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <AccountSecurity userRole="client" />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </SwipeNavigationWrapper>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="client">
      <SwipeNavigationWrapper routes={clientSettingsRoutes}>
        <div className="w-full px-5 py-4 pb-24">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {/* Page Header */}
            <PageHeader
              title="Settings"
              subtitle="Manage your account and preferences"
            />

            {/* Settings Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={fastSpring}
            >
              <Card className="bg-card border-border overflow-hidden">
                <CardContent className="p-0">
                  {settingsItems.map((item, index) => (
                    <div key={item.label}>
                      <button
                        onClick={() => {
                          if (item.section) {
                            setActiveSection(item.section);
                          } else if (item.action) {
                            item.action();
                          }
                        }}
                        className="w-full flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className={`mt-1 ${item.color}`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{item.label}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />
                      </button>
                      {index < settingsItems.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* App Version */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                <span className="swipess-text text-sm">SWiPESS</span> <span className="opacity-60">v1.0</span>
              </p>
            </div>
          </div>
        </div>
      </SwipeNavigationWrapper>
    </DashboardLayout>
  );
};

export default ClientSettingsNew;
