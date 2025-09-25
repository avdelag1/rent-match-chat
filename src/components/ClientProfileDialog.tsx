
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoUploadManager } from '@/components/PhotoUploadManager';
import { useClientProfile, useSaveClientProfile } from '@/hooks/useClientProfile';
import { toast } from '@/hooks/use-toast';

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
  const [bio, setBio] = useState<string>('');
  const [interests, setInterests] = useState<string>('');
  const [activities, setActivities] = useState<string>('');
  const [profileImages, setProfileImages] = useState<string[]>([]);

  useEffect(() => {
    if (!data) return;
    setName(data.name ?? '');
    setAge(data.age ?? '');
    setGender(data.gender ?? '');
    setBio(data.bio ?? '');
    setInterests((data.interests ?? []).join(', '));
    setActivities((data.preferred_activities ?? []).join(', '));
    setProfileImages(data.profile_images ?? []);
  }, [data]);

  const handleImageUpload = async (file: File): Promise<string> => {
    // For now, create object URL - in production, upload to Supabase Storage
    const url = URL.createObjectURL(file);
    console.log('Uploaded image:', file.name);
    return url;
  };

  const handleSave = async () => {
    const payload = {
      name: name || null,
      age: age === '' ? null : Number(age),
      gender: gender || null,
      bio: bio || null,
      interests: interests ? interests.split(',').map((s) => s.trim()).filter(Boolean) : [],
      preferred_activities: activities ? activities.split(',').map((s) => s.trim()).filter(Boolean) : [],
      profile_images: profileImages,
    };

    await saveMutation.mutateAsync(payload);
    toast({ title: 'Profile saved', description: 'Your profile has been updated.' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[85vh] flex flex-col p-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 text-white overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-white/10">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Complete Your Profile
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="grid gap-6 py-4">
            {/* Profile Photos Section */}
            <div className="space-y-3">
              <Label className="text-white/90 text-lg font-semibold">Profile Photos</Label>
              <p className="text-white/60 text-sm">Add up to 10 photos to showcase yourself</p>
              <PhotoUploadManager
                maxPhotos={10}
                currentPhotos={profileImages}
                onPhotosChange={setProfileImages}
                uploadType="profile"
                onUpload={handleImageUpload}
              />
            </div>

            {/* Basic Info */}
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/90 font-medium">Full Name *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your full name" 
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-white/90 font-medium">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    placeholder="25"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400"
                    min="18"
                    max="99"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/90 font-medium">Gender</Label>
                  <Select value={gender ?? ''} onValueChange={setGender}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-orange-400">
                      <SelectValue placeholder="Select gender" />
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

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white/90 font-medium">About Me</Label>
                <Textarea 
                  id="bio" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Tell property owners about yourself, your lifestyle, hobbies, and what makes you a great tenant..." 
                  className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400 resize-none"
                  maxLength={500}
                />
                <p className="text-white/40 text-xs">{bio.length}/500 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests" className="text-white/90 font-medium">Interests & Hobbies</Label>
                <Input 
                  id="interests" 
                  value={interests} 
                  onChange={(e) => setInterests(e.target.value)} 
                  placeholder="Cooking, Yoga, Surfing, Photography, Music" 
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400"
                />
                <p className="text-white/40 text-xs">Separate with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activities" className="text-white/90 font-medium">Preferred Activities</Label>
                <Input 
                  id="activities" 
                  value={activities} 
                  onChange={(e) => setActivities(e.target.value)} 
                  placeholder="Hiking, Biking, Beach walks, Coworking, Nightlife" 
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400"
                />
                <p className="text-white/40 text-xs">What do you like to do in your free time?</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-white/10 flex gap-3">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending || isLoading || !name.trim()}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
