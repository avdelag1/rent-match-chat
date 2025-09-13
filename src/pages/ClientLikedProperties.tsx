import { DashboardLayout } from "@/components/DashboardLayout";
import { LikedPropertiesDialog } from "@/components/LikedPropertiesDialog";
import { PropertyDetails } from "@/components/PropertyDetails";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLikedProperties } from "@/hooks/useLikedProperties";
import { useUserSubscription } from "@/hooks/useSubscription";
import { Heart, MessageCircle, MapPin, Bed, Bath, Square, Crown, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const ClientLikedProperties = () => {
  const [showLikedDialog, setShowLikedDialog] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const { data: likedProperties = [], isLoading } = useLikedProperties();
  const { data: subscription } = useUserSubscription();

  // Mock messages remaining - this would come from your subscription/usage system  
  const messagesRemaining = subscription?.subscription_packages?.name === 'Premium' ? 999 : 3;

  const handlePropertySelect = (listingId: string) => {
    setSelectedListingId(listingId);
    setShowPropertyDetails(true);
  };

  const handleContactOwner = (propertyTitle: string) => {
    if (messagesRemaining <= 0) {
      toast({
        title: "No messages remaining",
        description: "Upgrade your subscription to contact property owners.",
        variant: "destructive"
      });
      return;
    }
    
    // This would typically navigate to messaging or open a contact modal
    toast({
      title: "Contact initiated",
      description: `Starting conversation about ${propertyTitle}. ${messagesRemaining - 1} messages remaining.`,
    });
  };

  return (
    <DashboardLayout userRole="client">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              Your Liked Properties
            </h1>
            <p className="text-white/80">Properties you've shown interest in.</p>
            {messagesRemaining > 0 && (
              <div className="mt-4">
                <Badge variant="secondary" className="text-sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {messagesRemaining} messages remaining
                </Badge>
              </div>
            )}
          </div>

          {isLoading ? (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-white/80">Loading your liked properties...</p>
              </CardContent>
            </Card>
          ) : likedProperties.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {likedProperties.map((property) => (
                <Card key={property.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 overflow-hidden group">
                  {/* Property Image */}
                  <div className="relative h-48 overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                        <Heart className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 hover:bg-red-600">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        Liked
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => handlePropertySelect(property.id)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg flex items-center justify-between">
                      <span className="truncate">{property.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {property.property_type}
                      </Badge>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Location */}
                    <div className="flex items-center text-white/80">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm truncate">{property.address}</span>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center gap-4 text-white/70 text-sm">
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
                    <div className="text-white font-bold text-xl">
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
                          <span className="text-white/60 text-xs">+{property.amenities.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* Contact Button */}
                    <div className="pt-2">
                      <Button
                        onClick={() => handleContactOwner(property.title)}
                        disabled={messagesRemaining <= 0}
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
                      >
                        {messagesRemaining <= 0 ? (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade to Contact
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
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Heart className="w-20 h-20 text-white/30 mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-4">No Liked Properties Yet</h3>
                <p className="text-white/70 text-center mb-8 max-w-md leading-relaxed">
                  Start exploring properties and swipe right on the ones you love. They'll appear here where you can view details and contact owners directly.
                </p>
                <div className="space-y-3 w-full max-w-sm">
                  <Button 
                    onClick={() => window.location.href = '/client/dashboard'}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 py-3"
                  >
                    Start Swiping Properties
                  </Button>
                  <p className="text-white/50 text-center text-sm">
                    💡 Swipe right to like properties and build your collection
                  </p>
                </div>
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
        onMessageClick={() => handleContactOwner("this property")}
      />
    </DashboardLayout>
  );
};

export default ClientLikedProperties;