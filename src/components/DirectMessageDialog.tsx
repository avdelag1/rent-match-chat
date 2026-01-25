import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Loader2, Sparkles, Bike, CircleDot } from 'lucide-react';
import { useDirectMessageListing } from '@/hooks/useDirectMessageListing';

interface DirectMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    category: string;
    price?: number;
    images?: string[];
    user_id: string;
  };
  ownerName?: string;
}

export function DirectMessageDialog({
  isOpen,
  onClose,
  listing,
  ownerName = 'the owner'
}: DirectMessageDialogProps) {
  const navigate = useNavigate();
  const { sendDirectMessage, isLoading, isFreeMessagingCategory } = useDirectMessageListing();
  const [message, setMessage] = useState('');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'motorcycle':
        return <CircleDot className="w-4 h-4" />;
      case 'bicycle':
        return <Bike className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'motorcycle':
        return 'Motorcycle';
      case 'bicycle':
        return 'Bicycle';
      default:
        return category;
    }
  };

  const defaultMessage = `Hi! I'm interested in your ${getCategoryLabel(listing.category).toLowerCase()}: "${listing.title}". Is it still available?`;

  const handleSend = async () => {
    try {
      const result = await sendDirectMessage({
        listingId: listing.id,
        ownerId: listing.user_id,
        listingTitle: listing.title,
        listingCategory: listing.category,
        initialMessage: message || defaultMessage
      });

      onClose();

      // Navigate to the conversation
      navigate(`/messaging?conversationId=${result.conversationId}`);
    } catch (error) {
      // Error is handled by the hook's onError
    }
  };

  if (!isFreeMessagingCategory(listing.category)) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <MessageCircle className="w-5 h-5 text-primary" />
            Message {ownerName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Send a direct message about this listing
          </DialogDescription>
        </DialogHeader>

        {/* Listing Preview */}
        <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
          {listing.images && listing.images[0] && (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm truncate">{listing.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-primary/20 text-primary border-0 text-xs flex items-center gap-1">
                {getCategoryIcon(listing.category)}
                {getCategoryLabel(listing.category)}
              </Badge>
              {listing.price && (
                <span className="text-sm font-semibold text-green-400">
                  ${listing.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Free Messaging Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-lg">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">
            Free messaging for Motos & Bicycles!
          </span>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Your message</label>
          <Textarea
            placeholder={defaultMessage}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px] resize-none"
          />
          <p className="text-xs text-gray-500">
            Leave empty to send the default message
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
