import { useState } from 'react';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { SupportDialog } from '@/components/SupportDialog';
import { NotificationsDialog } from '@/components/NotificationsDialog';
import { OwnerClientFilterDialog } from '@/components/OwnerClientFilterDialog';
import { CategorySelectionDialog } from '@/components/CategorySelectionDialog';
import { MatchCelebration } from '@/components/MatchCelebration';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  // Initialize notifications
  useNotifications();
  
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
    if (action === 'add-listing') {
      setShowCategoryDialog(true);
    } else if (action === 'premium-packages') {
      navigate('/subscription-packages');
    } else if (action === 'support') {
      setShowSupport(true);
    } else if (action === 'notifications') {
      setShowNotifications(true);
    } else if (action === 'filters') {
      setShowFilters(true);
    }
  };

  const selectedProfile = profiles.find(p => p.user_id === selectedProfileId);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">
        <AppSidebar userRole="owner" onMenuItemClick={handleMenuAction} />
        
        <main className="flex-1 relative overflow-hidden">
          {/* Simple Header */}
          <header className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4">
            <div className="flex justify-between items-center">
              <SidebarTrigger className="bg-white/20 hover:bg-white/30 text-white border-white/20" />
              <div className="text-center flex-1">
                <h1 className="text-white text-lg sm:text-xl font-bold">Find Clients</h1>
                {profiles.length > 0 && (
                  <p className="text-white/80 text-xs sm:text-sm">{profiles.length} clients available</p>
                )}
              </div>
              <Button
                onClick={() => setShowFilters(true)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2 backdrop-blur-sm"
                size="sm"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <Button
                onClick={() => setShowCategoryDialog(true)}
                className="bg-white text-orange-500 hover:bg-white/90 gap-2 ml-2"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
          </header>

          {/* Swipable Client Cards - Full Screen */}
          <div className="absolute inset-0 pt-16 sm:pt-20 pb-4 px-2 sm:px-4 flex items-center justify-center">
            <ClientSwipeContainer 
              onClientTap={handleProfileTap}
              onInsights={handleInsights}
              onMessageClick={onMessageClick}
            />
          </div>
        </main>
      </div>

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
          setShowFilters(open);
          if (!open) {
            // Refetch clients after filter dialog closes
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
