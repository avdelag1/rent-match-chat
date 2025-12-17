
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, User, Calendar, Flame, Star, MessageCircle, Eye, Award, ThumbsUp } from 'lucide-react';
import { ClientProfile } from '@/hooks/useClientProfiles';
import { PropertyImageGallery } from './PropertyImageGallery';
import { useNavigate } from 'react-router-dom';
import { useStartConversation } from '@/hooks/useConversations';
import { toast } from '@/hooks/use-toast';
import { useState, memo } from 'react';

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
  const navigate = useNavigate();
  const startConversation = useStartConversation();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!profile) return null;

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setGalleryOpen(true);
  };

  // Calculate recommendation score based on profile completeness and activity
  const recommendationScore = Math.min(5, Math.round(
    (getProfileCompleteness(profile) / 20) + 
    ((profile.interests?.length || 0) / 5)
  ));
  
  const handleMessage = async () => {
    setIsCreatingConversation(true);
    try {
      toast({
        title: 'Starting conversation',
        description: 'Creating a new conversation...',
      });

      const result = await startConversation.mutateAsync({
        otherUserId: profile.user_id,
        initialMessage: `Hi! I'd like to connect with you.`,
        canStartNewConversation: true,
      });

      if (result?.conversationId) {
        navigate(`/messages?conversationId=${result.conversationId}`);
        onOpenChange(false); // Close dialog
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Could not start conversation',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Client Profile Insights</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-6 py-4 px-6">
            {/* Basic Info Header */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-lg border border-primary/20">
              <h3 className="text-2xl font-bold mb-2">{profile.name}</h3>
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
              
              {/* Recommendation Stars */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-medium">Owner Recommendations:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < recommendationScore
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground ml-2">
                  {recommendationScore}/5 stars
                </span>
              </div>
            </div>

            {/* Profile Photos Gallery */}
            {profile.profile_images && profile.profile_images.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Client Photos
                </h4>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {profile.profile_images.slice(0, 6).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity group"
                      onClick={() => handleImageClick(index)}
                    >
                      <img
                        src={image}
                        alt={`Client photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading={index < 3 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={index === 0 ? "high" : "auto"}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-primary text-center">Click any photo to view full size</p>
              </div>
            )}

            {/* Profile Highlights */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Profile Highlights
              </h4>
              <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-4 rounded-lg border border-green-500/20 space-y-3">
                {recommendationScore >= 4 && (
                  <div className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-sm">
                      <span className="font-semibold">Highly Engaged Profile:</span> Complete profile with detailed preferences
                    </p>
                  </div>
                )}
                {(profile.interests?.length || 0) > 5 && (
                  <div className="flex items-start gap-2">
                    <ThumbsUp className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm">
                      <span className="font-semibold">Clear Preferences:</span> Well-defined requirements make matching easier
                    </p>
                  </div>
                )}
                {(profile.profile_images?.length || 0) > 2 && (
                  <div className="flex items-start gap-2">
                    <Eye className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm">
                      <span className="font-semibold">Verified Photos:</span> Multiple profile photos uploaded
                    </p>
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
                        <Badge key={index} className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
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
        
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button
            onClick={handleMessage}
            disabled={isCreatingConversation}
            className="w-full"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {isCreatingConversation ? 'Starting conversation...' : 'Send Message'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Full-screen Image Gallery */}
      {profile.profile_images && profile.profile_images.length > 0 && (
        <PropertyImageGallery
          images={profile.profile_images}
          alt={`${profile.name}'s profile photos`}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          initialIndex={selectedImageIndex}
        />
      )}
    </Dialog>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(ClientInsightsDialog, (prevProps, nextProps) => {
  return (
    prevProps.profile?.user_id === nextProps.profile?.user_id &&
    prevProps.open === nextProps.open
  );
});

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
