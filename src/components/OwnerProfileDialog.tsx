import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PhotoUploadManager } from '@/components/PhotoUploadManager';
import { useOwnerProfile, useSaveOwnerProfile } from '@/hooks/useOwnerProfile';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Owner profile is for business information only

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function OwnerProfileDialog({ open, onOpenChange }: Props) {
  const { data, isLoading } = useOwnerProfile();
  const saveMutation = useSaveOwnerProfile();

  const [businessName, setBusinessName] = useState<string>('');
  const [businessLocation, setBusinessLocation] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [profileImages, setProfileImages] = useState<string[]>([]);

  useEffect(() => {
    if (!data) return;
    setBusinessName(data.business_name ?? '');
    setBusinessLocation(data.business_location ?? '');
    setContactEmail(data.contact_email ?? '');
    setContactPhone(data.contact_phone ?? '');
    setProfileImages(data.profile_images ?? []);
  }, [data]);

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.data.user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    const payload = {
      business_name: businessName || null,
      business_location: businessLocation || null,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      profile_images: profileImages,
    };

    await saveMutation.mutateAsync(payload);
    toast({ title: 'Owner Profile Saved', description: 'Your business information has been updated.' });
    onOpenChange(false);
  };

  const completionPercentage = Math.round(
    ((businessName ? 35 : 0) +
     (businessLocation ? 25 : 0) +
     (contactEmail ? 20 : 0) +
     (profileImages.length > 0 ? 20 : 0))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
              Edit Owner Profile
            </DialogTitle>
            <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
              {completionPercentage}% Complete
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-4 space-y-6">
            {/* Profile Photos Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white text-lg sm:text-xl font-bold">📸 Business Photos</Label>
                  <p className="text-white/60 text-xs sm:text-sm mt-1">Add photos of your properties • Up to 10 photos</p>
                </div>
                <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-red-400">
                  {profileImages.length}/10
                </Badge>
              </div>
              <PhotoUploadManager
                maxPhotos={10}
                currentPhotos={profileImages}
                onPhotosChange={setProfileImages}
                uploadType="profile"
                onUpload={handleImageUpload}
              />
            </div>

            {/* Business Info Section */}
            <div className="space-y-4">
              <Label className="text-white text-lg sm:text-xl font-bold">🏢 Business Information</Label>

              <div className="space-y-2">
                <Label htmlFor="business_name" className="text-white/90 text-sm sm:text-base">Business Name</Label>
                <Input
                  id="business_name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your property business name"
                  className="h-12 text-base bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-red-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_location" className="text-white/90 text-sm sm:text-base">Business Location</Label>
                <Input
                  id="business_location"
                  value={businessLocation}
                  onChange={(e) => setBusinessLocation(e.target.value)}
                  placeholder="City, Country"
                  className="h-12 text-base bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-red-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email" className="text-white/90 text-sm sm:text-base">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="business@example.com"
                  className="h-12 text-base bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-red-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="text-white/90 text-sm sm:text-base">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-12 text-base bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-red-400"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-4 sm:px-6 py-4 border-t border-white/10 shrink-0 bg-slate-900/50">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold shadow-lg"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
