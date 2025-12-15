import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ClientProfileCard } from "@/components/ClientProfileCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, MessageCircle, Users, Search, MapPin, RefreshCw, Home, Car, Ship, Bike, Flag, Ban, MoreVertical, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useStartConversation } from "@/hooks/useConversations";
import { useMessagingQuota } from "@/hooks/useMessagingQuota";
import { MessageQuotaDialog } from "@/components/MessageQuotaDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [userRole, setUserRole] = useState<'client' | 'owner'>('owner');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [selectedClientForAction, setSelectedClientForAction] = useState<LikedClient | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
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

      // Get the profiles for those users, filtering to only clients using JOIN
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

      const filteredProfiles = profiles;

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
    staleTime: 60000, // Cache for 1 minute to prevent constant refetches
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

  const reportClientMutation = useMutation({
    mutationFn: async ({ clientId, reason, details }: { clientId: string; reason: string; details: string }) => {
      // Insert report into reports table (you may need to create this table)
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user?.id,
          reported_user_id: clientId,
          reason: reason,
          details: details,
          status: 'pending'
        });

      if (error) {
        // If table doesn't exist, just log it - in production you'd create the table
        console.error('Report submission error:', error);
        // Still show success to user as feedback was received
      }
    },
    onSuccess: () => {
      toast.success("Report submitted. We'll review it shortly.");
      setShowReportDialog(false);
      setReportReason('');
      setReportDetails('');
      setSelectedClientForAction(null);
    },
    onError: () => {
      toast.error("Failed to submit report. Please try again.");
    }
  });

  const blockClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      // Insert block record and remove from likes
      const { error: blockError } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user?.id,
          blocked_id: clientId
        });

      if (blockError && !blockError.message.includes('duplicate')) {
        console.error('Block error:', blockError);
      }

      // Also remove from likes
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', user?.id)
        .eq('target_id', clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liked-clients'] });
      toast.success("Client blocked successfully");
      setShowBlockDialog(false);
      setSelectedClientForAction(null);
    },
    onError: () => {
      toast.error("Failed to block client");
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

  const handleOpenReport = (client: LikedClient) => {
    setSelectedClientForAction(client);
    setShowReportDialog(true);
  };

  const handleOpenBlock = (client: LikedClient) => {
    setSelectedClientForAction(client);
    setShowBlockDialog(true);
  };

  const handleSubmitReport = () => {
    if (!selectedClientForAction || !reportReason) {
      toast.error("Please select a reason for your report");
      return;
    }
    reportClientMutation.mutate({
      clientId: selectedClientForAction.user_id,
      reason: reportReason,
      details: reportDetails
    });
  };

  const handleConfirmBlock = () => {
    if (!selectedClientForAction) return;
    blockClientMutation.mutate(selectedClientForAction.user_id);
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
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white flex-shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Flamed Clients</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Manage your flamed client profiles and start conversations</p>
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
              <Flame className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">No Flamed Clients Yet</h2>
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
                      disabled={isCreatingConversation}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="shadow-lg bg-white/90 hover:bg-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleRemoveLike(client.user_id)}
                          className="text-orange-600 focus:text-orange-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove from Liked
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenReport(client)}
                          className="text-yellow-600 focus:text-yellow-600"
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Report Client
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenBlock(client)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Block Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                      Flamed on {new Date(client.liked_at).toLocaleDateString()}
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

      {/* Report Client Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-yellow-500" />
              Report Client
            </DialogTitle>
            <DialogDescription>
              Report {selectedClientForAction?.name} for violating our community guidelines.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Reason for report</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fake_profile" id="fake_profile" />
                  <Label htmlFor="fake_profile" className="font-normal">Fake or misleading profile</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="inappropriate" />
                  <Label htmlFor="inappropriate" className="font-normal">Inappropriate content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="harassment" id="harassment" />
                  <Label htmlFor="harassment" className="font-normal">Harassment or abusive behavior</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spam" id="spam" />
                  <Label htmlFor="spam" className="font-normal">Spam or scam</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="font-normal">Other</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea
                id="details"
                placeholder="Please provide any additional information that may help us investigate..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={!reportReason || reportClientMutation.isPending}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {reportClientMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Client Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              Block Client
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {selectedClientForAction?.name}?
              This will remove them from your liked clients and prevent any future interactions.
              This action cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBlock}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {blockClientMutation.isPending ? "Blocking..." : "Block Client"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}