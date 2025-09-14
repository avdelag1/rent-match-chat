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

export function OnboardingQuestionnaire({ userRole }: OnboardingQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const totalSteps = userRole === 'client' ? 4 : 3;

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      
      // Mark onboarding as completed without saving data
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Welcome to Tinderent!",
        description: "You can complete your profile anytime from settings.",
      });

      // Navigate to appropriate dashboard
      const targetPath = userRole === 'client' ? '/client/dashboard' : '/owner/dashboard';
      navigate(targetPath);
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
      
      // Save onboarding data using the database function
      const { error } = await supabase.rpc('complete_user_onboarding', {
        user_id: user?.id,
        onboarding_data: formData as any
      });

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Welcome to Tinderent! Your profile has been saved.",
      });

      // Navigate to appropriate dashboard
      const targetPath = userRole === 'client' ? '/client/dashboard' : '/owner/dashboard';
      navigate(targetPath);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
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
      
      case 4: // Only for clients
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
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={isLoading}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="w-4 h-4 mr-1" />
            Skip
          </Button>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            Complete Your Profile
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Step {currentStep} of {totalSteps} - Help us personalize your experience
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1 || isLoading}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {currentStep === totalSteps ? (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white flex items-center gap-2"
              >
                {isLoading ? 'Saving...' : 'Complete Profile'}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={isLoading}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}