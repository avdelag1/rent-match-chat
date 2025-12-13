import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, MessageCircle, Users, Search, RefreshCw, Home, Car, Ship, Bike, X, Verified, Briefcase, MapPin, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useStartConversation } from "@/hooks/useConversations";
import { useMessagingQuota } from "@/hooks/useMessagingQuota";
import { MessageQuotaDialog } from "@/components/MessageQuotaDialog";
import { springConfigs, listContainerVariants, listItemVariants } from "@/utils/modernAnimations";

interface LikedClient {
  id: string;
  user_id: string;
  full_name: string;
  name: string;
  age: number;
  bio: string;
  profile_images: string[];
  images: string[];
  location: any;
  liked_at: string;
  occupation?: string;
  nationality?: string;
  interests?: string[];
  monthly_income?: string;
  verified?: boolean;
}

const categories = [
  { id: 'all', label: 'All', icon: Users },
  { id: 'property', label: 'Property', icon: Home },
  { id: 'moto', label: 'Moto', icon: Car },
  { id: 'bicycle', label: 'Bicycle', icon: Bike },
  { id: 'yacht', label: 'Yacht', icon: Ship }
];

export function LikedClients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const categoryFromUrl = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const queryClient = useQueryClient();
  const startConversation = useStartConversation();

  const { data: likedClients = [], isLoading, refetch } = useQuery({
    queryKey: ['liked-clients', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('target_id, created_at')
        .eq('user_id', user.id)
        .eq('direction', 'right');

      if (likesError) throw likesError;
      if (!likes || likes.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(role)
        `)
        .in('id', likes.map(like => like.target_id))
        .eq('user_roles.role', 'client');

      if (profilesError) throw profilesError;
      if (!profiles) return [];

      const likedClientsList = profiles.map(profile => {
        const like = likes.find(l => l.target_id === profile.id);
        return {
          id: profile.id,
          user_id: profile.id,
          full_name: profile.full_name || 'Unknown',
          name: profile.full_name || 'Unknown',
          age: profile.age || 0,
          bio: profile.bio || '',
          profile_images: profile.images || [],
          images: profile.images || [],
          location: profile.location,
          liked_at: like?.created_at || '',
          occupation: profile.occupation,
          nationality: profile.nationality,
          interests: profile.interests,
          monthly_income: profile.monthly_income,
          verified: profile.verified
        };
      }) as LikedClient[];

      const deduplicatedClients = Array.from(
        new Map(likedClientsList.map(client => [client.id, client])).values()
      ).sort((a, b) => new Date(b.liked_at).getTime() - new Date(a.liked_at).getTime());

      return deduplicatedClients;
    },
    enabled: !!user?.id,
    staleTime: 60000,
    refetchInterval: 30000,
  });

  const removeLikeMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user?.id)
        .eq('target_id', clientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liked-clients'] });
      toast.success("Client removed from liked list");
    },
    onError: () => {
      toast.error("Failed to remove client from liked list");
    }
  });

  const handleMessage = async (client: LikedClient) => {
    if (isCreatingConversation) return;

    setIsCreatingConversation(true);

    try {
      toast.loading('Starting conversation...', { id: 'start-conv' });

      const result = await startConversation.mutateAsync({
        otherUserId: client.user_id,
        initialMessage: `Hi ${client.name}! I'm interested in discussing potential rental opportunities with you.`,
        canStartNewConversation: true,
      });

      if (result?.conversationId) {
        toast.success('Opening chat...', { id: 'start-conv' });
        navigate(`/messages?conversationId=${result.conversationId}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Could not start conversation', { id: 'start-conv' });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const filteredClients = likedClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.bio && client.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.occupation && client.occupation.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;

    if (client.interests && Array.isArray(client.interests)) {
      return client.interests.some(interest =>
        interest.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    return false;
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchParams({ category });
  };

  const handleRemoveLike = (clientId: string) => {
    removeLikeMutation.mutate(clientId);
  };

  // Skeleton loader
  const ClientSkeleton = () => (
    <div className="rounded-2xl overflow-hidden bg-card border border-border/50">
      <div className="aspect-[4/5] bg-gradient-to-br from-muted to-muted/50 animate-pulse relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded-full w-3/4 animate-pulse" />
        <div className="h-4 bg-muted rounded-full w-1/2 animate-pulse" />
        <div className="flex gap-2 mt-4">
          <div className="h-10 bg-muted rounded-xl flex-1 animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-full bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfigs.smooth}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/25"
              >
                <Flame className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Flamed Clients
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} matched
                </p>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="rounded-xl border-border/50 hover:bg-accent/50 transition-all duration-200 gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </motion.div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search clients by name, bio, or occupation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm focus:bg-card transition-all duration-200"
            />
            {searchTerm && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {categories.map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => handleCategoryChange(id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap
                    transition-all duration-200 shrink-0
                    ${selectedCategory === id
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted'
                    }
                  `}
                >
                  {selectedCategory === id && (
                    <motion.div
                      layoutId="categoryPill"
                      className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/25"
                      transition={springConfigs.tab}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <ClientSkeleton key={i} />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfigs.smooth}
          >
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl">
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={springConfigs.bouncy}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-6"
                >
                  <Flame className="w-10 h-10 text-orange-500/50" />
                </motion.div>
                <h2 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'No Matches Found' : 'No Flamed Clients Yet'}
                </h2>
                <p className="text-muted-foreground text-center max-w-sm mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms to find more clients.'
                    : 'Start exploring client profiles and flame the ones you\'re interested in working with.'
                  }
                </p>
                {!searchTerm && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => navigate('/owner/dashboard')}
                      className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/20"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Browse Clients
                    </Button>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredClients.map((client) => (
                <motion.div
                  key={client.id}
                  variants={listItemVariants}
                  layout
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group"
                >
                  <Card className="overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl">
                    {/* Image Section */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {client.images && client.images.length > 0 ? (
                        <img
                          src={client.images[0]}
                          alt={client.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <Users className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Action buttons */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="icon"
                            onClick={() => handleMessage(client)}
                            disabled={isCreatingConversation}
                            className="h-10 w-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg border-0"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleRemoveLike(client.user_id)}
                            disabled={removeLikeMutation.isPending}
                            className="h-10 w-10 rounded-xl shadow-lg border-0"
                          >
                            <Flame className="w-5 h-5 fill-current" />
                          </Button>
                        </motion.div>
                      </div>

                      {/* Verified badge */}
                      {client.verified && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={springConfigs.bouncy}
                          className="absolute top-3 left-3"
                        >
                          <div className="flex items-center gap-1.5 bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-medium shadow-lg">
                            <Verified className="w-3.5 h-3.5" />
                            Verified
                          </div>
                        </motion.div>
                      )}

                      {/* Client info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold truncate">{client.name}</h3>
                          {client.age > 0 && (
                            <span className="text-white/80">{client.age}</span>
                          )}
                        </div>
                        {client.occupation && (
                          <div className="flex items-center gap-1.5 text-white/80 text-sm">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span className="truncate">{client.occupation}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {client.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {client.bio}
                        </p>
                      )}

                      {client.interests && client.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {client.interests.slice(0, 3).map((interest, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-lg font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                          {client.interests.length > 3 && (
                            <span className="text-muted-foreground text-xs px-2 py-1">
                              +{client.interests.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Flame className="w-3 h-3 text-orange-500" />
                          Flamed {new Date(client.liked_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <MessageQuotaDialog
        isOpen={showQuotaDialog}
        onClose={() => setShowQuotaDialog(false)}
        onUpgrade={() => {
          setShowQuotaDialog(false);
          navigate('/subscription-packages');
        }}
        userRole="owner"
      />
    </div>
  );
}
