import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, User, Calendar, MessageCircle, CheckCircle, Trash2, Ban, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { PropertyImageGallery } from './PropertyImageGallery';
import { useNavigate } from 'react-router-dom';
import { useStartConversation } from '@/hooks/useConversations';
import { toast } from '@/hooks/use-toast';
import { useState, useCallback, memo } from 'react';
import { logger } from '@/utils/prodLogger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion, AnimatePresence } from 'framer-motion';

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
  gender?: string;
  city?: string;
}

interface LikedClientInsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: LikedClient | null;
}

function LikedClientInsightsModalComponent({ open, onOpenChange, client }: LikedClientInsightsModalProps) {
  const navigate = useNavigate();
  const startConversation = useStartConversation();
  const queryClient = useQueryClient();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const clientImages = client?.profile_images || client?.images || [];

  // Reset image index when modal opens
  useEffect(() => {
    if (open) {
      setCurrentImageIndex(0);
    }
  }, [open]);

  // Delete mutation - Remove from liked clients
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || !client) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('owner_likes')
        .delete()
        .eq('owner_id', user.user.id)
        .eq('client_id', client.user_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liked-clients'] });
      toast({
        title: 'Client removed',
        description: 'Client removed from your liked list.',
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove client from liked list.',
        variant: 'destructive',
      });
    }
  });

  // Block mutation
  const blockMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || !client) throw new Error('Not authenticated');

      const { error: blockError } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.user.id,
          blocked_id: client.user_id
        });

      if (blockError && !blockError.message.includes('duplicate')) {
        logger.error('Block error:', blockError);
        throw blockError;
      }

      // Also remove from owner_likes
      await supabase
        .from('owner_likes')
        .delete()
        .eq('owner_id', user.user.id)
        .eq('client_id', client.user_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liked-clients'] });
      toast({
        title: 'Client blocked',
        description: 'Client blocked successfully.',
      });
      setShowBlockDialog(false);
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to block client.',
        variant: 'destructive',
      });
    }
  });

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: async ({ reason, details }: { reason: string; details: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || !client) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.user.id,
          reported_user_id: client.user_id,
          report_reason: reason,
          report_details: details,
          status: 'pending'
        });

      if (error) {
        logger.error('Report submission error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Report submitted',
        description: "We'll review it shortly.",
      });
      setShowReportDialog(false);
      setReportReason('');
      setReportDetails('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit report.',
        variant: 'destructive',
      });
    }
  });

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
    setShowDeleteDialog(false);
  };

  const handleBlock = () => {
    setShowBlockDialog(true);
  };

  const handleConfirmBlock = () => {
    blockMutation.mutate();
  };

  const handleReport = () => {
    setShowReportDialog(true);
  };

  const handleSubmitReport = () => {
    if (!reportReason) {
      toast({
        title: 'Error',
        description: 'Please select a reason for your report.',
        variant: 'destructive',
      });
      return;
    }
    reportMutation.mutate({ reason: reportReason, details: reportDetails });
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? clientImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === clientImages.length - 1 ? 0 : prev + 1));
  };

  const handleImageClick = () => {
    if (clientImages.length > 0) {
      setGalleryOpen(true);
    }
  };

  const handleMessage = useCallback(async () => {
    if (!client) return;

    setIsCreatingConversation(true);
    try {
      toast({
        title: 'Starting conversation',
        description: 'Creating a new conversation...',
      });

      const result = await startConversation.mutateAsync({
        otherUserId: client.user_id,
        initialMessage: `Hi ${client.name}! I'd like to connect with you.`,
        canStartNewConversation: true,
      });

      if (result?.conversationId) {
        navigate(`/messages?conversationId=${result.conversationId}`);
        onOpenChange(false);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        logger.error('Error starting conversation:', error);
      }
      toast({
        title: 'Could not start conversation',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingConversation(false);
    }
  }, [client, startConversation, navigate, onOpenChange]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100%-16px)] max-w-[500px] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 py-3 border-b shrink-0">
            <DialogTitle className="text-base sm:text-lg font-semibold">Client Profile</DialogTitle>
          </DialogHeader>

          {!client ? (
            <div className="p-6 space-y-4">
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
              <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          ) : (
            <ScrollArea className="flex-1 h-full overflow-x-hidden">
              <div className="space-y-4 py-4 px-4 sm:px-6 pb-6 w-full max-w-full overflow-x-hidden">
                {/* Single Large Photo Carousel */}
                {clientImages.length > 0 && (
                  <div className="space-y-2">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted group">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentImageIndex}
                          src={clientImages[currentImageIndex]}
                          alt={`Client photo ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={handleImageClick}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </AnimatePresence>

                      {/* Navigation Arrows */}
                      {clientImages.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-sm z-10"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}

                      {/* Photo Counter */}
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                        {currentImageIndex + 1} / {clientImages.length}
                      </div>

                      {/* Tap to view hint */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 px-4 py-2 rounded-full text-sm font-medium">
                          Tap to view full size
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Info */}
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-xl border border-primary/20">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">{client.name}</h3>
                        {client.verified && (
                          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {client.age && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{client.age} yrs</span>
                          </div>
                        )}
                        {client.gender && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              <span>{client.gender}</span>
                            </div>
                          </>
                        )}
                        {(client.location || client.city) && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{client.city || 'Location verified'}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {client.occupation && (
                    <div className="pt-3 border-t border-primary/10">
                      <p className="text-sm"><span className="font-medium">Occupation:</span> {client.occupation}</p>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {client.bio && (
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <h4 className="font-semibold mb-2">About</h4>
                    <p className="text-sm text-foreground leading-relaxed">{client.bio}</p>
                  </div>
                )}

                {/* Interests */}
                {client.interests && client.interests.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {client.interests.slice(0, 8).map((interest) => (
                        <Badge
                          key={`interest-${interest}`}
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          {interest}
                        </Badge>
                      ))}
                      {client.interests.length > 8 && (
                        <Badge variant="outline">+{client.interests.length - 8} more</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Profile Details */}
                <div>
                  <h4 className="font-semibold mb-3">Profile Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                      client.verified
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-muted/30 border-muted'
                    }`}>
                      <CheckCircle className={`w-4 h-4 ${client.verified ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <div>
                        <span className="text-sm font-medium">ID Verified</span>
                        <p className="text-xs text-muted-foreground">{client.verified ? 'Confirmed' : 'Pending'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-muted">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium">Photos</span>
                        <p className="text-xs text-muted-foreground">{clientImages.length} uploaded</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liked Date */}
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Liked on {new Date(client.liked_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="px-4 sm:px-6 py-3 border-t shrink-0 flex-col sm:flex-row gap-2 bg-muted/30">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={handleDelete}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
              <Button
                onClick={handleBlock}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30 text-orange-700 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 font-medium"
                disabled={blockMutation.isPending}
              >
                <Ban className="w-4 h-4 mr-1.5" />
                Block
              </Button>
              <Button
                onClick={handleReport}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 font-medium"
                disabled={reportMutation.isPending}
              >
                <Flag className="w-4 h-4 mr-1.5" />
                Report
              </Button>
            </div>
            <Button
              onClick={handleMessage}
              disabled={isCreatingConversation || !client}
              size="sm"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-500/30"
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              {isCreatingConversation ? 'Starting...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>

        {/* Full-screen Image Gallery */}
        {clientImages.length > 0 && (
          <PropertyImageGallery
            images={clientImages}
            alt={`${client?.name}'s profile photos`}
            isOpen={galleryOpen}
            onClose={() => setGalleryOpen(false)}
            initialIndex={currentImageIndex}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Remove from Liked Clients
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {client?.name} from your liked clients? You can always like them again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-orange-500" />
              Block Client
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {client?.name}? This will remove them from your liked clients and prevent any future interactions. This action can be reversed in settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBlock}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {blockMutation.isPending ? 'Blocking...' : 'Block Client'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-yellow-500" />
              Report Client
            </DialogTitle>
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
                placeholder="Please provide any additional information..."
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
              disabled={!reportReason || reportMutation.isPending}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {reportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Memoize component to prevent unnecessary re-renders
export const LikedClientInsightsModal = memo(LikedClientInsightsModalComponent, (prevProps, nextProps) => {
  return (
    prevProps.client?.id === nextProps.client?.id &&
    prevProps.open === nextProps.open
  );
});
