import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Listing } from '@/hooks/useListings';
import { MatchedClientProfile } from '@/hooks/useSmartMatching';
import { Eye, MapPin, DollarSign, Calendar, Shield, CheckCircle, Star, Bed, Bath, Square, Anchor, Bike, Car, Home, Zap, Clock, MessageCircle, TrendingUp, Heart, Sparkles, Users, Gauge, Ruler, ThumbsUp, Flame } from 'lucide-react';
import { PropertyImageGallery } from './PropertyImageGallery';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';

// Category icons for listings
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  property: <Home className="w-4 h-4" />,
  yacht: <Anchor className="w-4 h-4" />,
  motorcycle: <Car className="w-4 h-4" />,
  bicycle: <Bike className="w-4 h-4" />,
};

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
  const insights = useMemo(() => {
    if (isClientProfile && profile) {
      // For client profiles: calculate based on profile completeness
      const interestCount = (profile.interests?.length || 0);
      const photoCount = profile.profile_images?.length || 0;
      const completeness = photoCount ? 100 : 60;

      // Calculate readiness score
      let readinessScore = 0;
      if (profile.name) readinessScore += 15;
      if (profile.age) readinessScore += 10;
      if (photoCount > 0) readinessScore += 20;
      if (photoCount >= 3) readinessScore += 10;
      if (interestCount >= 3) readinessScore += 15;
      if (interestCount >= 6) readinessScore += 10;
      if (profile.verified) readinessScore += 20;

      return {
        views: Math.max(10, Math.round(completeness * 5)),
        saves: Math.max(2, Math.round(interestCount * 0.5)),
        shares: Math.max(1, Math.round(interestCount * 0.3)),
        responseRate: completeness >= 80 ? 85 : 60,
        avgResponseTime: 2, // hours
        popularityScore: Math.min(10, Math.round(3 + photoCount)),
        viewsLastWeek: Math.max(5, Math.round(completeness * 2)),
        demandLevel: photoCount > 3 ? 'high' : 'medium',
        priceVsMarket: 0,
        readinessScore: Math.min(100, readinessScore),
        photoCount,
        interestCount,
      };
    } else if (listing) {
      // For property listings: calculate based on listing completeness
      const amenityCount = (listing.amenities?.length || 0);
      const imageCount = (listing.images?.length || 0);
      const equipmentCount = (listing.equipment?.length || 0);
      const completeness = imageCount * 20 + (listing.description?.length ? 30 : 0) + (amenityCount * 2) + (equipmentCount * 2);
      const category = listing.category || 'property';
      const isVehicle = ['yacht', 'motorcycle', 'bicycle'].includes(category);

      // Calculate quality score
      let qualityScore = 0;
      if (listing.description && listing.description.length > 100) qualityScore += 20;
      if (imageCount >= 5) qualityScore += 25;
      else if (imageCount >= 3) qualityScore += 15;
      if (amenityCount >= 5) qualityScore += 20;
      if (listing.furnished) qualityScore += 10;
      if (listing.pet_friendly) qualityScore += 10;
      if (listing.year) qualityScore += 5;
      if (listing.condition === 'excellent') qualityScore += 10;

      return {
        views: Math.max(20, Math.round(completeness * 0.5)),
        saves: Math.max(3, Math.round(amenityCount * 0.5)),
        shares: Math.max(1, Math.round(amenityCount * 0.2)),
        responseRate: 75,
        avgResponseTime: 1, // hours
        popularityScore: Math.min(10, Math.round(5 + Math.round(imageCount * 0.5))),
        viewsLastWeek: Math.max(10, Math.round(completeness * 0.3)),
        demandLevel: (amenityCount + equipmentCount) > 5 ? 'high' : 'medium',
        priceVsMarket: 0,
        qualityScore: Math.min(100, qualityScore),
        category,
        isVehicle,
        amenityCount,
        equipmentCount,
        imageCount,
        isHotListing: qualityScore >= 70 && listing.status === 'available',
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
      priceVsMarket: 0,
      qualityScore: 0,
      readinessScore: 0,
    };
  }, [isClientProfile, profile, listing]);

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
                // RENTER/CLIENT PROFILE INSIGHTS - Enhanced Info First Design
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
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold">{profile.name}</h3>
                            {profile.verified && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
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

                  {/* Readiness Score Bar */}
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Renter Readiness
                      </span>
                      <Badge className={`${
                        insights.readinessScore >= 80 ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                        insights.readinessScore >= 60 ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                        insights.readinessScore >= 40 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                        'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                      }`}>
                        {insights.readinessScore}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          insights.readinessScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          insights.readinessScore >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                          insights.readinessScore >= 40 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                          'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{ width: `${insights.readinessScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {insights.readinessScore >= 80
                        ? 'Highly prepared - Ready to move!'
                        : insights.readinessScore >= 60
                        ? 'Well-prepared with detailed preferences'
                        : insights.readinessScore >= 40
                        ? 'Moderately prepared'
                        : 'New to the platform'}
                    </p>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-3 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 rounded-xl border border-yellow-500/20">
                      <Star className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                      <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{insights.readinessScore}%</div>
                      <div className="text-[10px] text-muted-foreground">Score</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-xl border border-blue-500/20">
                      <Clock className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">2-4h</div>
                      <div className="text-[10px] text-muted-foreground">Response</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-xl border border-green-500/20">
                      <Eye className="w-5 h-5 mx-auto text-green-600 mb-1" />
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">{insights.photoCount}</div>
                      <div className="text-[10px] text-muted-foreground">Photos</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-red-500/10 to-pink-500/5 rounded-xl border border-red-500/20">
                      <Flame className="w-5 h-5 mx-auto text-red-600 mb-1" />
                      <div className="text-sm font-bold text-red-600 dark:text-red-400">{insights.interestCount}</div>
                      <div className="text-[10px] text-muted-foreground">Interests</div>
                    </div>
                  </div>

                  {/* What They're Looking For */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Home className="w-4 h-4 text-primary" />
                      Looking For
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {profile.interests?.some(i => i.toLowerCase().includes('long-term') || i.toLowerCase().includes('rent')) && (
                        <div className="flex items-center gap-2 p-2.5 bg-green-500/10 rounded-lg border border-green-500/20">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Long-term Rental</span>
                        </div>
                      )}
                      {profile.interests?.some(i => i.toLowerCase().includes('short-term')) && (
                        <div className="flex items-center gap-2 p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Short-term Stay</span>
                        </div>
                      )}
                      {profile.interests?.some(i => i.toLowerCase().includes('pet')) && (
                        <div className="flex items-center gap-2 p-2.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <span className="text-base">🐾</span>
                          <span className="text-sm">Has Pet(s)</span>
                        </div>
                      )}
                      {profile.interests?.some(i => i.toLowerCase().includes('furnished') || i.toLowerCase().includes('corporate')) && (
                        <div className="flex items-center gap-2 p-2.5 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                          <Sparkles className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm">Prefers Furnished</span>
                        </div>
                      )}
                      {profile.interests?.some(i => i.toLowerCase().includes('digital nomad') || i.toLowerCase().includes('remote')) && (
                        <div className="flex items-center gap-2 p-2.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                          <Zap className="w-4 h-4 text-cyan-600" />
                          <span className="text-sm">Digital Nomad</span>
                        </div>
                      )}
                      {profile.interests?.some(i => i.toLowerCase().includes('family')) && (
                        <div className="flex items-center gap-2 p-2.5 bg-pink-500/10 rounded-lg border border-pink-500/20">
                          <Users className="w-4 h-4 text-pink-600" />
                          <span className="text-sm">Family Housing</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interests & Lifestyle */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <span className="text-lg">✨</span> Interests & Lifestyle
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.slice(0, 10).map((interest, idx) => (
                          <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 border-primary/20 transition-colors">
                            {interest}
                          </Badge>
                        ))}
                        {profile.interests.length > 10 && (
                          <Badge variant="outline" className="px-3 py-1.5 text-xs">
                            +{profile.interests.length - 10} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verification Badges */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      Verification Status
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                        profile.verified
                          ? 'bg-green-500/15 border-green-500/30'
                          : 'bg-muted/30 border-muted'
                      }`}>
                        <CheckCircle className={`w-3.5 h-3.5 ${profile.verified ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${profile.verified ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                          ID {profile.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                        insights.photoCount >= 2
                          ? 'bg-blue-500/15 border-blue-500/30'
                          : 'bg-muted/30 border-muted'
                      }`}>
                        <Eye className={`w-3.5 h-3.5 ${insights.photoCount >= 2 ? 'text-blue-500' : 'text-muted-foreground'}`} />
                        <span className={`text-xs font-medium ${insights.photoCount >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                          {insights.photoCount} Photos
                        </span>
                      </div>
                      {insights.readinessScore >= 70 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/15 rounded-full border border-purple-500/30">
                          <Star className="w-3.5 h-3.5 text-purple-500" />
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Top Renter</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Match Reasons - Compact */}
                  {profile.matchReasons && profile.matchReasons.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/5 rounded-xl border border-green-500/20">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        Why They're a Great Match
                      </h4>
                      <div className="space-y-2">
                        {profile.matchReasons.slice(0, 4).map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Profile Highlights */}
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Profile Highlights
                    </h4>
                    <div className="space-y-2">
                      {insights.photoCount >= 3 && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Multiple photos uploaded ({insights.photoCount})</span>
                        </div>
                      )}
                      {insights.interestCount >= 5 && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Clear preferences defined ({insights.interestCount} interests)</span>
                        </div>
                      )}
                      {profile.verified && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Identity verified - Trustworthy renter</span>
                        </div>
                      )}
                      {insights.readinessScore >= 60 && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Complete profile - Ready to rent</span>
                        </div>
                      )}
                      {profile.budget_max && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Budget clearly defined: ${profile.budget_max.toLocaleString()}/mo</span>
                        </div>
                      )}
                    </div>
                  </div>

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
                // PROPERTY LISTING INSIGHTS - Enhanced version
                <div className="mt-4 space-y-5">
                  {/* Hot Listing Alert */}
                  {insights.isHotListing && (
                    <div className="p-3 bg-gradient-to-r from-red-500/15 to-orange-500/10 rounded-xl border border-red-500/30 flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">Hot Listing!</p>
                        <p className="text-xs text-muted-foreground">High quality - Act fast</p>
                      </div>
                    </div>
                  )}

                  {/* Property Title & Location with Category */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-xl font-bold flex-1">{listing.title}</h3>
                      <div className="flex gap-1.5 shrink-0">
                        {insights.category && CATEGORY_ICONS[insights.category] && (
                          <Badge variant="outline" className="gap-1">
                            {CATEGORY_ICONS[insights.category]}
                            <span className="capitalize">{insights.category}</span>
                          </Badge>
                        )}
                        {listing.listing_type && (
                          <Badge variant={listing.listing_type === 'buy' ? 'default' : 'secondary'}>
                            {listing.listing_type === 'buy' ? 'Sale' : 'Rent'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{[listing.neighborhood, listing.city].filter(Boolean).join(', ') || 'Location available'}</span>
                    </div>
                    {listing.created_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Listed {getTimeAgo(new Date(listing.created_at))}
                      </p>
                    )}
                  </div>

                  {/* Full Description - FIRST - Most Important */}
                  {(listing.description || listing.description_full) && (
                    <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                      <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <span className="text-lg">📝</span> About This {insights.isVehicle ? 'Listing' : 'Property'}
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {listing.description_full || listing.description}
                      </p>
                    </div>
                  )}

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-xl border border-green-500/20">
                      <DollarSign className="w-5 h-5 mx-auto text-green-600 mb-1" />
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">${listing.price?.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">{listing.listing_type === 'buy' ? 'price' : '/month'}</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-xl border border-purple-500/20">
                      <Star className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                      <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{insights.qualityScore || 75}%</div>
                      <div className="text-[10px] text-muted-foreground">Quality</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-xl border border-blue-500/20">
                      <Clock className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">&lt;2h</div>
                      <div className="text-[10px] text-muted-foreground">Response</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 rounded-xl border border-yellow-500/20">
                      <Heart className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                      <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{insights.saves}</div>
                      <div className="text-[10px] text-muted-foreground">Interested</div>
                    </div>
                  </div>

                  {/* Key Details Grid - Adaptive for category */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Property-specific details */}
                    {!insights.isVehicle && (
                      <>
                        {listing.beds && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Bed className="w-5 h-5 text-primary" />
                            <div>
                              <div className="text-lg font-bold">{listing.beds}</div>
                              <div className="text-xs text-muted-foreground">Bedrooms</div>
                            </div>
                          </div>
                        )}
                        {listing.baths && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Bath className="w-5 h-5 text-primary" />
                            <div>
                              <div className="text-lg font-bold">{listing.baths}</div>
                              <div className="text-xs text-muted-foreground">Bathrooms</div>
                            </div>
                          </div>
                        )}
                        {listing.square_footage && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Square className="w-5 h-5 text-primary" />
                            <div>
                              <div className="text-lg font-bold">{listing.square_footage}</div>
                              <div className="text-xs text-muted-foreground">Sq Ft</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {/* Yacht-specific */}
                    {insights.category === 'yacht' && (
                      <>
                        {listing.length_m && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Ruler className="w-5 h-5 text-cyan-500" />
                            <div>
                              <div className="text-lg font-bold">{listing.length_m}m</div>
                              <div className="text-xs text-muted-foreground">Length</div>
                            </div>
                          </div>
                        )}
                        {listing.max_passengers && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Users className="w-5 h-5 text-cyan-500" />
                            <div>
                              <div className="text-lg font-bold">{listing.max_passengers}</div>
                              <div className="text-xs text-muted-foreground">Passengers</div>
                            </div>
                          </div>
                        )}
                        {listing.berths && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Bed className="w-5 h-5 text-cyan-500" />
                            <div>
                              <div className="text-lg font-bold">{listing.berths}</div>
                              <div className="text-xs text-muted-foreground">Berths</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {/* Motorcycle-specific */}
                    {insights.category === 'motorcycle' && (
                      <>
                        {listing.engine_cc && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Gauge className="w-5 h-5 text-orange-500" />
                            <div>
                              <div className="text-lg font-bold">{listing.engine_cc}cc</div>
                              <div className="text-xs text-muted-foreground">Engine</div>
                            </div>
                          </div>
                        )}
                        {listing.year && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            <div>
                              <div className="text-lg font-bold">{listing.year}</div>
                              <div className="text-xs text-muted-foreground">Year</div>
                            </div>
                          </div>
                        )}
                        {listing.mileage && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                            <div>
                              <div className="text-lg font-bold">{listing.mileage.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Miles</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {/* Bicycle-specific */}
                    {insights.category === 'bicycle' && (
                      <>
                        {listing.frame_size && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Ruler className="w-5 h-5 text-green-500" />
                            <div>
                              <div className="text-lg font-bold">{listing.frame_size}</div>
                              <div className="text-xs text-muted-foreground">Frame</div>
                            </div>
                          </div>
                        )}
                        {listing.electric_assist && (
                          <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <div>
                              <div className="text-lg font-bold">E-Bike</div>
                              <div className="text-xs text-muted-foreground">Electric</div>
                            </div>
                          </div>
                        )}
                        {listing.battery_range && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <div>
                              <div className="text-lg font-bold">{listing.battery_range}km</div>
                              <div className="text-xs text-muted-foreground">Range</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Key Features Badges */}
                  <div className="flex flex-wrap gap-2">
                    {listing.property_type && (
                      <Badge variant="secondary" className="gap-1">
                        <Home className="w-3 h-3" />
                        {listing.property_type}
                      </Badge>
                    )}
                    {listing.vehicle_type && (
                      <Badge variant="secondary">{listing.vehicle_type}</Badge>
                    )}
                    {listing.furnished && (
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
                        <Sparkles className="w-3 h-3" />
                        Furnished
                      </Badge>
                    )}
                    {listing.pet_friendly && (
                      <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                        🐾 Pet Friendly
                      </Badge>
                    )}
                    {listing.electric_assist && (
                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 gap-1">
                        <Zap className="w-3 h-3" />
                        Electric
                      </Badge>
                    )}
                    {listing.condition && (
                      <Badge variant="outline" className="capitalize">{listing.condition}</Badge>
                    )}
                    {listing.brand && listing.model && (
                      <Badge variant="outline">{listing.brand} {listing.model}</Badge>
                    )}
                  </div>

                  {/* Amenities / Equipment */}
                  {((listing.amenities && listing.amenities.length > 0) || (listing.equipment && listing.equipment.length > 0)) && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {insights.isVehicle ? 'Equipment & Features' : 'Amenities Included'}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[...(listing.amenities || []), ...(listing.equipment || [])].slice(0, 8).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm capitalize">{item}</span>
                          </div>
                        ))}
                        {([...(listing.amenities || []), ...(listing.equipment || [])].length > 8) && (
                          <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg col-span-2">
                            <span className="text-sm text-primary font-medium">
                              +{[...(listing.amenities || []), ...(listing.equipment || [])].length - 8} more features
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Property Images - Horizontal scroll */}
                  {listing.images && listing.images.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        Photos ({listing.images.length})
                      </h4>
                      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory scrollbar-hide">
                        {listing.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedImageIndex(index);
                              setGalleryOpen(true);
                            }}
                            className="relative flex-shrink-0 w-48 aspect-[4/3] rounded-xl overflow-hidden hover:opacity-90 active:scale-[0.98] transition-all snap-start shadow-lg"
                          >
                            <img
                              src={image}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading={index < 2 ? "eager" : "lazy"}
                              decoding="async"
                              fetchPriority={index === 0 ? "high" : "auto"}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                              {index + 1}/{listing.images.length}
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">← Swipe to see more • Tap to zoom</p>
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
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {listing.status === 'available' ? 'Currently Available' :
                             listing.status === 'pending' ? 'Application Pending' :
                             listing.status === 'rented' ? 'Currently Rented' : listing.status || 'Available'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {listing.updated_at
                              ? `Last updated ${getTimeAgo(new Date(listing.updated_at))}`
                              : listing.created_at
                                ? `Listed ${getTimeAgo(new Date(listing.created_at))}`
                                : 'Recently listed'}
                          </p>
                        </div>
                        {listing.status === 'available' && (
                          <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Ready</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Why This Listing */}
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-primary" />
                      Why This Listing
                    </h4>
                    <div className="space-y-2">
                      {listing.images && listing.images.length >= 3 && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Well-documented with {listing.images.length} photos</span>
                        </div>
                      )}
                      {listing.description && listing.description.length > 100 && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Detailed description provided</span>
                        </div>
                      )}
                      {((listing.amenities?.length || 0) + (listing.equipment?.length || 0)) >= 5 && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Feature-rich with {(listing.amenities?.length || 0) + (listing.equipment?.length || 0)}+ amenities</span>
                        </div>
                      )}
                      {listing.status === 'available' && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Available now - Ready for viewing</span>
                        </div>
                      )}
                      {listing.furnished && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">Move-in ready - Fully furnished</span>
                        </div>
                      )}
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
