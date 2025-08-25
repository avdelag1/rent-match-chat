
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, X, MessageCircle, User, LogOut } from "lucide-react";
import { useState } from "react";

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(0);
  
  // Mock property data - in real app this would come from Supabase
  const properties = [
    {
      id: 1,
      title: "Beautiful Beach House",
      location: "Tulum, Mexico",
      price: "$2,500/month",
      image: "/placeholder.svg",
      description: "Stunning oceanfront property with modern amenities"
    },
    {
      id: 2,
      title: "Cozy Downtown Apartment", 
      location: "Playa del Carmen, Mexico",
      price: "$1,800/month",
      image: "/placeholder.svg",
      description: "Perfect location in the heart of the city"
    }
  ];

  const handleSwipe = (direction: 'left' | 'right') => {
    console.log(`Swiped ${direction} on property ${properties[currentPropertyIndex]?.title}`);
    
    if (currentPropertyIndex < properties.length - 1) {
      setCurrentPropertyIndex(currentPropertyIndex + 1);
    } else {
      setCurrentPropertyIndex(0); // Reset to first property
    }
  };

  const currentProperty = properties[currentPropertyIndex];

  return (
    <div className="min-h-screen bg-gradient-primary p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6 text-white" />
          <span className="text-white font-medium">{user?.email}</span>
        </div>
        <Button
          onClick={signOut}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Find Your Perfect Home
        </h1>

        {/* Property Card */}
        {currentProperty && (
          <Card className="bg-card border-border shadow-glow mb-6 overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Property Image</span>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{currentProperty.title}</h2>
              <p className="text-muted-foreground mb-2">{currentProperty.location}</p>
              <p className="text-2xl font-bold text-primary mb-4">{currentProperty.price}</p>
              <p className="text-sm text-muted-foreground">{currentProperty.description}</p>
            </div>
          </Card>
        )}

        {/* Swipe Actions */}
        <div className="flex justify-center space-x-8 mb-8">
          <Button
            onClick={() => handleSwipe('left')}
            size="lg"
            variant="secondary"
            className="rounded-full w-16 h-16 p-0"
          >
            <X className="h-8 w-8" />
          </Button>
          
          <Button
            onClick={() => handleSwipe('right')}
            size="lg" 
            className="rounded-full w-16 h-16 p-0 bg-gradient-button hover:bg-gradient-button/90"
          >
            <Heart className="h-8 w-8" />
          </Button>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Messages</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
