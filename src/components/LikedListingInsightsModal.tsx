import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Bed, Bath, Square, DollarSign, MessageCircle, Sparkles, Trash2, Ban, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { PropertyImageGallery } from './PropertyImageGallery';
import { useNavigate } from 'react-router-dom';
import { useStartConversation } from '@/hooks/useConversations';
import { toast } from '@/hooks/use-toast';
import { useState, useMemo, useCallback, memo } from 'react';
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

interface LikedListingInsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: any | null;
}

function LikedListingInsightsModalComponent({ open, onOpenChange, listing }: LikedListingInsightsModalProps) {
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

  const images = listing?.images || [];

  // Reset image index when modal opens or listing changes
  useState(() => {
    if (open) {
      setCurrentImageIndex(0);
    }
  });

  // Delete mutation - Remove from liked properties
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || !listing) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.user.id)
        .eq('target_id', listing.id)
        .eq('direction', 'right');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liked-properties'] });
      toast({
        title: 'Removed from favorites',
        description: 'Property removed from your liked list.',
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove property from liked list.',
        variant: 'destructive',
      });
    }
  });

  // Block mutation - Block the owner of this listing
  const blockMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || !listing?.owner_id) throw new Error('Not authenticated or no owner');

      // Insert block record
      const { error: blockError } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.user.id,
          blocked_id: listing.owner_id
        });

      if (blockError && !blockError.message.includes('duplicate')) {
        logger.error('Block error:', blockError);
        throw blockError;
      }

      // Also remove from likes
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.user.id)
        .eq('target_id', listing.id)
        .eq('direction', 'right');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liked-properties'] });
      toast({
        title: 'Owner blocked',
        description: 'You will no longer see listings from this owner.',
      });
      setShowBlockDialog(false);
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to block owner.',
        variant: 'destructive',
      });
    }
  });

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: async ({ reason, details }: { reason: string; details: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || !listing?.owner_id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.user.id,
          reported_user_id: listing.owner_id,
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
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageClick = () => {
    if (images.length > 0) {
      setGalleryOpen(true);
    }
  };

  // Memoized callback to start conversation
  const handleMessage = useCallback(async () => {
    if (!listing?.owner_id) {
      toast({
        title: 'Error',
        description: 'Property owner information not available',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingConversation(true);
    try {
      toast({
        title: 'Starting conversation',
        description: 'Creating a new conversation...',
      });

      const result = await startConversation.mutateAsync({
        otherUserId: listing.owner_id,
        listingId: listing.id,
        initialMessage: `Hi! I'm interested in your property: ${listing.title}. Could you tell me more about it?`,
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
  }, [listing, startConversation, navigate, onOpenChange]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100%-16px)] max-w-[500px] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 py-3 border-b shrink-0">
            <DialogTitle className="text-base sm:text-lg font-semibold">Property Details</DialogTitle>
          </DialogHeader>

          {!listing ? (
            <div className="p-6">
              <Skeleton className="h-64 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <ScrollArea className="flex-1 h-full overflow-x-hidden">
              <div className="space-y-4 py-4 px-4 sm:px-6 pb-6 w-full max-w-full overflow-x-hidden">
                {/* Single Large Photo Carousel */}
                {images.length > 0 && (
                  <div className="space-y-2">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted group">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentImageIndex}
                          src={images[currentImageIndex]}
                          alt={`Property photo ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={handleImageClick}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </AnimatePresence>

                      {/* Navigation Arrows */}
                      {images.length > 1 && (
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
                        {currentImageIndex + 1} / {images.length}
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
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold flex-1">{listing.title}</h3>
                    <Badge className="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-700 dark:text-red-400 border-red-500/30 w-fit">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Liked
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{listing.address}</span>
                  </div>
                </div>

                {/* Price & Key Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                  <div className="flex flex-col items-center gap-1">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      ${listing.price?.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">per month</span>
                  </div>
                  {listing.beds && (
                    <div className="flex flex-col items-center gap-1">
                      <Bed className="w-5 h-5 text-primary" />
                      <span className="text-lg font-bold">{listing.beds}</span>
                      <span className="text-xs text-muted-foreground">bed{listing.beds !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {listing.baths && (
                    <div className="flex flex-col items-center gap-1">
                      <Bath className="w-5 h-5 text-primary" />
                      <span className="text-lg font-bold">{listing.baths}</span>
                      <span className="text-xs text-muted-foreground">bath{listing.baths !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {listing.square_footage && (
                    <div className="flex flex-col items-center gap-1">
                      <Square className="w-5 h-5 text-primary" />
                      <span className="text-lg font-bold">{listing.square_footage}</span>
                      <span className="text-xs text-muted-foreground">sqft</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {listing.description && (
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <h4 className="font-semibold text-base mb-2">About This Property</h4>
                    <p className="text-sm text-foreground leading-relaxed">{listing.description}</p>
                  </div>
                )}

                {/* Property Features */}
                <div>
                  <h4 className="font-semibold mb-2">Property Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {listing.property_type && <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">{listing.property_type}</Badge>}
                    {listing.furnished && <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20">Furnished</Badge>}
                    {listing.pet_friendly && <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">Pet Friendly</Badge>}
                    <Badge variant="outline" className={listing.status === 'available' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' : ''}>{listing.status}</Badge>
                  </div>
                </div>

                {/* Amenities */}
                {listing.amenities && listing.amenities.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenities.map((amenity: string) => (
                        <Badge key={`amenity-${amenity}`} variant="outline" className="bg-primary/5">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                )}
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
              disabled={isCreatingConversation || !listing}
              size="sm"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-500/30"
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              {isCreatingConversation ? 'Starting...' : 'Message Owner'}
            </Button>
          </DialogFooter>
        </DialogContent>

        {/* Full Screen Image Gallery */}
        {images.length > 0 && (
          <PropertyImageGallery
            images={images}
            alt={listing.title}
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
              Remove from Liked Properties
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this property from your liked list? You can always like it again later.
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
              Block Owner
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block this owner? You will no longer see their listings, and they won't be able to see your profile. This action can be reversed in settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBlock}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {blockMutation.isPending ? 'Blocking...' : 'Block Owner'}
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
              Report Property/Owner
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Reason for report</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fake_listing" id="fake_listing" />
                  <Label htmlFor="fake_listing" className="font-normal">Fake or misleading listing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="inappropriate" />
                  <Label htmlFor="inappropriate" className="font-normal">Inappropriate content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scam" id="scam" />
                  <Label htmlFor="scam" className="font-normal">Suspected scam</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="discrimination" id="discrimination" />
                  <Label htmlFor="discrimination" className="font-normal">Discrimination</Label>
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
export const LikedListingInsightsModal = memo(LikedListingInsightsModalComponent, (prevProps, nextProps) => {
  return (
    prevProps.listing?.id === nextProps.listing?.id &&
    prevProps.open === nextProps.open
  );
});
