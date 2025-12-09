import { useState } from "react";
import { MessageActivationPackages } from "@/components/MessageActivationPackages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Building2, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function SubscriptionPackagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch user's role
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const defaultRole = userProfile?.role || 'client';
  const [activeTab, setActiveTab] = useState<'client' | 'owner'>(defaultRole as 'client' | 'owner');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Message Packages</span>
            </div>
            
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Role Toggle Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'client' | 'owner')} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2 h-14 p-1.5 bg-muted/50">
              <TabsTrigger 
                value="client" 
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md h-full text-base"
              >
                <MessageCircle className="w-4 h-4" />
                <span>I'm a Client</span>
              </TabsTrigger>
              <TabsTrigger 
                value="owner" 
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md h-full text-base"
              >
                <Building2 className="w-4 h-4" />
                <span>I'm an Owner</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="client" className="mt-0">
              <MessageActivationPackages showAsPage userRole="client" />
            </TabsContent>

            <TabsContent value="owner" className="mt-0">
              <MessageActivationPackages showAsPage userRole="owner" />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto mt-12 p-6 rounded-2xl bg-muted/30 border border-border/50"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">How Message Activations Work</h3>
          <div className="grid sm:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <h4 className="font-medium text-foreground">Purchase Package</h4>
              <p className="text-muted-foreground">Choose a package and complete secure payment via PayPal.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">2</span>
              </div>
              <h4 className="font-medium text-foreground">Start Conversations</h4>
              <p className="text-muted-foreground">Each activation lets you start a new conversation.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <h4 className="font-medium text-foreground">Message Freely</h4>
              <p className="text-muted-foreground">Once started, send unlimited messages in that conversation.</p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto mt-8 space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground text-center">Frequently Asked Questions</h3>
          
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-background border border-border/50">
              <h4 className="font-medium text-foreground">Do activations expire?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Activations are valid for the duration specified in each package (30-90 days). Use them before they expire!
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-background border border-border/50">
              <h4 className="font-medium text-foreground">What happens after I start a conversation?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Once a conversation is activated, you can send unlimited messages within that conversation forever.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-background border border-border/50">
              <h4 className="font-medium text-foreground">Can I get a refund?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Please contact support within 24 hours of purchase if you need assistance. Unused activations may be eligible for refund.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}