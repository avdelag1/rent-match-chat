import { useState } from 'react';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { SupportDialog } from '@/components/SupportDialog';
import { NotificationsDialog } from '@/components/NotificationsDialog';
import { OwnerClientFilterDialog } from '@/components/OwnerClientFilterDialog';
import { CategorySelectionDialog } from '@/components/CategorySelectionDialog';
import { MatchCelebration } from '@/components/MatchCelebration';
import { ActiveFiltersBar } from '@/components/ActiveFiltersBar';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useNotifications } from '@/hooks/useNotifications';
import { useOwnerClientPreferences } from '@/hooks/useOwnerClientPreferences';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface OwnerDashboardProps {
  onClientInsights?: (profileId: string) => void;
  onMessageClick?: () => void;
}

const OwnerDashboard = ({ onClientInsights, onMessageClick }: OwnerDashboardProps) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });
  
  const { data: profiles = [], refetch } = useSmartClientMatching();
  const { updatePreferences } = useOwnerClientPreferences();
  const navigate = useNavigate();
  
  // Initialize notifications
  useNotifications();

  const handleClearFilters = async () => {
    // Reset all preferences to null/default
    updatePreferences({
      min_budget: null,
      max_budget: null,
      min_age: null,
      max_age: null,
      compatible_lifestyle_tags: [],
      allows_pets: null,
      allows_smoking: null,
      allows_parties: null,
      requires_employment_proof: false,
      requires_references: false,
      min_monthly_income: null,
      preferred_occupations: [],
    });
    
    toast({
      title: 'Filters Cleared',
      description: 'All client filters have been reset.',
    });
    
    // Refetch with no filters
    setTimeout(() => refetch(), 500);
  };
  
  const handleProfileTap = (profileId: string) => {
    setSelectedProfileId(profileId);
    setInsightsOpen(true);
  };

  const handleInsights = (profileId: string) => {
    setSelectedProfileId(profileId);
    setInsightsOpen(true);
    if (onClientInsights) {
      onClientInsights(profileId);
    }
  };

  const handleStartConversation = () => {
    navigate('/messaging');
  };

  const handleCategorySelect = (category: 'property' | 'yacht' | 'motorcycle' | 'bicycle', mode: 'rent' | 'sale' | 'both') => {
    navigate(`/owner/properties#add-${category}`);
  };

  const handleMenuAction = (action: string) => {
    console.log('🔧 Menu action triggered:', action);
    
    if (action === 'add-listing') {
      console.log('➕ Opening category dialog');
      setShowCategoryDialog(true);
    } else if (action === 'premium-packages') {
      console.log('💎 Navigating to premium packages');
      navigate('/subscription-packages');
    } else if (action === 'support') {
      console.log('💬 Opening support dialog');
      setShowSupport(true);
    } else if (action === 'notifications') {
      console.log('🔔 Opening notifications dialog');
      setShowNotifications(true);
    } else if (action === 'filters') {
      console.log('✅ Opening filters dialog');
      setShowFilters(true);
      console.log('📊 showFilters state set to:', true);
    }
  };

  const selectedProfile = profiles.find(p => p.user_id === selectedProfileId);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">
        <AppSidebar userRole="owner" onMenuItemClick={handleMenuAction} />
        
        <main className="flex-1 relative overflow-hidden">
          {/* Simple Header - z-10 */}
          <header className="absolute top-0 left-0 right-0 z-10">
            <div className="p-3 sm:p-4 flex justify-between items-center">
              <SidebarTrigger className="bg-white/20 hover:bg-white/30 text-white border-white/20" />
              <div className="text-center flex-1">
                <h1 className="text-white text-lg sm:text-xl font-bold">Find Clients</h1>
                {profiles.length > 0 && (
                  <p className="text-white/80 text-xs sm:text-sm">{profiles.length} clients available</p>
                )}
              </div>
              <Button
                onClick={() => setShowCategoryDialog(true)}
                className="bg-white text-orange-500 hover:bg-white/90 gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Listing</span>
              </Button>
            </div>

            {/* Active Filters Bar */}
            <ActiveFiltersBar 
              onClearFilters={handleClearFilters}
              onOpenFilters={() => setShowFilters(true)}
            />
          </header>

          {/* Swipable Client Cards - Full Screen - z-0 */}
          <div className="absolute inset-0 pt-20 sm:pt-24 pb-4 px-2 sm:px-4 flex items-center justify-center z-0">
            <ClientSwipeContainer 
              onClientTap={handleProfileTap}
              onInsights={handleInsights}
              onMessageClick={onMessageClick}
            />
          </div>
        </main>
      </div>

      {/* All Dialogs - z-50+ to appear above everything */}

      <ClientInsightsDialog
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
        profile={selectedProfile || null}
      />

      <MatchCelebration
        isOpen={matchCelebration.isOpen}
        onClose={() => setMatchCelebration({ isOpen: false })}
        matchedUser={{
          name: matchCelebration.clientProfile?.name || 'User',
          avatar: matchCelebration.clientProfile?.images?.[0],
          role: 'client'
        }}
        onMessage={handleStartConversation}
      />

      <SupportDialog
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        userRole="owner"
      />

      <NotificationsDialog
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <OwnerClientFilterDialog
        open={showFilters}
        onOpenChange={(open) => {
          console.log('🎛️ Filter dialog open state changed to:', open);
          setShowFilters(open);
          if (!open) {
            console.log('🔄 Refetching clients after filter dialog closed');
            refetch();
          }
        }}
      />

      <CategorySelectionDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onCategorySelect={handleCategorySelect}
      />

    </SidebarProvider>
  );
};

export default OwnerDashboard;
