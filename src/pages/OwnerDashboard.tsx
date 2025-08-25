
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Home, MessageCircle, User, LogOut, Eye, Heart } from "lucide-react";

const OwnerDashboard = () => {
  const { user, signOut } = useAuth();
  
  // Mock listings data - in real app this would come from Supabase
  const listings = [
    {
      id: 1,
      title: "Beach House Villa",
      location: "Tulum, Mexico", 
      price: "$2,500/month",
      status: "Active",
      views: 45,
      likes: 12
    },
    {
      id: 2,
      title: "Modern Apartment",
      location: "Playa del Carmen, Mexico",
      price: "$1,800/month", 
      status: "Pending",
      views: 23,
      likes: 8
    }
  ];

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
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Properties</h1>
          <Button className="bg-gradient-button hover:bg-gradient-button/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Property Listings */}
        <div className="space-y-4 mb-8">
          {listings.map((listing) => (
            <Card key={listing.id} className="bg-card border-border shadow-card">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">{listing.title}</h3>
                    <p className="text-muted-foreground text-sm">{listing.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{listing.price}</p>
                    <p className={`text-sm px-2 py-1 rounded-full inline-block ${
                      listing.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {listing.status}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {listing.views} views
                    </span>
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {listing.likes} likes
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-center space-x-4">
          <Button variant="outline" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Messages</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Analytics</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
