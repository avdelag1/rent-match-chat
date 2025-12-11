import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Listing } from '@/hooks/useListings';
import { MatchedClientProfile } from '@/hooks/useSmartMatching';
import { Eye, TrendingUp, Clock, Users, MapPin, DollarSign, Calendar, Shield, CheckCircle, Star, X } from 'lucide-react';
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

  // Mock insights data - in production, fetch from API
  const insights = {
    views: Math.floor(Math.random() * 500) + 100,
    saves: Math.floor(Math.random() * 50) + 10,
    shares: Math.floor(Math.random() * 20) + 2,
    responseRate: Math.floor(Math.random() * 30) + 70,
    avgResponseTime: Math.floor(Math.random() * 24) + 1,
    popularityScore: Math.floor(Math.random() * 3) + 7,
    viewsLastWeek: Math.floor(Math.random() * 200) + 50,
    demandLevel: Math.random() > 0.5 ? 'high' : 'medium',
    priceVsMarket: Math.floor((Math.random() * 20) - 10)
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <motion.div
            initial={{ opacity: 0, y: '60%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '60%' }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 800,
              mass: 0.3,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            <DialogContent className={`max-w-lg w-full max-h-[85vh] h-[80vh] overflow-y-auto ${isDragging ? 'opacity-95' : ''}`}>
              <motion.div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Eye className="w-6 h-6 text-primary" />
                  {isClientProfile ? 'Renter Insights' : 'Property Insights'}
                </DialogTitle>
              </DialogHeader>

              {isClientProfile && profile ? (
                // RENTER/CLIENT PROFILE INSIGHTS
                <div className="mt-6 space-y-6">
                  {/* Profile Summary */}
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">{profile.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.city || 'Location not specified'}</span>
                    </div>
                  </div>

                  {/* Profile Photos - Large Scrollable */}
                  {profile.profile_images && profile.profile_images.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Profile Photos ({profile.profile_images.length})
                      </h4>
                      <div className="space-y-3">
                        {profile.profile_images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedImageIndex(index);
                              setGalleryOpen(true);
                            }}
                            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden hover:opacity-90 active:scale-[0.98] transition-all duration-75"
                            style={{ willChange: 'transform' }}
                          >
                            <img
                              src={image}
                              alt={`${profile.name} photo ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading={index < 2 ? "eager" : "lazy"}
                              decoding="async"
                              fetchPriority={index === 0 ? "high" : "auto"}
                            />
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                              {index + 1} / {profile.profile_images.length}
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">Tap any photo to view full size & zoom</p>
                    </div>
                  )}

                  {/* Application Quality Score */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Application Quality
                    </h4>
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Profile Completeness</span>
                        <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">
                          {Math.floor(Math.random() * 20) + 80}%
                        </Badge>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.floor(Math.random() * 20) + 80}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Response Rate */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Response Time
                    </h4>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        Typically responds within <span className="font-semibold text-foreground">2-4 hours</span>
                      </p>
                    </div>
                  </div>

                  {/* Competition Level */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-red-500" />
                      Competition Level
                    </h4>
                    <div className="p-4 bg-gradient-to-r from-red-50 to-red-50 dark:from-red-950/20 dark:to-red-950/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {Math.floor(Math.random() * 10) + 5} other owners interested
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Act fast to secure this tenant
                          </p>
                        </div>
                        <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">
                          🔥 High Interest
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      Verification Status
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          {profile.verified ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                          )}
                          <span className="text-sm font-medium">ID Verified</span>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          {Math.random() > 0.5 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                          )}
                          <span className="text-sm font-medium">Income</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  {profile.matchReasons && profile.matchReasons.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Why This Renter Matches</h4>
                      <div className="space-y-2">
                        {profile.matchReasons.map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : listing ? (
                // PROPERTY LISTING INSIGHTS (Original)
                <div className="mt-6 space-y-6">
                  {/* Property Summary with Description */}
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.neighborhood}, {listing.city}</span>
                    </div>
                    {listing.description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                        {listing.description}
                      </p>
                    )}
                  </div>

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

                  {/* Amenities - Moved up */}
                  {listing.amenities && listing.amenities.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Amenities Included</h4>
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

                  {/* Property Images - Large Scrollable */}
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
                            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden hover:opacity-90 active:scale-[0.98] transition-all duration-75"
                            style={{ willChange: 'transform' }}
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

                {/* View Statistics */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    View Statistics
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Views" value={insights.views} icon="👁️" />
                    <StatCard label="Saves" value={insights.saves} icon="💾" />
                    <StatCard label="Shares" value={insights.shares} icon="🔗" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>+{insights.viewsLastWeek} views in the last 7 days</span>
                  </div>
                </div>

                {/* Response Rate */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-500" />
                    Owner Response
                  </h4>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Response Rate</span>
                      <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">
                        {insights.responseRate}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${insights.responseRate}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Typically responds within {insights.avgResponseTime} hour{insights.avgResponseTime > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Popularity Score */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    Popularity & Demand
                  </h4>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {insights.popularityScore}
                        </span>
                        <span className="text-sm text-muted-foreground">/ 10</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Popularity Score</p>
                    </div>
                    <Badge className={`
                      ${insights.demandLevel === 'high' 
                        ? 'bg-red-500/20 text-red-700 dark:text-red-400' 
                        : 'bg-red-500/20 text-red-700 dark:text-red-400'
                      }
                    `}>
                      {insights.demandLevel === 'high' ? '🔥 High Demand' : '📈 Medium Demand'}
                    </Badge>
                  </div>
                </div>

                {/* Price Analysis */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Price Analysis
                  </h4>
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">vs. Market Average</span>
                      <Badge className={`
                        ${insights.priceVsMarket < 0 
                          ? 'bg-green-500/20 text-green-700 dark:text-green-400' 
                          : 'bg-red-500/20 text-red-700 dark:text-red-400'
                        }
                      `}>
                        {insights.priceVsMarket > 0 ? '+' : ''}{insights.priceVsMarket}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {insights.priceVsMarket < 0 
                        ? `This property is priced ${Math.abs(insights.priceVsMarket)}% below market average - great value!`
                        : `This property is priced ${insights.priceVsMarket}% above market average.`
                      }
                    </p>
                  </div>
                </div>

                {/* Availability Indicator */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Availability
                  </h4>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <div>
                        <p className="text-sm font-medium">Currently Available</p>
                        <p className="text-xs text-muted-foreground">Last updated 2 hours ago</p>
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
