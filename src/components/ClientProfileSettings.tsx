import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Phone, Mail, Calendar, Heart, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export function ClientProfileSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile form state
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    age: '',
    bio: '',
    occupation: '',
    budget_min: '',
    budget_max: '',
    preferred_locations: [] as string[],
    lifestyle_preferences: [] as string[],
  });

  const lifestyleOptions = [
    'Pet Friendly', 'Gym Access', 'Coworking Space', 'Swimming Pool',
    'Rooftop Access', 'Garden/Patio', 'Parking', 'Security',
    'WiFi Included', 'Utilities Included', 'Furnished', 'Balcony'
  ];

  const locationOptions = [
    'Tulum Centro', 'Tulum Beach', 'Aldea Zama', 'La Veleta',
    'Playa del Carmen', 'Cancún', 'Cozumel', 'Bacalar'
  ];

  useEffect(() => {
    if (user?.user_metadata) {
      setProfile({
        full_name: user.user_metadata.full_name || '',
        email: user.email || '',
        phone: user.user_metadata.phone || '',
        location: user.user_metadata.location || '',
        age: user.user_metadata.age || '',
        bio: user.user_metadata.bio || '',
        occupation: user.user_metadata.occupation || '',
        budget_min: user.user_metadata.budget_min || '',
        budget_max: user.user_metadata.budget_max || '',
        preferred_locations: user.user_metadata.preferred_locations || [],
        lifestyle_preferences: user.user_metadata.lifestyle_preferences || [],
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would update the user profile in Supabase
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePreference = (preference: string, type: 'location' | 'lifestyle') => {
    if (type === 'location') {
      setProfile(prev => ({
        ...prev,
        preferred_locations: prev.preferred_locations.includes(preference)
          ? prev.preferred_locations.filter(p => p !== preference)
          : [...prev.preferred_locations, preference]
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        lifestyle_preferences: prev.lifestyle_preferences.includes(preference)
          ? prev.lifestyle_preferences.filter(p => p !== preference)
          : [...prev.lifestyle_preferences, preference]
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      {/* Basic Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name" className="text-foreground">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="age" className="text-foreground">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted border-border text-muted-foreground"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-foreground">Phone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="location" className="text-foreground">Current Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                className="bg-background border-border text-foreground"
                placeholder="e.g., Tulum, Mexico"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="occupation" className="text-foreground">Occupation</Label>
              <Input
                id="occupation"
                value={profile.occupation}
                onChange={(e) => setProfile(prev => ({ ...prev, occupation: e.target.value }))}
                className="bg-background border-border text-foreground"
                placeholder="e.g., Digital Nomad, Developer, Designer"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="bio" className="text-foreground">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="bg-background border-border text-foreground"
                placeholder="Tell us a bit about yourself..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Preferences */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Home className="w-5 h-5" />
            Budget Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget_min" className="text-foreground">Minimum Budget (USD/month)</Label>
              <Input
                id="budget_min"
                type="number"
                value={profile.budget_min}
                onChange={(e) => setProfile(prev => ({ ...prev, budget_min: e.target.value }))}
                className="bg-background border-border text-foreground"
                placeholder="1000"
              />
            </div>
            <div>
              <Label htmlFor="budget_max" className="text-foreground">Maximum Budget (USD/month)</Label>
              <Input
                id="budget_max"
                type="number"
                value={profile.budget_max}
                onChange={(e) => setProfile(prev => ({ ...prev, budget_max: e.target.value }))}
                className="bg-background border-border text-foreground"
                placeholder="5000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Preferences */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Preferred Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {locationOptions.map((location) => (
              <Badge
                key={location}
                variant={profile.preferred_locations.includes(location) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => togglePreference(location, 'location')}
              >
                {location}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle Preferences */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Lifestyle Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {lifestyleOptions.map((lifestyle) => (
              <Badge
                key={lifestyle}
                variant={profile.lifestyle_preferences.includes(lifestyle) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => togglePreference(lifestyle, 'lifestyle')}
              >
                {lifestyle}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90">
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}