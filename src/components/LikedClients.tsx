import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClientProfileCard } from "@/components/ClientProfileCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface LikedClient {
  id: string;
  user_id: string;
  name: string;
  age: number;
  bio: string;
  profile_images: string[];
  location: any;
  liked_at: string;
}

export function LikedClients() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: likedClients = [], isLoading } = useQuery({
    queryKey: ['liked-clients', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First get the liked user IDs
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('target_id, created_at')
        .eq('user_id', user.id)
        .eq('direction', 'right');

      if (likesError) throw likesError;
      if (!likes || likes.length === 0) return [];

      // Then get the profiles for those users
      const { data: profiles, error: profilesError } = await supabase
        .from('client_profiles')
        .select('*')
        .in('user_id', likes.map(like => like.target_id));

      if (profilesError) throw profilesError;
      if (!profiles) return [];

      return profiles.map(profile => {
        const like = likes.find(l => l.target_id === profile.user_id);
        return {
          id: profile.id.toString(),
          user_id: profile.user_id,
          name: profile.name || 'Unknown',
          age: profile.age || 0,
          bio: profile.bio || '',
          profile_images: profile.profile_images || [],
          location: profile.location,
          liked_at: like?.created_at || ''
        };
      }) as LikedClient[];
    },
    enabled: !!user?.id,
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

  const filteredClients = likedClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMessage = (clientId: string) => {
    toast.success("Message feature coming soon!");
  };

  const handleRemoveLike = (clientId: string) => {
    removeLikeMutation.mutate(clientId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Liked Clients</h1>
            <p className="text-gray-600">Manage your liked client profiles and start conversations</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-orange-300 focus:ring-orange-500/20"
            />
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-5 h-5" />
            <span className="font-medium">{filteredClients.length} clients</span>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Liked Clients Yet</h2>
          <p className="text-gray-600 mb-6">
            Start browsing client profiles and like the ones you're interested in working with
          </p>
          <Button 
            onClick={() => window.location.href = '/owner/dashboard'}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Browse Clients
          </Button>
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
              <Card className="p-6 h-full bg-white/80 backdrop-blur-sm border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
                <div className="relative mb-4">
                  {client.profile_images.length > 0 ? (
                    <img
                      src={client.profile_images[0]}
                      alt={client.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Users className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleMessage(client.user_id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveLike(client.user_id)}
                      className="shadow-lg"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
                    <p className="text-gray-600">Age: {client.age}</p>
                  </div>
                  
                  {client.bio && (
                    <p className="text-gray-700 text-sm line-clamp-3">{client.bio}</p>
                  )}
                  
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
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
  );
}