import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useServiceProviders, SERVICE_TYPES, ServiceType } from '@/hooks/useClientService';
import { useStartConversation } from '@/hooks/useConversations';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ServiceProviderCard } from '@/components/ServiceProviderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Search, Filter, RefreshCw, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function OwnerServicesDiscovery() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ServiceType | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: services, isLoading, refetch, isRefetching } = useServiceProviders(selectedType);
  const startConversation = useStartConversation();
  const [contactingId, setContactingId] = useState<string | null>(null);

  // Filter services by search query
  const filteredServices = services?.filter(service => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const profile = service.profiles as any;
    return (
      service.title.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query) ||
      profile?.full_name?.toLowerCase().includes(query) ||
      profile?.city?.toLowerCase().includes(query)
    );
  });

  const handleContact = useCallback(async (userId: string) => {
    if (contactingId) return;
    setContactingId(userId);

    try {
      toast.loading('Starting conversation...', { id: 'contact-service' });
      
      const result = await startConversation.mutateAsync({
        otherUserId: userId,
        initialMessage: "Hi! I'm interested in your services.",
        canStartNewConversation: true,
      });

      if (result?.conversationId) {
        toast.success('Opening chat...', { id: 'contact-service' });
        await new Promise(resolve => setTimeout(resolve, 300));
        navigate(`/messages?conversationId=${result.conversationId}`);
      }
    } catch (error) {
      toast.error('Could not start conversation', {
        id: 'contact-service',
        description: error instanceof Error ? error.message : 'Try again'
      });
    } finally {
      setContactingId(null);
    }
  }, [contactingId, startConversation, navigate]);

  const clearFilters = () => {
    setSelectedType(undefined);
    setSearchQuery('');
  };

  return (
    <DashboardLayout userRole="owner">
      <div className="min-h-screen pb-24">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Hire Services</h1>
                <p className="text-xs text-muted-foreground">
                  Find skilled professionals
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="rounded-full"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="pl-9 bg-background/50"
              />
            </div>
            <Select
              value={selectedType || 'all'}
              onValueChange={(v) => setSelectedType(v === 'all' ? undefined : v as ServiceType)}
            >
              <SelectTrigger className="w-[160px] bg-background/50">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {SERVICE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(selectedType || searchQuery) && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Filters:</span>
              {selectedType && (
                <Badge variant="secondary" className="gap-1">
                  {SERVICE_TYPES.find(t => t.value === selectedType)?.label}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSelectedType(undefined)}
                  />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  "{searchQuery}"
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredServices && filteredServices.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {filteredServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ServiceProviderCard
                      service={service}
                      onContact={handleContact}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-4">
                {selectedType || searchQuery 
                  ? "Try adjusting your filters to find more service providers"
                  : "Service providers will appear here once clients offer their services"}
              </p>
              {(selectedType || searchQuery) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
