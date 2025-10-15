import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface OnboardingQuestionnaireProps {
  userRole: 'client' | 'owner';
}

interface FormData {
  age?: number;
  bio?: string;
  occupation?: string;
  interests?: string[];
  lifestyle_tags?: string[];
  preferred_property_types?: string[];
  budget_min?: number;
  budget_max?: number;
  has_pets?: boolean;
  smoking?: boolean;
  // Owner-specific fields
  business_type?: string;
  property_description?: string;
  property_location?: string;
  contact_phone?: string;
  years_of_experience?: number;
  property_specialties?: string[];
  rental_philosophy?: string;
  property_photos?: string[];
}

const interestOptions = [
  'Travel', 'Music', 'Sports', 'Art', 'Technology', 'Food', 'Books', 'Movies', 
  'Fitness', 'Nature', 'Photography', 'Cooking', 'Gaming', 'Fashion'
];

const lifestyleOptions = [
  'Active', 'Social', 'Quiet', 'Professional', 'Student', 'Remote Worker',
  'Night Owl', 'Early Bird', 'Minimalist', 'Creative'
];

const propertyTypeOptions = [
  'Apartment', 'House', 'Studio', 'Condo', 'Townhouse', 'Villa', 'Room'
];

const businessTypeOptions = [
  'Rent Only', 'Sale Only', 'Both Rent & Sale'
];

const propertySpecialtyOptions = [
  'Luxury Properties', 'Budget-Friendly', 'Student Housing', 'Family Homes', 
  'Pet-Friendly', 'Short-term Rentals', 'Long-term Rentals', 'Commercial'
];

export function OnboardingQuestionnaire({ userRole }: OnboardingQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const totalSteps = userRole === 'client' ? 4 : 6;

  const handleSkipStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSkipAll();
    }
  };

  const handleSkipAll = async () => {
    try {
      setIsLoading(true);
      
      // Mark onboarding as completed without saving data
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Welcome!",
        description: `You can complete your profile anytime from settings.`,
      });

      // Small delay to show the toast before navigating
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to appropriate dashboard
      const targetPath = userRole === 'client' ? '/client/dashboard' : '/owner/dashboard';
      navigate(targetPath, { replace: true });
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to skip onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      
      console.log('[Onboarding] Starting completion...', { userId: user?.id, role: userRole });
      
      // Update profile with onboarding completed flag
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) {
        console.error('[Onboarding] Profile update error:', profileError);
        throw profileError;
      }

      console.log('[Onboarding] ✅ Profile marked as completed');

      // Save client/owner specific data if provided
      if (userRole === 'client' && Object.keys(formData).length > 0) {
        const clientData = {
          user_id: user?.id,
          age: formData.age,
          bio: formData.bio,
          interests: formData.interests || [],
          preferred_activities: formData.lifestyle_tags || []
        };

        const { error: clientError } = await supabase
          .from('client_profiles')
          .upsert(clientData, { onConflict: 'user_id' });

        if (clientError) {
          console.error('[Onboarding] Client profile error:', clientError);
          // Don't throw - profile completion is more important
        } else {
          console.log('[Onboarding] ✅ Client data saved');
        }

        // Save filter preferences if provided
        if (formData.preferred_property_types || formData.budget_min || formData.budget_max) {
          const filterData = {
            user_id: user?.id,
            property_types: formData.preferred_property_types || [],
            min_price: formData.budget_min,
            max_price: formData.budget_max,
            pet_friendly_required: formData.has_pets || false
          };

          const { error: filterError } = await supabase
            .from('client_filter_preferences')
            .upsert(filterData, { onConflict: 'user_id' });

          if (filterError) {
            console.error('[Onboarding] Filter preferences error:', filterError);
          } else {
            console.log('[Onboarding] ✅ Filter preferences saved');
          }
        }
      }

      toast({
        title: "Profile completed!",
        description: `Welcome to Tinderent! You're all set.`,
      });

      // Navigate to dashboard
      const targetPath = userRole === 'client' ? '/client/dashboard' : '/owner/dashboard';
      console.log('[Onboarding] ✅ Navigating to:', targetPath);
      
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 500);

    } catch (error) {
      console.error('[Onboarding] ❌ Error:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleArrayToggle = (field: keyof FormData, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        if (userRole === 'owner') {
          return (
            <div className="space-y-6">
              <div>
                <Label htmlFor="business_type" className="text-lg font-medium">What type of business do you operate?</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {businessTypeOptions.map((type) => (
                    <Badge
                      key={type}
                      variant={formData.business_type === type ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2 text-sm"
                      onClick={() => setFormData(prev => ({ ...prev, business_type: type }))}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="contact_phone" className="text-lg font-medium">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  className="mt-2 h-12 text-lg"
                  placeholder="Your business phone number"
                />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="age" className="text-lg font-medium">What's your age?</Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="100"
                value={formData.age || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                className="mt-2 h-12 text-lg"
                placeholder="Enter your age"
              />
            </div>
            
            <div>
              <Label htmlFor="occupation" className="text-lg font-medium">What's your occupation?</Label>
              <Input
                id="occupation"
                value={formData.occupation || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                className="mt-2 h-12 text-lg"
                placeholder="e.g., Software Developer, Student, etc."
              />
            </div>
          </div>
        );
      
      case 2:
        if (userRole === 'owner') {
          return (
            <div className="space-y-6">
              <div>
                <Label htmlFor="property_location" className="text-lg font-medium">Where are your properties located?</Label>
                <Input
                  id="property_location"
                  value={formData.property_location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, property_location: e.target.value }))}
                  className="mt-2 h-12 text-lg"
                  placeholder="e.g., Tulum, Mexico City, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="years_of_experience" className="text-lg font-medium">Years of experience in real estate</Label>
                <Input
                  id="years_of_experience"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.years_of_experience || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: parseInt(e.target.value) || undefined }))}
                  className="mt-2 h-12 text-lg"
                  placeholder="Number of years"
                />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium">Tell us about yourself</Label>
              <Textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="mt-2 min-h-[120px] text-base"
                placeholder="Write a brief description about yourself..."
              />
            </div>
            
            <div>
              <Label className="text-lg font-medium">Your interests</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <Badge
                    key={interest}
                    variant={formData.interests?.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 text-sm"
                    onClick={() => handleArrayToggle('interests', interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 3:
        if (userRole === 'owner') {
          return (
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-medium">Property specialties</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {propertySpecialtyOptions.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant={formData.property_specialties?.includes(specialty) ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2 text-sm"
                      onClick={() => handleArrayToggle('property_specialties', specialty)}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-lg font-medium">Describe your properties</Label>
                <Textarea
                  value={formData.property_description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, property_description: e.target.value }))}
                  className="mt-2 min-h-[120px] text-base"
                  placeholder="Tell clients about your properties, amenities, and what makes them special..."
                />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium">Your lifestyle</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {lifestyleOptions.map((lifestyle) => (
                  <Badge
                    key={lifestyle}
                    variant={formData.lifestyle_tags?.includes(lifestyle) ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 text-sm"
                    onClick={() => handleArrayToggle('lifestyle_tags', lifestyle)}
                  >
                    {lifestyle}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-base font-medium">Do you have pets?</Label>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant={formData.has_pets === true ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, has_pets: true }))}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={formData.has_pets === false ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, has_pets: false }))}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium">Do you smoke?</Label>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant={formData.smoking === true ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, smoking: true }))}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={formData.smoking === false ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, smoking: false }))}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        if (userRole === 'owner') {
          return (
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-medium">Your rental philosophy</Label>
                <Textarea
                  value={formData.rental_philosophy || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rental_philosophy: e.target.value }))}
                  className="mt-2 min-h-[120px] text-base"
                  placeholder="What's your approach to renting? What do you look for in tenants?"
                />
              </div>
              
              <div>
                <Label className="text-lg font-medium">Tell us about yourself</Label>
                <Textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="mt-2 min-h-[100px] text-base"
                  placeholder="Brief description about yourself as a property owner..."
                />
              </div>
            </div>
          );
        } 
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium">Preferred property types</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {propertyTypeOptions.map((type) => (
                  <Badge
                    key={type}
                    variant={formData.preferred_property_types?.includes(type) ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 text-sm"
                    onClick={() => handleArrayToggle('preferred_property_types', type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-lg font-medium">Budget range (USD/month)</Label>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_min" className="text-sm">Minimum</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    min="0"
                    value={formData.budget_min || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_min: parseInt(e.target.value) || undefined }))}
                    className="mt-1"
                    placeholder="Min budget"
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max" className="text-sm">Maximum</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    min="0"
                    value={formData.budget_max || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_max: parseInt(e.target.value) || undefined }))}
                    className="mt-1"
                    placeholder="Max budget"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 5:
        if (userRole === 'owner') {
          return (
            <div className="space-y-6">
              <div>
                <Label className="text-lg font-medium">Property Photos (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-3">Upload some photos of your properties to attract clients</p>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <div className="text-muted-foreground">
                    <p className="text-sm">Photo upload will be available in your dashboard</p>
                    <p className="text-xs mt-1">You can add property photos after completing onboarding</p>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;
      
      case 6:
        if (userRole === 'owner') {
          return (
            <div className="space-y-6">
              <div>
                <Label htmlFor="age" className="text-lg font-medium">What's your age?</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                  className="mt-2 h-12 text-lg"
                  placeholder="Enter your age"
                />
              </div>
              
              <div>
                <Label className="text-lg font-medium">Your interests</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <Badge
                      key={interest}
                      variant={formData.interests?.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2 text-sm"
                      onClick={() => handleArrayToggle('interests', interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return null;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
              {userRole === 'owner' ? '🏠' : '👤'}
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Complete Your {userRole === 'owner' ? 'Business' : 'Client'} Profile
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Step {currentStep} of {totalSteps} • {Math.round((currentStep / totalSteps) * 100)}% Complete
            </p>
            <div className="w-full bg-gradient-to-r from-gray-200 to-gray-100 rounded-full h-3 mt-4 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 h-3 rounded-full shadow-sm" 
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
            
            <div className="flex justify-between gap-4 pt-6 border-t border-gray-100">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="gap-2 border-gray-300 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
              
              <div className="flex gap-3 ml-auto">
                <Button
                  variant="ghost"
                  onClick={handleSkipStep}
                  disabled={isLoading}
                  className="gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <SkipForward className="w-4 h-4" />
                  {currentStep < totalSteps ? 'Skip Step' : 'Skip All'}
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={isLoading}
                    className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-orange-500/25"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/25"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Completing...
                      </>
                    ) : (
                      <>
                        Complete Profile
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}