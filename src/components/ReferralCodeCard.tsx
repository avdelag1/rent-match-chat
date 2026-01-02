import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useReferralCode } from '@/hooks/useReferralCode';
import { copyToClipboard } from '@/hooks/useSharing';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  QrCode,
  Share2,
  Users,
  Gift,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
} from 'lucide-react';

interface ReferralCodeCardProps {
  onShareClick?: () => void;
  compact?: boolean;
}

export function ReferralCodeCard({ onShareClick, compact = false }: ReferralCodeCardProps) {
  const { referralCode, totalReferrals, referralUrl, referralStats, isLoading } = useReferralCode();
  const [showQrCode, setShowQrCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);

  const handleCopyCode = async () => {
    if (!referralCode) return;

    const success = await copyToClipboard(referralCode);
    if (success) {
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy code');
    }
  };

  const handleCopyLink = async () => {
    if (!referralUrl) return;

    const success = await copyToClipboard(referralUrl);
    if (success) {
      toast.success('Referral link copied!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = () => {
    if (onShareClick) {
      onShareClick();
    } else if (navigator.share && referralUrl) {
      navigator.share({
        title: 'Join Swipess!',
        text: 'Sign up using my referral link and we both get a free message activation!',
        url: referralUrl,
      }).catch(() => {
        // User cancelled or error - fallback to copy
        handleCopyLink();
      });
    } else {
      handleCopyLink();
    }
  };

  // Generate QR code URL using a free API
  const qrCodeUrl = referralUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralUrl)}&bgcolor=ffffff&color=000000&format=svg`
    : '';

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Invite Friends</p>
                <p className="text-xs text-muted-foreground">
                  Both get 1 free message
                </p>
              </div>
            </div>
            <Button size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Invite Friends</CardTitle>
            <CardDescription>
              Share your code and both get rewards
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Reward Info */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">
                Earn Free Messages
              </p>
              <p className="text-sm text-muted-foreground">
                When a friend signs up with your code, you both get 1 free message activation!
              </p>
            </div>
          </div>
        </div>

        {/* Referral Code Display */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">
            Your Referral Code
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg p-4 text-center">
              <span className="text-2xl font-bold tracking-widest font-mono">
                {referralCode || '------'}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyCode}
              className="h-14 w-14"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleShare} className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowQrCode(!showQrCode)}
            className="w-full"
          >
            <QrCode className="w-4 h-4 mr-2" />
            {showQrCode ? 'Hide' : 'Show'} QR
          </Button>
        </div>

        {/* QR Code */}
        <AnimatePresence>
          {showQrCode && qrCodeUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col items-center p-4 bg-white rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="Referral QR Code"
                  className="w-48 h-48"
                />
                <p className="mt-3 text-xs text-gray-500 text-center">
                  Scan to sign up with your referral
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator />

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Referrals</span>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {totalReferrals}
          </Badge>
        </div>

        {/* Referral History */}
        {referralStats && referralStats.referrals.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setShowReferrals(!showReferrals)}
              className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
            >
              <span>Recent Referrals</span>
              {showReferrals ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {showReferrals && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {referralStats.referrals.slice(0, 5).map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        {referral.referredAvatar ? (
                          <img
                            src={referral.referredAvatar}
                            alt={referral.referredName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {referral.referredName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {referral.rewardClaimed && (
                        <Badge variant="outline" className="text-green-500 border-green-500/30">
                          <Check className="w-3 h-3 mr-1" />
                          Rewarded
                        </Badge>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
