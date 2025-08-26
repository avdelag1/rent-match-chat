
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Plus, Edit, Trash2, Eye, MessageCircle, BarChart } from 'lucide-react';
import { PropertyForm } from '@/components/PropertyForm';
import { SubscriptionPackages } from '@/components/SubscriptionPackages';
import { useUserSubscription } from '@/hooks/useSubscription';

const OwnerDashboard = () => {
  const { user, signOut } = useAuth();
  const { data: subscription } = useUserSubscription();
  
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showSubscriptionPackages, setShowSubscriptionPackages] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  // Fetch owner's listings
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['owner-listings'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setShowPropertyForm(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', propertyId);

      if (!error) {
        // Refresh listings
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Tinderent</h1>
              <Badge variant="secondary" className="bg-white/20 text-white">
                Owner
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {subscription ? (
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  {subscription.subscription_packages?.name}
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubscriptionPackages(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Upgrade
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total Listings</p>
                  <p className="text-2xl font-bold text-white">{listings.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Eye className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Active Listings</p>
                  <p className="text-2xl font-bold text-white">
                    {listings.filter(l => l.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <BarChart className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Messages</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">Total Views</p>
                  <p className="text-2xl font-bold text-white">
                    {listings.reduce((sum, l) => sum + (l.views || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-full">
                  <Eye className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Section */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Your Properties</CardTitle>
              <Button
                onClick={() => setShowPropertyForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-white/80 py-8">Loading properties...</div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-bold text-white mb-2">No Properties Listed Yet</h3>
                <p className="text-white/80 mb-6">Start by adding your first property to attract potential tenants.</p>
                <Button
                  onClick={() => setShowPropertyForm(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  List Your First Property
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((property: any) => (
                  <Card key={property.id} className="bg-white/5 border-white/10">
                    <div className="relative">
                      <img
                        src={property.images?.[0] || '/placeholder.svg'}
                        alt={property.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge
                        className={`absolute top-2 right-2 ${
                          property.status === 'active'
                            ? 'bg-green-500'
                            : property.status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      >
                        {property.status}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-bold text-white mb-2">{property.title}</h3>
                      <p className="text-white/80 text-sm mb-2">
                        {property.neighborhood}, {property.city}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xl font-bold text-white">
                          ${property.price?.toLocaleString()}/mo
                        </span>
                        <div className="text-sm text-white/80">
                          {property.views || 0} views
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProperty(property)}
                          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProperty(property.id)}
                          className="flex-1 bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Property Form Modal */}
      <PropertyForm
        isOpen={showPropertyForm}
        onClose={() => {
          setShowPropertyForm(false);
          setEditingProperty(null);
        }}
        editingProperty={editingProperty}
      />

      {/* Subscription Packages Modal */}
      <SubscriptionPackages
        isOpen={showSubscriptionPackages}
        onClose={() => setShowSubscriptionPackages(false)}
        reason="Unlock premium features for property owners!"
      />
    </div>
  );
};

export default OwnerDashboard;
