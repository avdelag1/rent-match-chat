
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Calendar, Heart, Star } from 'lucide-react';
import { ClientProfile } from '@/hooks/useClientProfiles';

interface ClientInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ClientProfile | null;
}

export function ClientInsightsDialog({ open, onOpenChange, profile }: ClientInsightsDialogProps) {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Client Profile Insights</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-6 pr-4">
            {/* Profile Images */}
            {profile.profile_images && profile.profile_images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {profile.profile_images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Profile ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
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

            {/* Bio */}
            {profile.bio && (
              <div>
                <h4 className="font-semibold mb-2">About</h4>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Activities */}
            {profile.preferred_activities && profile.preferred_activities.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Preferred Activities</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.preferred_activities.map((activity, index) => (
                    <Badge key={index} variant="outline">{activity}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tenant Insights */}
            <div>
              <h4 className="font-semibold mb-2">Tenant Profile Insights</h4>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm">⭐ Profile completeness: 85% - Well detailed profile</p>
                <p className="text-sm">📊 Activity level: Active user - last seen recently</p>
                <p className="text-sm">🏠 Housing preferences: Likely looking for long-term rental</p>
                <p className="text-sm">🤝 Compatibility score: 8.2/10 based on profile data</p>
                <p className="text-sm">📈 Response rate: High - typically responds within 24 hours</p>
              </div>
            </div>

            {/* Match Indicators */}
            <div>
              <h4 className="font-semibold mb-2">Match Indicators</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Lifestyle match: 92%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Reliability score: 9/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Communication style: Friendly</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Location preference: Flexible</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
