import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useReferralCode } from '@/hooks/useReferralCode';
import {
  copyToClipboard,
  shareViaWhatsApp,
  shareViaFacebook,
  shareViaTwitter,
  shareViaEmail,
  shareViaSMS,
} from '@/hooks/useSharing';
import { toast } from 'sonner';
import {
  Copy,
  Share2,
  MessageCircle,
  Mail,
  Facebook,
  Check,
  QrCode,
  Loader2,
} from 'lucide-react';
import { FaWhatsapp, FaTwitter } from 'react-icons/fa';

interface ReferralShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralShareDialog({ isOpen, onClose }: ReferralShareDialogProps) {
  const { referralCode, referralUrl, isLoading } = useReferralCode();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const shareText = `Join me on Swipess! Sign up using my referral code ${referralCode} and we both get a free message activation!`;
  const shareSubject = 'Join Swipess - Free Message Activation!';

  const handleCopyLink = async () => {
    if (!referralUrl) return;

    const success = await copyToClipboard(referralUrl);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && referralUrl) {
      try {
        await navigator.share({
          title: shareSubject,
          text: shareText,
          url: referralUrl,
        });
        onClose();
      } catch (err) {
        // User cancelled
      }
    }
  };

  const handleWhatsApp = () => {
    if (referralUrl) {
      shareViaWhatsApp(referralUrl, shareText);
      onClose();
    }
  };

  const handleFacebook = () => {
    if (referralUrl) {
      shareViaFacebook(referralUrl);
      onClose();
    }
  };

  const handleTwitter = () => {
    if (referralUrl) {
      shareViaTwitter(referralUrl, shareText);
      onClose();
    }
  };

  const handleEmail = () => {
    if (referralUrl) {
      shareViaEmail(referralUrl, shareSubject, shareText);
      onClose();
    }
  };

  const handleSMS = () => {
    if (referralUrl) {
      shareViaSMS(referralUrl, shareText);
      onClose();
    }
  };

  const qrCodeUrl = referralUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralUrl)}&bgcolor=ffffff&color=000000&format=svg`
    : '';

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      onClick: handleCopyLink,
      className: copied
        ? 'bg-green-500 hover:bg-green-600 text-white'
        : 'bg-muted hover:bg-muted/80',
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      onClick: handleWhatsApp,
      className: 'bg-[#25D366] hover:bg-[#20bd5a] text-white',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      onClick: handleFacebook,
      className: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      onClick: handleTwitter,
      className: 'bg-[#1DA1F2] hover:bg-[#1a91da] text-white',
    },
    {
      name: 'Email',
      icon: Mail,
      onClick: handleEmail,
      className: 'bg-gray-600 hover:bg-gray-700 text-white',
    },
    {
      name: 'SMS',
      icon: MessageCircle,
      onClick: handleSMS,
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Referral
          </DialogTitle>
          <DialogDescription>
            Share your referral link with friends. When they sign up, you both get 1 free message activation!
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Referral Code Display */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Your Code</p>
              <p className="text-3xl font-bold tracking-widest font-mono text-primary">
                {referralCode}
              </p>
            </div>

            {/* Share Options Grid */}
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.onClick}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${option.className}`}
                >
                  <option.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{option.name}</span>
                </button>
              ))}
            </div>

            {/* Native Share (if available) */}
            {navigator.share && (
              <Button onClick={handleNativeShare} className="w-full" size="lg">
                <Share2 className="w-4 h-4 mr-2" />
                Share via...
              </Button>
            )}

            {/* QR Code Toggle */}
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => setShowQr(!showQr)}
                className="w-full"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {showQr ? 'Hide' : 'Show'} QR Code
              </Button>

              {showQr && qrCodeUrl && (
                <div className="flex flex-col items-center p-4 bg-white rounded-lg">
                  <img
                    src={qrCodeUrl}
                    alt="Referral QR Code"
                    className="w-40 h-40"
                  />
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Scan to sign up with your referral
                  </p>
                </div>
              )}
            </div>

            {/* Referral Link (truncated) */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground break-all">
                {referralUrl}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
