import { useState } from 'react';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { SupportDialog } from '@/components/SupportDialog';
import { NotificationsDialog } from '@/components/NotificationsDialog';
import { OwnerClientFilterDialog } from '@/components/OwnerClientFilterDialog';
import { CategorySelectionDialog } from '@/components/CategorySelectionDialog';
import { MatchCelebration } from '@/components/MatchCelebration';
import { ActiveFiltersBar } from '@/components/ActiveFiltersBar';
import { BottomNav } from '@/components/BottomNav';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useNotifications } from '@/hooks/useNotifications';
import { useOwnerClientPreferences } from '@/hooks/useOwnerClientPreferences';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
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
  
  const { data: profiles = [], refetch, isLoading, error, isError } = useSmartClientMatching();
  
  // Debug logging
  console.log('🏠 OwnerDashboard: profiles count:', profiles.length);
  console.log('🏠 OwnerDashboard: isLoading:', isLoading);
  console.log('🏠 OwnerDashboard: error:', error);
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

  const handleStartConversation = (clientId?: string) => {
    if (clientId) {
      navigate(`/messages?startConversation=${clientId}`);
    } else {
      navigate('/messages');
    }
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-bold">Finding Clients...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-center p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Error Loading Clients</h2>
          <p className="mb-4 bg-white/20 p-4 rounded-lg text-sm">
            {error?.message || 'Unknown error occurred'}
          </p>
          <Button onClick={() => refetch()} variant="secondary" size="lg">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 pb-20">
      {/* Simple Header - Fixed at top */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-r from-orange-500 to-pink-500">
        <div className="p-3 sm:p-4 flex justify-between items-center max-w-2xl mx-auto">
          <Button
            onClick={() => setShowFilters(true)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-white text-lg sm:text-xl font-bold">Find Clients</h1>
            {profiles.length > 0 && (
              <p className="text-white/80 text-xs sm:text-sm">{profiles.length} available</p>
            )}
          </div>
          <Button
            onClick={() => navigate('/owner/properties')}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 text-xs"
          >
            My Listings
          </Button>
        </div>

        {/* Active Filters Bar */}
        <ActiveFiltersBar 
          onClearFilters={handleClearFilters}
          onOpenFilters={() => setShowFilters(true)}
        />
      </header>

      {/* Swipable Client Cards - Full Screen */}
      <main className="pt-24 pb-4 px-2 sm:px-4 flex items-center justify-center min-h-screen max-w-2xl mx-auto">
        <ClientSwipeContainer 
          onClientTap={handleProfileTap}
          onInsights={handleInsights}
          onMessageClick={(clientId) => handleStartConversation(clientId)}
          profiles={profiles}
          isLoading={isLoading}
          error={error}
        />
      </main>

      {/* Bottom Navigation */}
      <BottomNav active="home" userRole="owner" />

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
        onMessage={() => handleStartConversation(matchCelebration.clientProfile?.user_id)}
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

    </div>
  );
};

export default OwnerDashboard;
