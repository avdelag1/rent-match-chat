import { useMemo } from 'react';
import { CheckCircle, Circle, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface ProfileData {
  full_name?: string;
  age?: number;
  bio?: string;
  occupation?: string;
  images?: string[];
  interests?: string[];
  verified?: boolean;
  phone_verified?: boolean;
  email_verified?: boolean;
}

interface ProfileCompletenessProps {
  profile: ProfileData;
  onEditProfile: () => void;
}

export function ProfileCompleteness({ profile, onEditProfile }: ProfileCompletenessProps) {
  const completeness = useMemo(() => {
    const checks = [
      { label: 'Profile photo', completed: profile.images && profile.images.length > 0 },
      { label: 'Full name', completed: Boolean(profile.full_name) },
      { label: 'Age', completed: Boolean(profile.age) },
      { label: 'Bio', completed: Boolean(profile.bio && profile.bio.length > 20) },
      { label: 'Occupation', completed: Boolean(profile.occupation) },
      { label: 'Interests', completed: profile.interests && profile.interests.length >= 3 },
      { label: 'Email verified', completed: Boolean(profile.email_verified) },
      { label: 'Phone verified', completed: Boolean(profile.phone_verified) },
    ];

    const completed = checks.filter(check => check.completed).length;
    const total = checks.length;
    const percentage = Math.round((completed / total) * 100);

    return { checks, completed, total, percentage };
  }, [profile]);

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletenessMessage = (percentage: number) => {
    if (percentage >= 90) return 'Your profile is excellent! 🌟';
    if (percentage >= 70) return 'Good profile! Add a few more details.';
    if (percentage >= 50) return 'You\'re getting there! Keep improving.';
    return 'Your profile needs more information.';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Profile Completeness</h3>
          <p className={`text-sm ${getCompletenessColor(completeness.percentage)}`}>
            {getCompletenessMessage(completeness.percentage)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span className={getCompletenessColor(completeness.percentage)}>
            {completeness.completed}/{completeness.total} complete
          </span>
        </div>
        <Progress 
          value={completeness.percentage} 
          className="h-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {completeness.percentage}% complete
        </p>
      </div>

      <div className="space-y-2 mb-4">
        {completeness.checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {check.completed ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={check.completed ? 'text-muted-foreground' : 'text-foreground'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      <Button 
        onClick={onEditProfile}
        className="w-full"
        variant={completeness.percentage < 70 ? "default" : "outline"}
      >
        {completeness.percentage < 70 ? 'Complete Profile' : 'Edit Profile'}
      </Button>
    </Card>
  );
}