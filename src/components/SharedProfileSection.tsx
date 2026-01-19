import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Share2, Link2, Mail, MessageCircle, Send, Check, Gift, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  copyToClipboard,
  shareViaNavigator,
  shareViaWhatsApp,
  shareViaFacebook,
  shareViaTwitter,
  shareViaEmail,
  shareViaSMS,
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
  const [isShared, setIsShared] = useState(true); // Default to shared
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);
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

  const handleNativeShare = async () => {
    await shareViaNavigator({
      title: profileName,
      text: shareText,
      url: shareUrl,
    });
  };

  const handleWhatsAppShare = async () => {
    shareViaWhatsApp(shareUrl, shareText);
  };

  const handleFacebookShare = async () => {
    shareViaFacebook(shareUrl);
  };

  const handleTwitterShare = async () => {
    shareViaTwitter(shareUrl, shareText);
  };

  const handleEmailShare = async () => {
    if (!recipientEmail) {
      toast.error('Please enter an email address');
      return;
    }
    shareViaEmail(shareUrl, `Check out ${profileName}'s profile`, shareText);
    setRecipientEmail('');
  };

  const handleSMSShare = async () => {
    shareViaSMS(shareUrl, shareText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-200/50 dark:border-emerald-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <CardTitle>Share Your Profile</CardTitle>
                <CardDescription>
                  Get free message activations when people sign up through your link
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={isShared}
              onCheckedChange={setIsShared}
              className="ml-2"
            />
          </div>
        </CardHeader>

        {isShared && (
          <CardContent className="space-y-4">
            {/* Promotional Benefits */}
            <div className="space-y-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
              <h4 className="font-medium text-sm text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Benefits of Sharing Your Profile
              </h4>
              <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Earn <strong>free message activations</strong> for each referral</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Expand your network and find perfect matches</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Help friends and family discover amazing opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>No limits on sharing – the more you share, the more you earn!</span>
                </li>
              </ul>
            </div>

            {/* Share Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Shareable Link</label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-background"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="min-w-[100px]"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                        Copied!
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Link2 className="w-4 h-4" />
                        Copy
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </div>

            {/* Share Methods Toggle */}
            <Button
              onClick={() => setShowShareOptions(!showShareOptions)}
              variant="outline"
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {showShareOptions ? 'Hide' : 'Show'} Share Options
            </Button>

            {/* Share Options */}
            <AnimatePresence>
              {showShareOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {/* Social Share Buttons */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Share via</label>
                    <div className="grid grid-cols-2 gap-2">
                      {navigator.share && (
                        <Button
                          onClick={handleNativeShare}
                          variant="outline"
                          className="justify-start gap-2"
                          size="sm"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>
                      )}

                      <Button
                        onClick={handleWhatsAppShare}
                        variant="outline"
                        className="justify-start gap-2 hover:bg-green-50 dark:hover:bg-green-950/20"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        WhatsApp
                      </Button>

                      <Button
                        onClick={handleFacebookShare}
                        variant="outline"
                        className="justify-start gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Facebook
                      </Button>

                      <Button
                        onClick={handleTwitterShare}
                        variant="outline"
                        className="justify-start gap-2 hover:bg-sky-50 dark:hover:bg-sky-950/20"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                        Twitter
                      </Button>

                      <Button
                        onClick={handleSMSShare}
                        variant="outline"
                        className="justify-start gap-2"
                        size="sm"
                      >
                        <Send className="w-4 h-4" />
                        SMS
                      </Button>
                    </div>
                  </div>

                  {/* Email Share */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Share via Email</label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="friend@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="flex-1"
                        size={1}
                      />
                      <Button
                        onClick={handleEmailShare}
                        variant="outline"
                        disabled={!recipientEmail}
                        className="min-w-[60px] px-2"
                        size="sm"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Text */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                Your friends will earn rewards too when they join through your link! 🎉
              </p>
            </div>
          </CardContent>
        )}

        {!isShared && (
          <CardContent className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Enable sharing to start earning free message activations and help others discover great opportunities!
            </p>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
