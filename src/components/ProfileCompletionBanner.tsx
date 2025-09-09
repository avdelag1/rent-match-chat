import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, User, Camera, MapPin, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClientProfile } from '@/hooks/useClientProfile';

const ProfileCompletionBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const { user } = useAuth();
  const { data: profile } = useClientProfile();

  if (!user || dismissed || !profile) return null;

  const completionItems = [
    { key: 'profile_images', label: 'Profile Photo', icon: Camera, completed: !!profile.profile_images?.length },
    { key: 'bio', label: 'Bio', icon: User, completed: !!profile.bio },
    { key: 'age', label: 'Age', icon: MapPin, completed: !!profile.age },
    { key: 'interests', label: 'Interests', icon: Heart, completed: !!profile.interests?.length }
  ];

  const completedCount = completionItems.filter(item => item.completed).length;
  const progress = (completedCount / completionItems.length) * 100;

  if (progress === 100) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 mb-6">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-primary mb-1">Complete Your Profile</h3>
            <p className="text-sm text-muted-foreground">
              Complete your profile to get better matches ({completedCount}/{completionItems.length})
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <Progress value={progress} className="mb-3" />
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          {completionItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.key}
                className={`flex items-center space-x-2 text-sm p-2 rounded ${
                  item.completed ? 'text-success bg-success/10' : 'text-muted-foreground'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{item.label}</span>
                {item.completed && <span className="ml-auto">✓</span>}
              </div>
            );
          })}
        </div>
        
        <Button size="sm" className="w-full">
          Complete Profile
        </Button>
      </div>
    </Card>
  );
};

export default ProfileCompletionBanner;