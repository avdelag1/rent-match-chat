import { DashboardLayout } from "@/components/DashboardLayout";
import { LikedPropertiesDialog } from "@/components/LikedPropertiesDialog";
import { PropertyDetails } from "@/components/PropertyDetails";
import { PropertyImageGallery } from "@/components/PropertyImageGallery";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLikedProperties } from "@/hooks/useLikedProperties";
import { useUserSubscription } from "@/hooks/useSubscription";
import { useStartConversation, useConversationStats } from "@/hooks/useConversations";
import { useNavigate } from "react-router-dom";
import { Flame, MessageCircle, MapPin, Bed, Bath, Square, Crown, ExternalLink, RefreshCw, Camera } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useMessagingQuota } from "@/hooks/useMessagingQuota";
import { MessageQuotaDialog } from "@/components/MessageQuotaDialog";

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

  // Get conversations remaining from the stats
  const conversationsRemaining = conversationStats?.conversationsLeft || 0;

  const handlePropertySelect = (listingId: string) => {
    setSelectedListingId(listingId);
    setShowPropertyDetails(true);
  };

  const handleContactOwner = async (property: any) => {

    // Always allow messaging - bypass quota
    try {
      // Start a conversation with the property owner
      const result = await startConversation.mutateAsync({
        otherUserId: property.owner_id,
        listingId: property.id,
        initialMessage: `Hi! I'm interested in your property: ${property.title}. Could you tell me more about it?`,
        canStartNewConversation: true // Always allow
      });
      

      // Navigate to messages with the conversation ID to open it directly
      if (result?.conversationId) {
        navigate(`/messages?conversationId=${result.conversationId}`);
      } else {
        navigate('/messages');
      }
      
    } catch (error) {
      console.error('❌ Failed to start conversation:', error);
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

  return (
    <DashboardLayout userRole="client">
      <div className="w-full h-full overflow-y-auto p-4 sm:p-8 bg-background pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <Flame className="w-8 h-8 text-red-500" />
              Your Liked Properties
            </h1>
            <p className="text-muted-foreground">Properties you've shown interest in.</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                onClick={() => refreshLikedProperties()}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {isLoading ? (
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading your liked properties...</p>
              </CardContent>
            </Card>
          ) : likedProperties.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {likedProperties.map((property) => (
                <Card key={property.id} className="bg-card border-border hover:bg-accent/50 transition-all duration-300 overflow-hidden group shadow-sm">
                  {/* Property Image */}
                  <div 
                    className="relative h-48 overflow-hidden cursor-pointer group"
                    onClick={() => handleImageClick(property, 0)}
                  >
                    {property.images && property.images.length > 0 ? (
                      <>
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Image overlay with camera icon */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2">
                            <Camera className="w-5 h-5 text-gray-800" />
                          </div>
                        </div>
                        {/* Image counter */}
                        {property.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                            1 / {property.images.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <Flame className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 hover:bg-red-600">
                        <Flame className="w-3 h-3 mr-1 fill-current" />
                        Liked
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-background/20 hover:bg-background/30 text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePropertySelect(property.id);
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                  <CardTitle className="text-gray-900 text-lg flex items-center justify-between">
                      <span className="truncate">{property.title}</span>
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                        {property.property_type}
                      </Badge>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Location */}
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm truncate">{property.address}</span>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                      {property.beds && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{property.beds}</span>
                        </div>
                      )}
                      {property.baths && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.baths}</span>
                        </div>
                      )}
                      {property.square_footage && (
                        <div className="flex items-center gap-1">
                          <Square className="w-4 h-4" />
                          <span>{property.square_footage} ft²</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-foreground font-bold text-xl">
                      ${property.price?.toLocaleString()}/month
                    </div>

                    {/* Amenities */}
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {property.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="text-muted-foreground text-xs">+{property.amenities.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* Contact Button */}
                    <div className="pt-2">
                      <Button
                        onClick={() => handleContactOwner(property)}
                        disabled={startConversation.isPending}
                        className="w-full"
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Flame className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Liked Properties</h3>
                <p className="text-muted-foreground text-center">
                  Properties you like will appear here.
                </p>
              </CardContent>
            </Card>
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