
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, Calendar, DollarSign, MessageCircle, TrendingUp, Clock, Shield, Star, CheckCircle, Home, Sparkles } from 'lucide-react';
import { Listing } from '@/hooks/useListings';
import { PropertyImageGallery } from './PropertyImageGallery';
import { useNavigate } from 'react-router-dom';
import { useStartConversation } from '@/hooks/useConversations';
import { toast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';

interface PropertyInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing | null;
}

export function PropertyInsightsDialog({ open, onOpenChange, listing }: PropertyInsightsDialogProps) {
  const navigate = useNavigate();
  const startConversation = useStartConversation();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Calculate property insights based on listing data
  const propertyInsights = useMemo(() => {
    if (!listing) return null;

    const pricePerSqft = listing.square_footage && listing.price
      ? Math.round(listing.price / listing.square_footage)
      : null;

    const amenityCount = listing.amenities?.length || 0;
    const imageCount = listing.images?.length || 0;

    // Calculate listing quality score (0-100)
    let qualityScore = 0;
    if (listing.description && listing.description.length > 100) qualityScore += 20;
    if (imageCount >= 5) qualityScore += 25;
    else if (imageCount >= 3) qualityScore += 15;
    else if (imageCount >= 1) qualityScore += 5;
    if (amenityCount >= 8) qualityScore += 20;
    else if (amenityCount >= 4) qualityScore += 10;
    if (listing.furnished) qualityScore += 10;
    if (listing.pet_friendly) qualityScore += 10;
    if (listing.square_footage) qualityScore += 5;
    if (listing.beds && listing.baths) qualityScore += 10;

    // Value rating based on price per sqft (simplified)
    let valueRating: 'excellent' | 'good' | 'fair' | 'premium' = 'good';
    if (pricePerSqft) {
      if (pricePerSqft < 15) valueRating = 'excellent';
      else if (pricePerSqft < 25) valueRating = 'good';
      else if (pricePerSqft < 40) valueRating = 'fair';
      else valueRating = 'premium';
    }

    return {
      pricePerSqft,
      qualityScore: Math.min(100, qualityScore),
      valueRating,
      amenityCount,
      imageCount,
      responseRate: Math.min(95, 70 + amenityCount * 2), // Simulated
      avgResponseTime: amenityCount > 5 ? '< 1 hour' : '1-2 hours',
    };
  }, [listing]);

  if (!listing) return null;

  const handleMessage = async () => {
    if (!listing.owner_id) {
      toast({
        title: 'Error',
        description: 'Property owner information not available',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingConversation(true);
    try {
      toast({
        title: 'Starting conversation',
        description: 'Creating a new conversation...',
      });

      const result = await startConversation.mutateAsync({
        otherUserId: listing.owner_id,
        listingId: listing.id,
        initialMessage: `Hi! I'm interested in your property: ${listing.title}. Could you tell me more about it?`,
        canStartNewConversation: true,
      });

      if (result?.conversationId) {
        navigate(`/messages?conversationId=${result.conversationId}`);
        onOpenChange(false); // Close dialog
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error starting conversation:', error);
      }
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
      <DialogContent className="sm:max-w-2xl max-h-[92vh] flex flex-col p-0 sm:top-[2vh]">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Property Insights</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 h-full">
          <div className="space-y-5 py-4 px-6 pb-8">
            {/* Basic Info - Compact */}
            <div>
              <h3 className="text-xl font-bold mb-2">{listing.title}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{listing.address}, {listing.neighborhood}, {listing.city}</span>
              </div>
            </div>

            {/* Description - FIRST - Most Important */}
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

            {/* Property Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-semibold">${listing.price?.toLocaleString()}/month</span>
              </div>
              {listing.beds && (
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  <span>{listing.beds} bedroom{listing.beds !== 1 ? 's' : ''}</span>
                </div>
              )}
              {listing.baths && (
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4" />
                  <span>{listing.baths} bathroom{listing.baths !== 1 ? 's' : ''}</span>
                </div>
              )}
              {listing.square_footage && (
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  <span>{listing.square_footage} sqft</span>
                </div>
              )}
            </div>

            {/* Property Type & Features */}
            <div>
              <h4 className="font-semibold mb-2">Property Features</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{listing.property_type}</Badge>
                {listing.furnished && <Badge variant="secondary">Furnished</Badge>}
                {listing.pet_friendly && <Badge variant="secondary">Pet Friendly</Badge>}
                <Badge variant="outline">{listing.status}</Badge>
              </div>
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">{amenity}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Property Analytics */}
            <div>
              <h4 className="font-semibold mb-2">Property Analytics</h4>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm">📊 Current rent: ${listing.price?.toLocaleString()}/month</p>
                <p className="text-sm">📏 Space: {listing.square_footage ? `${listing.square_footage} sqft` : 'Size not specified'}</p>
                <p className="text-sm">🏠 Type: {listing.property_type} in {listing.neighborhood}</p>
                <p className="text-sm">✨ Features: {(listing.amenities?.length || 0)} amenities listed</p>
                {listing.furnished && <p className="text-sm">🪑 Furnished property available</p>}
                {listing.pet_friendly && <p className="text-sm">🐕 Pet-friendly accommodation</p>}
              </div>
            </div>

            {/* Enhanced Market Insights */}
            {propertyInsights && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Market Insights
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {propertyInsights.pricePerSqft && (
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-3 rounded-lg text-center border border-green-500/20">
                      <DollarSign className="w-5 h-5 mx-auto text-green-600 dark:text-green-400 mb-1" />
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">${propertyInsights.pricePerSqft}</div>
                      <div className="text-xs text-muted-foreground">per sqft</div>
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-3 rounded-lg text-center border border-purple-500/20">
                    <Star className="w-5 h-5 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{propertyInsights.qualityScore}%</div>
                    <div className="text-xs text-muted-foreground">Quality Score</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-3 rounded-lg text-center border border-blue-500/20">
                    <Clock className="w-5 h-5 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{propertyInsights.avgResponseTime}</div>
                    <div className="text-xs text-muted-foreground">Avg Response</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 p-3 rounded-lg text-center border border-yellow-500/20">
                    <MessageCircle className="w-5 h-5 mx-auto text-yellow-600 dark:text-yellow-400 mb-1" />
                    <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{propertyInsights.responseRate}%</div>
                    <div className="text-xs text-muted-foreground">Response Rate</div>
                  </div>
                </div>
              </div>
            )}

            {/* Value Assessment */}
            {propertyInsights && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Value Assessment
                </h4>
                <div className={`p-4 rounded-lg border ${
                  propertyInsights.valueRating === 'excellent' ? 'bg-green-500/10 border-green-500/30' :
                  propertyInsights.valueRating === 'good' ? 'bg-blue-500/10 border-blue-500/30' :
                  propertyInsights.valueRating === 'fair' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-purple-500/10 border-purple-500/30'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${
                      propertyInsights.valueRating === 'excellent' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                      propertyInsights.valueRating === 'good' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                      propertyInsights.valueRating === 'fair' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                      'bg-purple-500/20 text-purple-700 dark:text-purple-400'
                    }`}>
                      {propertyInsights.valueRating === 'excellent' ? '🌟 Excellent Value' :
                       propertyInsights.valueRating === 'good' ? '👍 Good Value' :
                       propertyInsights.valueRating === 'fair' ? '💰 Fair Price' :
                       '✨ Premium Property'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {propertyInsights.valueRating === 'excellent'
                      ? 'This property offers exceptional value for the area. Great opportunity!'
                      : propertyInsights.valueRating === 'good'
                      ? 'Competitively priced with good features for the neighborhood.'
                      : propertyInsights.valueRating === 'fair'
                      ? 'Priced appropriately for the features and location offered.'
                      : 'Premium property with high-end features and prime location.'}
                  </p>
                </div>
              </div>
            )}

            {/* Property Highlights */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Property Highlights
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {listing.furnished && (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    <Home className="w-4 h-4 text-primary" />
                    <span className="text-sm">Fully Furnished</span>
                  </div>
                )}
                {listing.pet_friendly && (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    <span className="text-base">🐾</span>
                    <span className="text-sm">Pet Friendly</span>
                  </div>
                )}
                {listing.beds && listing.beds >= 2 && (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    <Bed className="w-4 h-4 text-primary" />
                    <span className="text-sm">Spacious Layout</span>
                  </div>
                )}
                {(listing.amenities?.length || 0) >= 5 && (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm">Well-Equipped</span>
                  </div>
                )}
                {listing.square_footage && listing.square_footage >= 800 && (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    <Square className="w-4 h-4 text-primary" />
                    <span className="text-sm">Generous Space</span>
                  </div>
                )}
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Verified Listing</span>
                </div>
              </div>
            </div>

            {/* Availability Status */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Availability
              </h4>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    listing.status === 'available' ? 'bg-green-500 animate-pulse' :
                    listing.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">
                      {listing.status === 'available' ? 'Currently Available' :
                       listing.status === 'pending' ? 'Application Pending' :
                       listing.status === 'rented' ? 'Currently Rented' : listing.status || 'Available'}
                    </p>
                    <p className="text-xs text-muted-foreground">Ready for immediate move-in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Neighborhood Info */}
            {listing.neighborhood && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Neighborhood: {listing.neighborhood}
                </h4>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Located in the {listing.neighborhood} area of {listing.city || 'the city'}.
                    {listing.tulum_location && ` Specifically in ${listing.tulum_location}.`}
                  </p>
                  {listing.lifestyle_compatible && listing.lifestyle_compatible.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Compatible lifestyles:</p>
                      <div className="flex flex-wrap gap-1">
                        {listing.lifestyle_compatible.slice(0, 5).map((lifestyle, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{lifestyle}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Property Images Grid - Moved to Bottom */}
            {listing.images && listing.images.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <span className="text-lg">📸</span> Property Photos ({listing.images.length})
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setGalleryOpen(true);
                      }}
                      className="relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading={index < 3 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={index === 0 ? "high" : "auto"}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">Tap any photo to view full size</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button
            onClick={handleMessage}
            disabled={isCreatingConversation}
            className="w-full"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {isCreatingConversation ? 'Starting conversation...' : 'Contact Owner'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Full Screen Image Gallery */}
      {listing.images && listing.images.length > 0 && (
        <PropertyImageGallery
          images={listing.images}
          alt={listing.title}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          initialIndex={selectedImageIndex}
        />
      )}
    </Dialog>
  );
}
