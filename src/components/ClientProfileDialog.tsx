
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoUploadManager } from '@/components/PhotoUploadManager';
import { useClientProfile, useSaveClientProfile } from '@/hooks/useClientProfile';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

// Predefined tag categories
const PROPERTY_TAGS = [
  'Looking to rent long-term', 'Short-term rental seeker', 'Interested in purchasing property',
  'Open to rent-to-own', 'Flexible lease terms', 'Corporate housing needed',
  'Family-friendly housing', 'Student accommodation',
];

const TRANSPORTATION_TAGS = [
  'Need motorcycle rental', 'Looking to buy motorcycle', 'Bicycle enthusiast',
  'Need yacht charter', 'Interested in yacht purchase', 'Daily commuter', 'Weekend explorer',
];

const LIFESTYLE_TAGS = [
  'Pet-friendly required', 'Eco-conscious living', 'Digital nomad', 'Fitness & wellness focused',
  'Beach lover', 'City center preference', 'Quiet neighborhood', 'Social & community-oriented',
  'Work-from-home setup', 'Minimalist lifestyle',
];

const FINANCIAL_TAGS = [
  'Verified income', 'Excellent credit score', 'Landlord references available',
  'Long-term employment', 'Flexible budget',
];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function ClientProfileDialog({ open, onOpenChange }: Props) {
  const { data, isLoading } = useClientProfile();
  const saveMutation = useSaveClientProfile();

  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<string>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [profileImages, setProfileImages] = useState<string[]>([]);

  useEffect(() => {
    if (!data) return;
    setName(data.name ?? '');
    setAge(data.age ?? '');
    setGender(data.gender ?? '');
    setInterests(data.interests ?? []);
    setActivities(data.preferred_activities ?? []);
    setProfileImages(data.profile_images ?? []);
  }, [data]);

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      console.log('Starting image upload for:', file.name);
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.data.user.id}/${fileName}`;

      console.log('Uploading to path:', filePath);

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    console.log('Saving profile with images:', profileImages);
    const payload = {
      name: name || null,
      age: age === '' ? null : Number(age),
      gender: gender || null,
      bio: null, // No longer using bio field
      interests: interests,
      preferred_activities: activities,
      profile_images: profileImages,
    };

    console.log('Profile payload:', payload);
    await saveMutation.mutateAsync(payload);
    toast({ title: 'Profile saved', description: 'Your profile has been updated.' });
    onOpenChange(false);
  };

  const toggleTag = (tag: string, isInterestTag: boolean) => {
    const totalTags = interests.length + activities.length;
    
    if (isInterestTag) {
      if (interests.includes(tag)) {
        setInterests(interests.filter(t => t !== tag));
      } else if (totalTags < 10) {
        setInterests([...interests, tag]);
      }
    } else {
      if (activities.includes(tag)) {
        setActivities(activities.filter(t => t !== tag));
      } else if (totalTags < 10) {
        setActivities([...activities, tag]);
      }
    }
  };

  const totalTags = interests.length + activities.length;
  const completionPercentage = Math.round(
    ((name ? 25 : 0) + (age ? 15 : 0) + (gender ? 10 : 0) + (profileImages.length > 0 ? 20 : 0) + (totalTags >= 5 ? 30 : totalTags * 6)) / 100 * 100
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Edit Your Profile
            </DialogTitle>
            <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
              {completionPercentage}% Complete
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-4 space-y-6">
            {/* Profile Photos Section - Priority #1 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white text-lg sm:text-xl font-bold">📸 Profile Photos</Label>
                  <p className="text-white/60 text-xs sm:text-sm mt-1">Add up to 10 photos • First photo is your main photo</p>
                </div>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-400">
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

            {/* Basic Info Section */}
            <div className="space-y-4">
              <Label className="text-white text-lg sm:text-xl font-bold">👤 Basic Information</Label>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/90 text-sm sm:text-base">Full Name *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your full name" 
                  className="h-12 text-base bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-white/90 text-sm sm:text-base">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    placeholder="25"
                    className="h-12 text-base bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400"
                    min="18"
                    max="99"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/90 text-sm sm:text-base">Gender</Label>
                  <Select value={gender ?? ''} onValueChange={setGender}>
                    <SelectTrigger className="h-12 text-base bg-white/5 border-white/20 text-white focus:border-orange-400">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 text-white">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

              {/* Profile Tags Section */}
              <div className="space-y-4">
                <div>
                  <Label className="text-white text-lg sm:text-xl font-bold">🏷️ Describe Yourself</Label>
                  <p className="text-white/60 text-xs sm:text-sm mt-1">Select 5-10 tags that best describe your needs and preferences</p>
                </div>
                
                {/* Property Interest Tags */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-semibold text-blue-400 flex items-center gap-2">
                    🏠 Property & Housing
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {PROPERTY_TAGS.map(tag => (
                      <label key={tag} className={`flex items-center gap-3 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all active:scale-95 ${
                        interests.includes(tag) 
                          ? 'bg-blue-500/20 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/30'
                      }`}>
                        <input
                          type="checkbox"
                          checked={interests.includes(tag)}
                          onChange={() => toggleTag(tag, true)}
                          className="w-5 h-5 rounded accent-blue-500"
                        />
                        <span className="text-xs sm:text-sm leading-tight">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Transportation Tags */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-semibold text-orange-400 flex items-center gap-2">
                    🚗 Transportation & Mobility
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {TRANSPORTATION_TAGS.map(tag => (
                      <label key={tag} className={`flex items-center gap-3 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all active:scale-95 ${
                        activities.includes(tag)
                          ? 'bg-orange-500/20 border-orange-400 text-white shadow-lg shadow-orange-500/20'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/30'
                      }`}>
                        <input
                          type="checkbox"
                          checked={activities.includes(tag)}
                          onChange={() => toggleTag(tag, false)}
                          className="w-5 h-5 rounded accent-orange-500"
                        />
                        <span className="text-xs sm:text-sm leading-tight">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Lifestyle Tags */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-semibold text-purple-400 flex items-center gap-2">
                    ✨ Lifestyle & Preferences
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {LIFESTYLE_TAGS.map(tag => (
                      <label key={tag} className={`flex items-center gap-3 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all active:scale-95 ${
                        interests.includes(tag)
                          ? 'bg-purple-500/20 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/30'
                      }`}>
                        <input
                          type="checkbox"
                          checked={interests.includes(tag)}
                          onChange={() => toggleTag(tag, true)}
                          className="w-5 h-5 rounded accent-purple-500"
                        />
                        <span className="text-xs sm:text-sm leading-tight">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Financial & Verification Tags */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-semibold text-green-400 flex items-center gap-2">
                    💰 Financial & Verification
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {FINANCIAL_TAGS.map(tag => (
                      <label key={tag} className={`flex items-center gap-3 p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all active:scale-95 ${
                        activities.includes(tag)
                          ? 'bg-green-500/20 border-green-400 text-white shadow-lg shadow-green-500/20'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/30'
                      }`}>
                        <input
                          type="checkbox"
                          checked={activities.includes(tag)}
                          onChange={() => toggleTag(tag, false)}
                          className="w-5 h-5 rounded accent-green-500"
                        />
                        <span className="text-xs sm:text-sm leading-tight">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tag Counter & Clear Button */}
                <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border-2 border-white/20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm sm:text-lg">
                      {totalTags}
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">
                        {totalTags} / 10 tags selected
                      </p>
                      <p className="text-xs text-white/60">
                        {totalTags < 5 ? 'Select at least 5 tags' : totalTags >= 10 ? 'Maximum reached!' : 'Good progress!'}
                      </p>
                    </div>
                  </div>
                  {totalTags > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setInterests([]);
                        setActivities([]);
                      }}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10 px-4"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

        <DialogFooter className="px-4 sm:px-6 py-4 border-t border-white/10 flex-row gap-3 shrink-0">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 text-white/70 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending || isLoading || !name.trim()}
            className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-base"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
