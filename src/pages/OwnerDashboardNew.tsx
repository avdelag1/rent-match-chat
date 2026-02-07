/** SPEED OF LIGHT: Owner Dashboard - Clean Client List View
 *
 * Shows all available clients in a swipe-style card layout
 * Features:
 * - Simple grid of client cards
 * - Swipe-style cards visible
 * - Quick actions (like, message, view)
 * - Filter support
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useStartConversation } from '@/hooks/useConversations';
import { toast as sonnerToast } from 'sonner';
import { logger } from '@/utils/prodLogger';
import { ArrowLeft, Search, Filter, MessageCircle, Heart, User, RefreshCw, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

// Simple client card component
function ClientCard({ 
  client, 
  onLike, 
  onMessage, 
  onView 
}: { 
  client: any; 
  onLike: () => void;
  onMessage: () => void;
  onView: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const hasPhotos = client.profile_images && client.profile_images.length > 0;
  const mainImage = hasPhotos ? client.profile_images[0] : null;
  
  // Calculate budget text
  const budgetText = client.budget_min && client.budget_max
    ? `$${client.budget_min.toLocaleString()} - $${client.budget_max.toLocaleString()}`
    : client.budget_max
      ? `Up to $${client.budget_max.toLocaleString()}`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10"
    >
      {/* Image */}
      <div className="relative h-48 bg-white/5">
        {mainImage ? (
          <img
            src={mainImage}
            alt={client.name}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <User className="w-16 h-16 text-white/30" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Name & Age - bottom left */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">{client.name || 'Anonymous'}</h3>
            {client.age && (
              <span className="text-white/70">{client.age}</span>
            )}
            {client.verified && (
              <Badge className="bg-blue-500/80 text-white text-xs">Verified</Badge>
            )}
          </div>
          {client.city && (
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <MapPin className="w-3 h-3" />
              <span>{client.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Budget */}
        {budgetText && (
          <div className="flex items-center gap-2 text-white/80">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium">{budgetText}/month</span>
          </div>
        )}

        {/* Looking for */}
        {client.preferred_listing_type && (
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">Looking for:</span>
            <Badge variant="outline" className="border-white/20 text-white/70">
              {client.preferred_listing_type}
            </Badge>
          </div>
        )}

        {/* Match score if available */}
        {client.matchPercentage !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">Match:</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${client.matchPercentage}%` }}
              />
            </div>
            <span className="text-white/70 text-sm">{client.matchPercentage}%</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onLike}
            variant="outline"
            className="flex-1 border-white/20 hover:bg-white/10"
          >
            <Heart className="w-4 h-4 mr-2" />
            Like
          </Button>
          <Button
            onClick={onMessage}
            className="flex-1 bg-white text-black hover:bg-white/90"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button
            onClick={onView}
            variant="outline"
            className="px-3 border-white/20 hover:bg-white/10"
          >
            View
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function EnhancedOwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch client profiles
  const { 
    data: clients = [], 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useSmartClientMatching(
    user?.id,
    undefined, // no category filter - show all
    0,         // page 0
    50,        // page size 50
    false,     // not refresh mode
    {}         // no filters - show all
  );

  const startConversation = useStartConversation();

  // Filter by search
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(client =>
      client.name?.toLowerCase().includes(query) ||
      client.city?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleLike = (clientId: string) => {
    sonnerToast.success('Liked!', {
      description: 'Client added to your likes'
    });
  };

  const handleMessage = async (clientId: string) => {
    try {
      sonnerToast.loading('Starting conversation...');
      const result = await startConversation.mutateAsync({
        otherUserId: clientId,
        initialMessage: "Hi! I saw your profile and would like to connect.",
        canStartNewConversation: true,
      });
      if (result?.conversationId) {
        sonnerToast.dismiss();
        navigate(`/messages?conversationId=${result.conversationId}`);
      }
    } catch (error) {
      sonnerToast.error('Could not start conversation');
    }
  };

  const handleView = (clientId: string) => {
    navigate(`/owner/view-client/${clientId}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Discover Clients</h1>
            <p className="text-white/50 text-sm">
              {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-white/20"
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
      </div>

      {/* Client Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-black/40 rounded-3xl overflow-hidden border border-white/10 animate-pulse">
                <div className="h-48 bg-white/10" />
                <div className="p-4 space-y-3">
                  <div className="h-6 w-3/4 bg-white/10 rounded" />
                  <div className="h-4 w-1/2 bg-white/10 rounded" />
                  <div className="h-10 w-full bg-white/10 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-red-400 mb-4">Failed to load clients</div>
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          </div>
        ) : filteredClients.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <User className="w-16 h-16 text-white/20 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Clients Found</h3>
            <p className="text-white/50 text-sm max-w-xs">
              {searchQuery 
                ? 'Try adjusting your search' 
                : 'Check back later for new clients'}
            </p>
          </div>
        ) : (
          // Client grid
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.user_id || client.id}
                  client={client}
                  onLike={() => handleLike(client.user_id || client.id)}
                  onMessage={() => handleMessage(client.user_id || client.id)}
                  onView={() => handleView(client.user_id || client.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
