import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, Filter, MessageCircle, User, ArrowLeft, RefreshCw } from 'lucide-react';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useStartConversation } from '@/hooks/useConversations';
import { toast as sonnerToast } from 'sonner';

// Filter components
import { PropertyClientFilters } from '@/components/filters/PropertyClientFilters';
import { MotoClientFilters } from '@/components/filters/MotoClientFilters';
import { BicycleClientFilters } from '@/components/filters/BicycleClientFilters';
import { YachtClientFilters } from '@/components/filters/YachtClientFilters';
import { VehicleClientFilters } from '@/components/filters/VehicleClientFilters';

type CategoryType = 'property' | 'moto' | 'bicycle' | 'yacht' | 'vehicle';

interface CategoryConfig {
  title: string;
  subtitle: string;
  matchingCategory: string;
  FilterComponent: React.ComponentType<{
    onApply: (filters: any) => void;
    initialFilters?: any;
    activeCount: number;
  }>;
}

const categoryConfigs: Record<CategoryType, CategoryConfig> = {
  property: {
    title: 'Property Clients',
    subtitle: 'Find clients looking for properties',
    matchingCategory: 'property',
    FilterComponent: PropertyClientFilters,
  },
  moto: {
    title: 'Motorcycle Clients',
    subtitle: 'Find clients looking for motorcycles',
    matchingCategory: 'moto',
    FilterComponent: MotoClientFilters,
  },
  bicycle: {
    title: 'Bicycle Clients',
    subtitle: 'Find clients looking for bicycles',
    matchingCategory: 'bicycle',
    FilterComponent: BicycleClientFilters,
  },
  yacht: {
    title: 'Yacht Clients',
    subtitle: 'Find clients looking for yachts',
    matchingCategory: 'yacht',
    FilterComponent: YachtClientFilters,
  },
  vehicle: {
    title: 'Vehicle Clients',
    subtitle: 'Find clients looking for vehicles',
    matchingCategory: 'property', // Uses property matching for now
    FilterComponent: VehicleClientFilters,
  },
};

export default function OwnerClientDiscovery() {
  const { category = 'property' } = useParams<{ category: CategoryType }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const validCategory = (categoryConfigs[category as CategoryType] ? category : 'property') as CategoryType;
  const config = categoryConfigs[validCategory];

  const { data: clients = [], isLoading, refetch } = useSmartClientMatching(config.matchingCategory);
  const startConversation = useStartConversation();

  const filteredClients = (clients || []).filter(client =>
    client.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof typeof filters];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setIsSheetOpen(false);
    refetch();
  };

  const handleConnect = async (clientId: string) => {
    if (isCreatingConversation) return;

    setIsCreatingConversation(true);

    try {
      sonnerToast.loading('Starting conversation...', { id: 'start-conv' });

      const result = await startConversation.mutateAsync({
        otherUserId: clientId,
        initialMessage: "Hi! I'd like to connect with you.",
        canStartNewConversation: true,
      });

      if (result?.conversationId) {
        sonnerToast.success('Opening chat...', { id: 'start-conv' });
        navigate(`/messages?conversationId=${result.conversationId}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      sonnerToast.error('Could not start conversation', { id: 'start-conv' });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const FilterComponent = config.FilterComponent;

  return (
    <DashboardLayout userRole="owner">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/owner/dashboard')}
                  className="lg:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">{config.title}</h1>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    {config.subtitle}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredClients?.length || 0} of {clients?.length || 0} clients
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="outline" onClick={() => navigate('/owner/properties')}>
                  <span className="hidden sm:inline">My Listings</span>
                  <span className="sm:hidden">Listings</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Filter Status */}
        {activeFilterCount > 0 && (
          <div className="border-b bg-primary/5">
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="rounded-full">
                    {activeFilterCount} Active
                  </Badge>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    Filters applied
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleApplyFilters({})}>
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-32">
                <Card className="border shadow-sm">
                  <CardContent className="p-0">
                    <FilterComponent
                      onApply={handleApplyFilters}
                      initialFilters={filters}
                      activeCount={activeFilterCount}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Client Cards Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-12 w-12 rounded-full bg-muted" />
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded w-full mb-3" />
                        <div className="h-8 bg-muted rounded w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredClients.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No clients found</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
                      Try adjusting your filters or search query to find more clients
                    </p>
                    {activeFilterCount > 0 && (
                      <Button variant="outline" onClick={() => handleApplyFilters({})}>
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredClients.map((client) => (
                    <Card key={client.id} className="hover:shadow-lg transition-all duration-200 group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                            <AvatarImage src={client.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {client.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{client.name}</h3>
                              {client.verified && (
                                <Badge variant="default" className="text-xs px-1.5">Verified</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {client.age} years {client.city && `• ${client.city}`}
                            </p>
                          </div>
                        </div>

                        {/* Match Percentage */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Match Score</span>
                            <Badge
                              variant={client.matchPercentage >= 80 ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {client.matchPercentage}%
                            </Badge>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                client.matchPercentage >= 80
                                  ? 'bg-green-500'
                                  : client.matchPercentage >= 60
                                    ? 'bg-yellow-500'
                                    : 'bg-muted-foreground'
                              }`}
                              style={{ width: `${client.matchPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Match Reasons */}
                        {client.matchReasons && client.matchReasons.length > 0 && (
                          <div className="mb-3 space-y-0.5">
                            {client.matchReasons.slice(0, 2).map((reason: string, idx: number) => (
                              <p key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="text-green-500">✓</span>
                                <span className="truncate">{reason}</span>
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleConnect(client.user_id)}
                            className="flex-1"
                            size="sm"
                            disabled={isCreatingConversation}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/owner/view-client/${client.user_id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Sheet */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg h-14 px-6">
                <Filter className="h-5 w-5 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
              <SheetHeader className="pb-4 border-b">
                <SheetTitle>Filter {config.title}</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto h-full pb-24">
                <FilterComponent
                  onApply={handleApplyFilters}
                  initialFilters={filters}
                  activeCount={activeFilterCount}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </DashboardLayout>
  );
}
