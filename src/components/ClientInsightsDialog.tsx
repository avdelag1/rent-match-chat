
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Calendar, Flame, Star } from 'lucide-react';
import { ClientProfile } from '@/hooks/useClientProfiles';
import { ImageCarousel } from './ImageCarousel';

// Tag categories for organized display
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

// Helper to filter tags by category
function filterTagsByCategory(allTags: string[], categoryTags: string[]): string[] {
  return allTags.filter(tag => categoryTags.includes(tag));
}

interface ClientInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ClientProfile | null;
}

export function ClientInsightsDialog({ open, onOpenChange, profile }: ClientInsightsDialogProps) {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Client Profile Insights</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Profile Images Carousel */}
            {profile.profile_images && profile.profile_images.length > 0 && (
              <ImageCarousel images={profile.profile_images} alt="Client Profile" />
            )}

            {/* Basic Info */}
            <div>
              <h3 className="text-xl font-bold mb-2">{profile.name}</h3>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                {profile.age && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{profile.age} years old</span>
                  </div>
                )}
                {profile.gender && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{profile.gender}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>Location verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Tags by Category */}
            {((profile.interests && profile.interests.length > 0) || 
              (profile.preferred_activities && profile.preferred_activities.length > 0)) && (
              <div className="space-y-4">
                <h4 className="font-semibold">Profile Tags</h4>
                
                {/* Property Interest Tags */}
                {filterTagsByCategory([...(profile.interests || []), ...(profile.preferred_activities || [])], PROPERTY_TAGS).length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Property & Housing</h5>
                    <div className="flex flex-wrap gap-2">
                      {filterTagsByCategory([...(profile.interests || []), ...(profile.preferred_activities || [])], PROPERTY_TAGS).map((tag, index) => (
                        <Badge key={index} className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transportation Tags */}
                {filterTagsByCategory([...(profile.interests || []), ...(profile.preferred_activities || [])], TRANSPORTATION_TAGS).length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Transportation & Mobility</h5>
                    <div className="flex flex-wrap gap-2">
                      {filterTagsByCategory([...(profile.interests || []), ...(profile.preferred_activities || [])], TRANSPORTATION_TAGS).map((tag, index) => (
                        <Badge key={index} className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lifestyle Tags */}
                {filterTagsByCategory([...(profile.interests || []), ...(profile.preferred_activities || [])], LIFESTYLE_TAGS).length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Lifestyle & Preferences</h5>
                    <div className="flex flex-wrap gap-2">
                      {filterTagsByCategory([...(profile.interests || []), ...(profile.preferred_activities || [])], LIFESTYLE_TAGS).map((tag, index) => (
                        <Badge key={index} className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financial & Verification Tags */}
                {filterTagsByCategory([...(profile.interests || []), ...(profile.preferred_activities || [])], FINANCIAL_TAGS).length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Financial & Verification</h5>
                    <div className="flex flex-wrap gap-2">
                      {filterTagsByCategory([...(profile.interests || []), ...(profile.preferred_activities || [])], FINANCIAL_TAGS).map((tag, index) => (
                        <Badge key={index} className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Insights */}
            <div>
              <h4 className="font-semibold mb-2">Profile Analysis</h4>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm">📋 Profile completeness: {getProfileCompleteness(profile)}%</p>
                <p className="text-sm">🏠 Profile tags: {(profile.interests?.length || 0) + (profile.preferred_activities?.length || 0)} selected</p>
                {profile.age && <p className="text-sm">👤 Age group: {getAgeGroup(profile.age)}</p>}
                <p className="text-sm">✍️ Profile type: {getProfileType(profile)}</p>
              </div>
            </div>

            {/* Profile Highlights */}
            <div>
              <h4 className="font-semibold mb-2">Profile Highlights</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Interests: {profile.interests?.length || 0} listed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Activities: {profile.preferred_activities?.length || 0} preferred</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Profile: {getProfileType(profile)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Location: {profile.location ? 'Specified' : 'Not set'}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions for profile analysis
function getProfileCompleteness(profile: ClientProfile): number {
  let completeness = 0;
  const fields = ['name', 'age', 'interests', 'preferred_activities', 'profile_images'];
  
  fields.forEach(field => {
    const value = profile[field as keyof ClientProfile];
    if (value) {
      if (Array.isArray(value) && value.length > 0) completeness += 1;
      else if (!Array.isArray(value)) completeness += 1;
    }
  });
  
  return Math.round((completeness / fields.length) * 100);
}

function getAgeGroup(age: number): string {
  if (age < 25) return 'Young professional';
  if (age < 35) return 'Professional';
  if (age < 50) return 'Experienced professional';
  return 'Mature professional';
}

function getProfileType(profile: ClientProfile): string {
  const allTags = [...(profile.interests || []), ...(profile.preferred_activities || [])];
  const hasProperty = allTags.some(tag => PROPERTY_TAGS.includes(tag));
  const hasTransport = allTags.some(tag => TRANSPORTATION_TAGS.includes(tag));
  const hasFinancial = allTags.some(tag => FINANCIAL_TAGS.includes(tag));
  
  if (hasProperty && hasTransport) return 'Property & Transport Seeker';
  if (hasProperty && hasFinancial) return 'Verified Property Seeker';
  if (hasProperty) return 'Property Seeker';
  if (hasTransport) return 'Transport Seeker';
  return 'General Profile';
}
