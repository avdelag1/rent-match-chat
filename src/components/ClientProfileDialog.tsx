
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
      <DialogContent className="sm:max-w-2xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="grid gap-6 py-4">
            {/* Profile Photos Section */}
            <div>
              <PhotoUploadManager
                maxPhotos={10}
                currentPhotos={profileImages}
                onPhotosChange={setProfileImages}
                uploadType="profile"
                onUpload={handleImageUpload}
              />
            </div>

            {/* Basic Info */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={gender ?? ''} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." className="min-h-[100px]" />
              </div>

              <div>
                <Label htmlFor="interests">Interests (comma separated)</Label>
                <Input id="interests" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Cooking, Yoga, Surfing" />
              </div>

              <div>
                <Label htmlFor="activities">Preferred Activities (comma separated)</Label>
                <Input id="activities" value={activities} onChange={(e) => setActivities(e.target.value)} placeholder="Hiking, Biking" />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending || isLoading}>
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
