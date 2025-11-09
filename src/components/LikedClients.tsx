import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ClientProfileCard } from "@/components/ClientProfileCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Users, Search, MapPin, RefreshCw, Home, Car, Ship, Bike } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useStartConversation } from "@/hooks/useConversations";
import { useMessagingQuota } from "@/hooks/useMessagingQuota";
import { MessageQuotaDialog } from "@/components/MessageQuotaDialog";

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

export function LikedClients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);
  const [userRole, setUserRole] = useState<'client' | 'owner'>('owner');
  const categoryFromUrl = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const queryClient = useQueryClient();
  const startConversation = useStartConversation();
  const { canStartNewConversation } = useMessagingQuota();

  // Category configuration
  const categories = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'property', label: 'Property', icon: Home },
    { id: 'moto', label: 'Moto', icon: Car },
    { id: 'bicycle', label: 'Bicycle', icon: Bike },
    { id: 'yacht', label: 'Yacht', icon: Ship }
  ];

  const { data: likedClients = [], isLoading, refetch } = useQuery({
    queryKey: ['liked-clients', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get likes where the owner liked clients (profiles)
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('target_id, created_at')
        .eq('user_id', user.id)
        .eq('direction', 'right');

      if (likesError) throw likesError;
      if (!likes || likes.length === 0) return [];

      // Get the profiles for those users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', likes.map(like => like.target_id));

      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // Filter to only client profiles by checking user_roles
      const clientProfiles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id)
            .maybeSingle();

          return roleData?.role === 'client' ? profile : null;
        })
      );

      const filteredProfiles = clientProfiles.filter(p => p !== null);

      // Return ONLY the filtered client profiles, not all profiles
      const likedClientsList = filteredProfiles.map(profile => {
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

      // Deduplicate by client ID and keep the most recent like
      const deduplicatedClients = Array.from(
        new Map(likedClientsList.map(client => [client.id, client])).values()
      ).sort((a, b) => new Date(b.liked_at).getTime() - new Date(a.liked_at).getTime());

      return deduplicatedClients;
    },
    enabled: !!user?.id,
    staleTime: 0, // Always refetch to get latest profile updates
    refetchInterval: 30000, // Refetch every 30 seconds for profile updates
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
    console.log('💬 Starting conversation with liked client:', client.name);
    
    // Always allow messaging - bypass quota
    try {
      const result = await startConversation.mutateAsync({
        otherUserId: client.user_id,
        initialMessage: `Hi ${client.name}! I'm interested in discussing potential rental opportunities with you.`,
        canStartNewConversation: true // Always allow
      });
      
      if (result?.conversationId) {
        toast.success("Conversation started!");
        navigate(`/messages?startConversation=${client.user_id}`);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast.error("Failed to start conversation. Please try again.");
    }
  };

  // Filter by search term and category
  const filteredClients = likedClients.filter(client => {
    // Search filter
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.bio && client.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.occupation && client.occupation.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Category filter
    if (selectedCategory === 'all') return true;

    // Check if client's interests include the selected category
    if (client.interests && Array.isArray(client.interests)) {
      return client.interests.some(interest =>
        interest.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    return false;
  });

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchParams({ category });
  };


  const handleRemoveLike = (clientId: string) => {
    removeLikeMutation.mutate(clientId);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl pb-24 sm:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white flex-shrink-0">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Liked Clients</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Manage your liked client profiles and start conversations</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 h-10 sm:h-11"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">{filteredClients.length} clients</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              {categories.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="flex items-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm"
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.substring(0, 4)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-4 sm:p-6 animate-pulse">
                <div className="w-full aspect-[3/4] bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16 max-w-md mx-auto"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-muted flex items-center justify-center">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">No Liked Clients Yet</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
              {searchTerm ? 'No clients match your search.' : 'Start browsing client profiles and like the ones you\'re interested in working with'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => window.location.href = '/owner/dashboard'}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-sm sm:text-base"
              >
                Browse Clients
              </Button>
            )}
          </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300">
                <div className="relative mb-4">
                  {client.images && client.images.length > 0 ? (
                    <img
                      src={client.images[0]}
                      alt={client.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                      <Users className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleMessage(client)}
                      className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                      disabled={startConversation.isPending}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveLike(client.user_id)}
                      className="shadow-lg"
                      disabled={removeLikeMutation.isPending}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {client.name}
                      {client.verified && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </h3>
                    <p className="text-muted-foreground">Age: {client.age}</p>
                    {client.occupation && (
                      <p className="text-sm text-muted-foreground">{client.occupation}</p>
                    )}
                  </div>
                  
                  {client.bio && (
                    <p className="text-sm line-clamp-3">{client.bio}</p>
                  )}

                  {client.interests && client.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {client.interests.slice(0, 3).map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Liked on {new Date(client.liked_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <MessageQuotaDialog
        isOpen={showQuotaDialog}
        onClose={() => setShowQuotaDialog(false)}
        onUpgrade={() => {
          setShowQuotaDialog(false);
          navigate('/subscription-packages');
        }}
        userRole={userRole}
      />
    </div>
  );
}