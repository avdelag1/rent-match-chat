import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Check, Copy, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  copyToClipboard,
  shareViaNavigator,
  generateShareUrl,
} from '@/hooks/useSharing';
import { useAuth } from '@/hooks/useAuth';

interface SharedProfileSectionProps {
  profileId?: string;
  profileName: string;
  isClient?: boolean;
}

export function SharedProfileSection({
  profileId,
  profileName,
  isClient = true,
}: SharedProfileSectionProps) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  if (!profileId || !user?.id) return null;

  const shareUrl = generateShareUrl({ profileId, referralId: user.id });
  const profileType = isClient ? 'client profile' : 'business profile';
  const shareText = `Check out ${profileName}'s ${profileType} on Zwipes! See their details and connect today.`;

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await shareViaNavigator({
        title: profileName,
        text: shareText,
        url: shareUrl,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Left side - Icon and text */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm">Share & Earn</h3>
                <p className="text-xs text-muted-foreground truncate">
                  Get free messages for referrals
                </p>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="h-9 px-3"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-xs">Copied</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-xs">Copy</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
              <Button
                onClick={handleShare}
                size="sm"
                className="h-9 px-3 gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-xs">Share</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
