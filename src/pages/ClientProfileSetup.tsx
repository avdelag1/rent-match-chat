import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useClientProfile, useSaveClientProfile } from '@/hooks/useClientProfile';
import { uploadPhotoBatch } from '@/utils/photoUpload';
import { validateImageFile } from '@/utils/fileValidation';
import {
  Camera, Upload, X, GripVertical, Home, Car, Briefcase,
  Heart, DollarSign, MapPin, User, Check, ArrowLeft, Sparkles,
  Building, Bike, UserCheck, Clock, Shield, Languages, Coffee
} from 'lucide-react';

const MAX_PHOTOS = 5;

// Service categories that clients might need (matching owner services)
const SERVICE_CATEGORIES = [
  { id: 'nanny', label: 'Nanny/Childcare', icon: <Heart className="w-4 h-4" /> },
  { id: 'chef', label: 'Personal Chef', icon: <Coffee className="w-4 h-4" /> },
  { id: 'cleaning', label: 'Cleaning Service', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'massage', label: 'Massage Therapist', icon: <Heart className="w-4 h-4" /> },
  { id: 'english_teacher', label: 'English Teacher', icon: <Languages className="w-4 h-4" /> },
  { id: 'spanish_teacher', label: 'Spanish Teacher', icon: <Languages className="w-4 h-4" /> },
  { id: 'yoga', label: 'Yoga Instructor', icon: <Heart className="w-4 h-4" /> },
  { id: 'personal_trainer', label: 'Personal Trainer', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'handyman', label: 'Handyman', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'gardener', label: 'Gardener', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'pool', label: 'Pool Maintenance', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'driver', label: 'Driver/Chauffeur', icon: <Car className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  { id: 'broker', label: 'Real Estate Broker', icon: <Building className="w-4 h-4" /> },
  { id: 'tour_guide', label: 'Tour Guide', icon: <MapPin className="w-4 h-4" /> },
];

// What clients are looking for (intentions)
const CLIENT_INTENTIONS = [
  { id: 'rent_property', label: 'Looking to Rent Property', icon: <Home className="w-4 h-4" />, description: 'Apartments, houses, rooms' },
  { id: 'buy_property', label: 'Looking to Buy Property', icon: <Building className="w-4 h-4" />, description: 'Purchase real estate' },
  { id: 'rent_motorcycle', label: 'Need Motorcycle Rental', icon: <Car className="w-4 h-4" />, description: 'Short or long-term' },
  { id: 'buy_motorcycle', label: 'Looking to Buy Motorcycle', icon: <Car className="w-4 h-4" />, description: 'Purchase vehicle' },
  { id: 'rent_bicycle', label: 'Need Bicycle Rental', icon: <Bike className="w-4 h-4" />, description: 'Daily or weekly rental' },
  { id: 'buy_bicycle', label: 'Looking to Buy Bicycle', icon: <Bike className="w-4 h-4" />, description: 'Purchase bicycle' },
];

// Budget ranges
const BUDGET_RANGES = [
  { id: 'under_500', label: 'Under $500/month' },
  { id: '500_1000', label: '$500 - $1,000/month' },
  { id: '1000_2000', label: '$1,000 - $2,000/month' },
  { id: '2000_3000', label: '$2,000 - $3,000/month' },
  { id: '3000_5000', label: '$3,000 - $5,000/month' },
  { id: 'over_5000', label: 'Over $5,000/month' },
  { id: 'flexible', label: 'Flexible Budget' },
];

// Move-in timeline
const MOVE_IN_TIMELINE = [
  { id: 'immediately', label: 'Immediately' },
  { id: 'within_month', label: 'Within 1 Month' },
  { id: '1_3_months', label: '1-3 Months' },
  { id: '3_6_months', label: '3-6 Months' },
  { id: 'flexible', label: 'Flexible' },
];

const ClientProfileSetup = () => {
  const navigate = useNavigate();
  const { data: existingProfile } = useClientProfile();
  const saveProfile = useSaveClientProfile();

  // Photo state
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    intentions: [] as string[],
    services_needed: [] as string[],
    budget_range: '',
    move_in_timeline: '',
    location_city: '',
    location_country: 'Mexico',
    occupation: '',
  });

  // Load existing profile data
  useEffect(() => {
    if (existingProfile) {
      setPhotos(existingProfile.profile_images || []);
      setFormData({
        name: existingProfile.name || '',
        age: existingProfile.age?.toString() || '',
        bio: existingProfile.bio || '',
        intentions: existingProfile.intentions || [],
        services_needed: existingProfile.services_needed || [],
        budget_range: existingProfile.budget_range || '',
        move_in_timeline: existingProfile.move_in_timeline || '',
        location_city: existingProfile.location_city || '',
        location_country: existingProfile.location_country || 'Mexico',
        occupation: existingProfile.occupation || '',
      });
    }
  }, [existingProfile]);

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    const total = 7;
    if (photos.length > 0) completed++;
    if (formData.name) completed++;
    if (formData.age) completed++;
    if (formData.bio) completed++;
    if (formData.intentions.length > 0) completed++;
    if (formData.budget_range) completed++;
    if (formData.location_city) completed++;
    return Math.round((completed / total) * 100);
  };

  const completionPercent = calculateCompletion();

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (photos.length + files.length > MAX_PHOTOS) {
      toast({
        title: 'Too many photos',
        description: `You can only upload up to ${MAX_PHOTOS} photos`,
        variant: 'destructive',
      });
      return;
    }

    // Validate files
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast({
          title: 'Invalid file',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }
    }

    // Create preview URLs
    const newPhotoPreviews = files.map(file => URL.createObjectURL(file));
    setPhotos([...photos, ...newPhotoPreviews]);
    setPhotoFiles([...photoFiles, ...files]);
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  // Toggle selection
  const toggleSelection = (field: 'intentions' | 'services_needed', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  // Save profile
  const handleSave = async () => {
    if (!formData.name) {
      toast({
        title: 'Name required',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    if (photos.length === 0) {
      toast({
        title: 'Photo required',
        description: 'Please upload at least one photo',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Upload new photos
      let uploadedUrls: string[] = [];
      if (photoFiles.length > 0) {
        uploadedUrls = await uploadPhotoBatch(user.user.id, photoFiles, 'profile-images');
      }

      // Combine existing and new photo URLs
      const existingUrls = photos.filter(p => p.startsWith('http'));
      const allPhotoUrls = [...existingUrls, ...uploadedUrls];

      // Save profile
      await saveProfile.mutateAsync({
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        bio: formData.bio,
        profile_images: allPhotoUrls,
        intentions: formData.intentions,
        services_needed: formData.services_needed,
        budget_range: formData.budget_range,
        move_in_timeline: formData.move_in_timeline,
        location_city: formData.location_city,
        location_country: formData.location_country,
        occupation: formData.occupation,
      });

      toast({
        title: 'Profile saved!',
        description: 'Your profile has been updated successfully',
      });

      navigate('/client/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error saving profile',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            {completionPercent}% Complete
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Completion</span>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <Progress value={completionPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Complete your profile to get better matches!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Your Photos
            </CardTitle>
            <CardDescription>
              Upload up to {MAX_PHOTOS} photos. Drag to reorder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Photo Grid */}
              {photos.length > 0 && (
                <Reorder.Group
                  axis="y"
                  values={photos}
                  onReorder={setPhotos}
                  className="space-y-3"
                >
                  {photos.map((photo, index) => (
                    <Reorder.Item
                      key={photo}
                      value={photo}
                      className="bg-card rounded-lg border overflow-hidden"
                    >
                      <div className="flex items-center gap-3 p-3">
                        <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Photo {index + 1}
                            {index === 0 && (
                              <Badge variant="secondary" className="ml-2">Main</Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Drag to reorder
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}

              {/* Upload Button */}
              {photos.length < MAX_PHOTOS && (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Upload Photos</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {MAX_PHOTOS - photos.length} remaining
                    </p>
                  </div>
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="25"
                />
              </div>
            </div>

            <div>
              <Label>Occupation</Label>
              <Input
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>

            <div>
              <Label>About Me</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself, your lifestyle, what you're looking for..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* What I'm Looking For */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              What I'm Looking For
            </CardTitle>
            <CardDescription>
              Select all that apply
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CLIENT_INTENTIONS.map((intention) => (
                <motion.div
                  key={intention.id}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      formData.intentions.includes(intention.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => toggleSelection('intentions', intention.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{intention.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{intention.label}</p>
                            {formData.intentions.includes(intention.id) && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {intention.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Services I Need */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Services I Need
            </CardTitle>
            <CardDescription>
              Select any professional services you're looking for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SERVICE_CATEGORIES.map((service) => (
                <Badge
                  key={service.id}
                  variant={formData.services_needed.includes(service.id) ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-2 text-sm"
                  onClick={() => toggleSelection('services_needed', service.id)}
                >
                  <span className="mr-1">{service.icon}</span>
                  {service.label}
                  {formData.services_needed.includes(service.id) && (
                    <Check className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Budget & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Budget Range</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {BUDGET_RANGES.map((range) => (
                  <Badge
                    key={range.id}
                    variant={formData.budget_range === range.id ? 'default' : 'outline'}
                    className="cursor-pointer justify-center py-2"
                    onClick={() => setFormData({ ...formData, budget_range: range.id })}
                  >
                    {range.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Move-in Timeline</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {MOVE_IN_TIMELINE.map((timeline) => (
                  <Badge
                    key={timeline.id}
                    variant={formData.move_in_timeline === timeline.id ? 'default' : 'outline'}
                    className="cursor-pointer justify-center py-2"
                    onClick={() => setFormData({ ...formData, move_in_timeline: timeline.id })}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {timeline.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <Input
                  value={formData.location_country}
                  onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                  placeholder="Mexico"
                />
              </div>
              <div>
                <Label>Preferred City</Label>
                <Input
                  value={formData.location_city}
                  onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                  placeholder="Playa del Carmen"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="sticky bottom-20 z-10">
          <Button
            onClick={handleSave}
            disabled={isUploading || !formData.name || photos.length === 0}
            className="w-full h-12 text-base shadow-lg"
            size="lg"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileSetup;
