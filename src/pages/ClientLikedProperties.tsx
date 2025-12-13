import { DashboardLayout } from "@/components/DashboardLayout";
import { LikedPropertiesDialog } from "@/components/LikedPropertiesDialog";
import { PropertyDetails } from "@/components/PropertyDetails";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLikedProperties } from "@/hooks/useLikedProperties";
import { useUserSubscription } from "@/hooks/useSubscription";
import { useStartConversation, useConversationStats } from "@/hooks/useConversations";
import { useNavigate } from "react-router-dom";
import { Flame, MessageCircle, MapPin, Bed, Bath, Square, ExternalLink, RefreshCw, Camera, Heart, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useMessagingQuota } from "@/hooks/useMessagingQuota";
import { MessageQuotaDialog } from "@/components/MessageQuotaDialog";
import { motion, AnimatePresence } from "framer-motion";
import { springConfigs, listContainerVariants, listItemVariants } from "@/utils/modernAnimations";

const ClientLikedProperties = () => {
  const [showLikedDialog, setShowLikedDialog] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [galleryState, setGalleryState] = useState<{
    isOpen: boolean;
    images: string[];
    alt: string;
    initialIndex: number;
  }>({
    isOpen: false,
    images: [],
    alt: '',
    initialIndex: 0
  });
  const { data: likedProperties = [], isLoading, refetch: refreshLikedProperties } = useLikedProperties();
  const { data: subscription } = useUserSubscription();
  const { data: conversationStats } = useConversationStats();
  const startConversation = useStartConversation();
  const navigate = useNavigate();
  const { canStartNewConversation } = useMessagingQuota();
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);

  const conversationsRemaining = conversationStats?.conversationsLeft || 0;

  const handlePropertySelect = (listingId: string) => {
    setSelectedListingId(listingId);
    setShowPropertyDetails(true);
  };

  const handleContactOwner = async (property: any) => {
    try {
      const result = await startConversation.mutateAsync({
        otherUserId: property.owner_id,
        listingId: property.id,
        initialMessage: `Hi! I'm interested in your property: ${property.title}. Could you tell me more about it?`,
        canStartNewConversation: true
      });

      if (result?.conversationId) {
        navigate(`/messages?conversationId=${result.conversationId}`);
      } else {
        navigate('/messages');
      }

    } catch (error) {
      console.error('Failed to start conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
      toast({
        title: "Unable to start conversation",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleImageClick = (property: any, imageIndex: number = 0) => {
    if (property.images && property.images.length > 0) {
      setGalleryState({
        isOpen: true,
        images: property.images,
        alt: property.title,
        initialIndex: imageIndex
      });
    }
  };

  // Skeleton loader component
  const PropertySkeleton = () => (
    <div className="rounded-2xl overflow-hidden bg-card border border-border/50">
      <div className="h-52 bg-gradient-to-br from-muted to-muted/50 animate-pulse relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
      </div>
      <div className="p-5 space-y-4">
        <div className="h-5 bg-muted rounded-full w-3/4 animate-pulse" />
        <div className="h-4 bg-muted rounded-full w-1/2 animate-pulse" />
        <div className="flex gap-3">
          <div className="h-4 bg-muted rounded-full w-16 animate-pulse" />
          <div className="h-4 bg-muted rounded-full w-16 animate-pulse" />
        </div>
        <div className="h-10 bg-muted rounded-xl animate-pulse mt-4" />
      </div>
    </div>
  );

  return (
    <DashboardLayout userRole="client">
      <div className="w-full min-h-full bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springConfigs.smooth}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/25"
                >
                  <Heart className="w-7 h-7 text-white fill-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Liked Properties
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base mt-0.5">
                    {likedProperties.length} {likedProperties.length === 1 ? 'property' : 'properties'} saved
                  </p>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => refreshLikedProperties()}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="rounded-xl border-border/50 hover:bg-accent/50 transition-all duration-200 gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <PropertySkeleton key={i} />
              ))}
            </div>
          ) : likedProperties.length > 0 ? (
            <motion.div
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {likedProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    variants={listItemVariants}
                    layout
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="group"
                  >
                    <Card className="overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl">
                      {/* Image Section */}
                      <motion.div
                        className="relative h-52 overflow-hidden cursor-pointer"
                        onClick={() => handleImageClick(property, 0)}
                        whileTap={{ scale: 0.98 }}
                      >
                        {property.images && property.images.length > 0 ? (
                          <>
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* View photos button */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              whileHover={{ opacity: 1, y: 0 }}
                              className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                              <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                <Camera className="w-4 h-4" />
                                View Photos
                              </div>
                            </motion.div>

                            {/* Image counter */}
                            {property.images.length > 1 && (
                              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-medium">
                                1/{property.images.length}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            <Flame className="w-14 h-14 text-muted-foreground/30" />
                          </div>
                        )}

                        {/* Liked badge */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={springConfigs.bouncy}
                          className="absolute top-3 left-3"
                        >
                          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 border-0 text-white shadow-lg shadow-red-500/25 px-3 py-1">
                            <Heart className="w-3 h-3 mr-1.5 fill-current" />
                            Liked
                          </Badge>
                        </motion.div>

                        {/* View details button */}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute top-3 right-3"
                        >
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-9 w-9 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePropertySelect(property.id);
                            }}
                          >
                            <ExternalLink className="w-4 h-4 text-gray-700" />
                          </Button>
                        </motion.div>
                      </motion.div>

                      <CardContent className="p-5 space-y-4">
                        {/* Title and Type */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-1 flex-1">
                            {property.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs shrink-0 rounded-lg bg-muted/80">
                            {property.property_type}
                          </Badge>
                        </div>

                        {/* Location */}
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2 shrink-0 text-primary/60" />
                          <span className="text-sm truncate">{property.address}</span>
                        </div>

                        {/* Property specs */}
                        <div className="flex items-center gap-4 text-muted-foreground">
                          {property.beds && (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Bed className="w-4 h-4" />
                              <span>{property.beds}</span>
                            </div>
                          )}
                          {property.baths && (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Bath className="w-4 h-4" />
                              <span>{property.baths}</span>
                            </div>
                          )}
                          {property.square_footage && (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Square className="w-4 h-4" />
                              <span>{property.square_footage} ft²</span>
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-foreground">
                            ${property.price?.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground text-sm">/month</span>
                        </div>

                        {/* Amenities */}
                        {property.amenities && property.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {property.amenities.slice(0, 3).map((amenity, index) => (
                              <span
                                key={index}
                                className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-medium"
                              >
                                {amenity}
                              </span>
                            ))}
                            {property.amenities.length > 3 && (
                              <span className="text-muted-foreground text-xs px-2 py-1">
                                +{property.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Contact Button */}
                        <motion.div
                          className="pt-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => handleContactOwner(property)}
                            disabled={startConversation.isPending}
                            className="w-full rounded-xl h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 font-medium"
                          >
                            {startConversation.isPending ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Contact Owner
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={springConfigs.smooth}
            >
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm rounded-2xl">
                <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={springConfigs.bouncy}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-6"
                  >
                    <Heart className="w-10 h-10 text-muted-foreground/50" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Liked Properties</h3>
                  <p className="text-muted-foreground text-center max-w-sm">
                    Properties you like will appear here. Start exploring to find your perfect match!
                  </p>
                  <motion.div className="mt-6" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => navigate('/client/dashboard')}
                      className="rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Exploring
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <LikedPropertiesDialog
        isOpen={showLikedDialog}
        onClose={() => setShowLikedDialog(false)}
        onPropertySelect={handlePropertySelect}
      />

      <PropertyDetails
        listingId={selectedListingId}
        isOpen={showPropertyDetails}
        onClose={() => {
          setShowPropertyDetails(false);
          setSelectedListingId(null);
        }}
        onMessageClick={() => {
          const selectedProperty = likedProperties.find(p => p.id === selectedListingId);
          if (selectedProperty) {
            handleContactOwner(selectedProperty);
          }
        }}
      />

      <PropertyImageGallery
        images={galleryState.images}
        alt={galleryState.alt}
        isOpen={galleryState.isOpen}
        onClose={() => setGalleryState(prev => ({ ...prev, isOpen: false }))}
        initialIndex={galleryState.initialIndex}
      />

      <MessageQuotaDialog
        isOpen={showQuotaDialog}
        onClose={() => setShowQuotaDialog(false)}
        onUpgrade={() => {
          setShowQuotaDialog(false);
          navigate('/subscription-packages');
        }}
        userRole={'client'}
      />
    </DashboardLayout>
  );
};

export default ClientLikedProperties;
