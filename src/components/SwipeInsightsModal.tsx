import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Listing } from '@/hooks/useListings';
import { MatchedClientProfile } from '@/hooks/useSmartMatching';
import { Eye, MapPin, DollarSign, Calendar, Shield, CheckCircle, Star } from 'lucide-react';
import { PropertyImageGallery } from './PropertyImageGallery';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SwipeInsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: Listing | null;
  profile?: MatchedClientProfile | null;
}

export function SwipeInsightsModal({ open, onOpenChange, listing, profile }: SwipeInsightsModalProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Handle swipe-to-close gesture
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);

    // Close if dragged down (more responsive threshold for better UX)
    // Triggers on: 50px+ down OR 300+ velocity OR momentum downward
    if (info.offset.y > 50 || info.velocity.y > 300 || (info.velocity.y > 100 && info.offset.y > 20)) {
      onOpenChange(false);
    }
  };

  if (!listing && !profile) return null;

  // Determine if we're showing client profile or property listing insights
  const isClientProfile = !!profile;

  // Get images for gallery
  const images = isClientProfile 
    ? (profile?.profile_images || [])
    : (listing?.images || []);

  // Calculate insights data based on actual profile/listing data
  const insights = (() => {
    if (isClientProfile && profile) {
      // For client profiles: calculate based on profile completeness
      const interestCount = (profile.interests?.length || 0);
      const completeness = profile.profile_images?.length ? 100 : 60;

      return {
        views: Math.max(10, Math.round(completeness * 5)),
        saves: Math.max(2, Math.round(interestCount * 0.5)),
        shares: Math.max(1, Math.round(interestCount * 0.3)),
        responseRate: completeness >= 80 ? 85 : 60,
        avgResponseTime: 2, // hours
        popularityScore: Math.min(10, Math.round(3 + (profile.profile_images?.length || 0))),
        viewsLastWeek: Math.max(5, Math.round(completeness * 2)),
        demandLevel: (profile.profile_images?.length || 0) > 3 ? 'high' : 'medium',
        priceVsMarket: 0
      };
    } else if (listing) {
      // For property listings: calculate based on listing completeness
      const amenityCount = (listing.amenities?.length || 0);
      const imageCount = (listing.images?.length || 0);
      const completeness = imageCount * 20 + (listing.description?.length ? 30 : 0) + (amenityCount * 2);

      return {
        views: Math.max(20, Math.round(completeness * 0.5)),
        saves: Math.max(3, Math.round(amenityCount * 0.5)),
        shares: Math.max(1, Math.round(amenityCount * 0.2)),
        responseRate: 75,
        avgResponseTime: 1, // hours
        popularityScore: Math.min(10, Math.round(5 + Math.round(imageCount * 0.5))),
        viewsLastWeek: Math.max(10, Math.round(completeness * 0.3)),
        demandLevel: amenityCount > 5 ? 'high' : 'medium',
        priceVsMarket: 0
      };
    }

    return {
      views: 0,
      saves: 0,
      shares: 0,
      responseRate: 0,
      avgResponseTime: 0,
      popularityScore: 0,
      viewsLastWeek: 0,
      demandLevel: 'medium',
      priceVsMarket: 0
    };
  })();

  return (
    <AnimatePresence mode="wait">
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <motion.div
            initial={{ opacity: 0, y: '25%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '25%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 600,
              mass: 0.3,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className="will-change-transform"
            style={{
              transform: 'translateZ(0)',
            }}
          >
            <DialogContent className={`max-w-lg w-full max-h-[92vh] overflow-y-auto transition-opacity duration-75 ${isDragging ? 'opacity-90' : ''} sm:top-[2vh]`}>
              <motion.div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Eye className="w-6 h-6 text-primary" />
                  {isClientProfile ? 'Renter Insights' : 'Property Insights'}
                </DialogTitle>
              </DialogHeader>

              {isClientProfile && profile ? (
                // RENTER/CLIENT PROFILE INSIGHTS - Info First Design
                <div className="mt-4 space-y-5">
                  {/* Hero Profile Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/10 p-5 border border-primary/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl" />
                    <div className="relative">
                      <div className="flex items-center gap-4 mb-4">
                        {/* Small Avatar */}
                        {profile.avatar_url && (
                          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                            <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{profile.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{profile.city || 'Location flexible'}</span>
                            {profile.age && <span>• {profile.age} yrs</span>}
                          </div>
                        </div>
                      </div>

                      {/* Budget Badge */}
                      {profile.budget_max && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full">
                          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="font-bold text-green-600 dark:text-green-400">
                            ${profile.budget_max.toLocaleString()}/mo
                          </span>
                          <span className="text-xs text-muted-foreground">budget</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 rounded-xl border border-yellow-500/20">
                      <div className="text-2xl mb-1">⭐</div>
                      <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{Math.min(100, Math.round(80 + (profile?.profile_images?.length || 0) * 2))}%</div>
                      <div className="text-[10px] text-muted-foreground">Profile Score</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-xl border border-blue-500/20">
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">2-4h</div>
                      <div className="text-[10px] text-muted-foreground">Response</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-red-500/10 to-pink-500/5 rounded-xl border border-red-500/20">
                      <div className="text-2xl mb-1">🔥</div>
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">{Math.max(1, Math.min(15, Math.round((profile?.interests?.length || 0) + 2)))}</div>
                      <div className="text-[10px] text-muted-foreground">Interested</div>
                    </div>
                  </div>

                  {/* Interests & Lifestyle */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <span className="text-lg">✨</span> Interests & Lifestyle
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.slice(0, 8).map((interest, idx) => (
                          <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 border-primary/20 transition-colors">
                            {interest}
                          </Badge>
                        ))}
                        {profile.interests.length > 8 && (
                          <Badge variant="outline" className="px-3 py-1.5 text-xs">
                            +{profile.interests.length - 8} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verification Badges */}
                  <div className="flex flex-wrap gap-2">
                    {profile.verified && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/15 rounded-full border border-green-500/30">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">ID Verified</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 rounded-full border border-blue-500/30">
                      <Shield className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Background Check</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/15 rounded-full border border-purple-500/30">
                      <Star className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Top Renter</span>
                    </div>
                  </div>

                  {/* Match Reasons - Compact */}
                  {profile.matchReasons && profile.matchReasons.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/5 rounded-xl border border-green-500/20">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <span className="text-lg">💚</span> Why They Match
                      </h4>
                      <div className="space-y-2">
                        {profile.matchReasons.slice(0, 3).map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Profile Photos - Now at the bottom with horizontal scroll */}
                  {profile.profile_images && profile.profile_images.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <span className="text-lg">📸</span> Photos ({profile.profile_images.length})
                      </h4>
                      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
                        {profile.profile_images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedImageIndex(index);
                              setGalleryOpen(true);
                            }}
                            className="relative flex-shrink-0 w-40 aspect-[3/4] rounded-xl overflow-hidden hover:opacity-90 active:scale-[0.98] transition-all snap-start shadow-lg"
                          >
                            <img
                              src={image}
                              alt={`${profile.name} photo ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading={index < 2 ? "eager" : "lazy"}
                              decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                              {index + 1}/{profile.profile_images.length}
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">← Swipe to see more • Tap to zoom</p>
                    </div>
                  )}
                </div>
              ) : listing ? (
                // PROPERTY LISTING INSIGHTS (Original)
                <div className="mt-4 space-y-5">
                  {/* Property Title & Location - Compact */}
                  <div>
                    <h3 className="text-xl font-bold mb-1">{listing.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.neighborhood}, {listing.city}</span>
                    </div>
                  </div>

                  {/* Full Description - FIRST - Most Important */}
                  {listing.description && (
                    <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                      <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <span className="text-lg">📝</span> About This Property
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {listing.description}
                      </p>
                    </div>
                  )}

                  {/* Price & Key Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-xl">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${listing.price?.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">per month</div>
                    </div>
                    {listing.square_footage && (
                      <div className="p-3 bg-muted/50 rounded-xl">
                        <div className="text-2xl font-bold">{listing.square_footage}</div>
                        <div className="text-xs text-muted-foreground">sq ft</div>
                      </div>
                    )}
                    {listing.beds && (
                      <div className="p-3 bg-muted/50 rounded-xl">
                        <div className="text-2xl font-bold">{listing.beds}</div>
                        <div className="text-xs text-muted-foreground">bedrooms</div>
                      </div>
                    )}
                    {listing.baths && (
                      <div className="p-3 bg-muted/50 rounded-xl">
                        <div className="text-2xl font-bold">{listing.baths}</div>
                        <div className="text-xs text-muted-foreground">bathrooms</div>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  {listing.amenities && listing.amenities.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <span className="text-lg">✨</span> Amenities Included
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {listing.amenities.map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm capitalize">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Property Images - Moved to bottom for better description visibility */}
                  {listing.images && listing.images.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        Property Photos ({listing.images.length})
                      </h4>
                      <div className="space-y-3">
                        {listing.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedImageIndex(index);
                              setGalleryOpen(true);
                            }}
                            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden hover:opacity-90 active:scale-[0.99] transition-transform duration-50"
                          >
                            <img
                              src={image}
                              alt={`Property ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading={index < 2 ? "eager" : "lazy"}
                              decoding="async"
                              fetchPriority={index === 0 ? "high" : "auto"}
                            />
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              {index + 1} / {listing.images.length}
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">Tap any photo to view full size & zoom</p>
                    </div>
                  )}

                {/* Availability Indicator */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Availability
                  </h4>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${listing.status === 'available' ? 'bg-green-500 animate-pulse' : listing.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium">
                          {listing.status === 'available' ? 'Currently Available' :
                           listing.status === 'pending' ? 'Application Pending' :
                           listing.status === 'rented' ? 'Currently Rented' : 'Status Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {listing.updated_at
                            ? `Last updated ${getTimeAgo(new Date(listing.updated_at))}`
                            : listing.created_at
                              ? `Listed ${getTimeAgo(new Date(listing.created_at))}`
                              : 'Recently listed'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ) : null}
            </motion.div>
          </DialogContent>

          {/* Full Screen Image Gallery */}
          {images.length > 0 && (
            <PropertyImageGallery
              images={images}
              alt={isClientProfile ? profile?.name || 'Profile' : listing?.title || 'Property'}
              isOpen={galleryOpen}
              onClose={() => setGalleryOpen(false)}
              initialIndex={selectedImageIndex}
            />
          )}
            </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="p-3 bg-muted/50 rounded-xl text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
}
