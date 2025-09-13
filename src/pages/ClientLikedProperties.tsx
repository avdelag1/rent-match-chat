import { DashboardLayout } from "@/components/DashboardLayout";
import { LikedPropertiesDialog } from "@/components/LikedPropertiesDialog";
import { PropertyDetails } from "@/components/PropertyDetails";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLikedProperties } from "@/hooks/useLikedProperties";
import { Heart } from "lucide-react";

const ClientLikedProperties = () => {
  const [showLikedDialog, setShowLikedDialog] = useState(false);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const { data: likedProperties = [], isLoading } = useLikedProperties();

  const handlePropertySelect = (listingId: string) => {
    setSelectedListingId(listingId);
    setShowPropertyDetails(true);
  };

  const handleMessageClick = () => {
    // Handle messaging logic
  };

  return (
    <DashboardLayout userRole="client">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Liked Properties</h1>
            <p className="text-white/80">Properties you've shown interest in.</p>
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
                <Card key={property.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors cursor-pointer" onClick={() => handlePropertySelect(property.id)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                      {property.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-white/80">{property.address}</p>
                      <p className="text-white font-semibold">${property.price}/month</p>
                      <p className="text-white/60 text-sm">{property.beds} bed • {property.baths} bath</p>
                      {property.amenities && property.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="w-16 h-16 text-white/30 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Liked Properties Yet</h3>
                <p className="text-white/70 text-center mb-6 max-w-md">
                  Start swiping on properties to build your favorites list. Properties you like will appear here.
                </p>
                <Button 
                  onClick={() => window.location.href = '/client/dashboard'}
                  className="bg-primary hover:bg-primary/90"
                >
                  Start Swiping Properties
                </Button>
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
        onMessageClick={handleMessageClick}
      />
    </DashboardLayout>
  );
};

export default ClientLikedProperties;