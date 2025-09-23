import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Home, Plus, Edit, Trash2, Eye, MapPin, Calendar, DollarSign } from 'lucide-react';

export function PropertyManagement() {
  const { user } = useAuth();
  const { data: allListings = [], isLoading, error } = useListings();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [viewingProperty, setViewingProperty] = useState<any>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const queryClient = useQueryClient();

  // Filter listings to show only those owned by current user
  const listings = allListings.filter(listing => listing.owner_id === user?.id);

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && listing.status === 'active';
    if (activeTab === 'rented') return matchesSearch && listing.status === 'rented';
    if (activeTab === 'maintenance') return matchesSearch && listing.status === 'maintenance';
    
    return matchesSearch;
  });

  console.log('PropertyManagement - Current user:', user?.id);
  console.log('PropertyManagement - All listings:', allListings.length);
  console.log('PropertyManagement - Owner listings:', listings.length);
  console.log('PropertyManagement - Filtered listings:', filteredListings.length);

  const handleAddProperty = () => {
    // Set hash so DashboardLayout opens the PropertyForm
    if (location.hash !== '#add-property') {
      location.hash = '#add-property';
    }
  };

  const handleEditProperty = (listing: any) => {
    console.log('Edit property:', listing.id);
    setEditingProperty(listing);
    setShowPropertyForm(true);
    // Set hash so DashboardLayout opens the PropertyForm with editing data
    if (location.hash !== '#add-property') {
      location.hash = '#add-property';
    }
  };

  const handleViewProperty = (listing: any) => {
    console.log('View property:', listing.id);
    setViewingProperty(listing);
    setShowPropertyDetails(true);
  };

  const handleDeleteProperty = async (listing: any) => {
    try {
      // Optimistically update the UI by removing the property immediately
      queryClient.setQueryData(['listings'], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.filter(item => item.id !== listing.id);
      });

      // Show immediate feedback
      toast({
        title: 'Deleting Property...',
        description: `Removing ${listing.title} from your listings.`,
      });

      // Delete from database
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listing.id);

      if (error) throw error;

      // Show success message
      toast({
        title: 'Property Deleted',
        description: `${listing.title} has been deleted successfully.`,
      });

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      
    } catch (error: any) {
      console.error('Error deleting property:', error);
      
      // Revert the optimistic update if deletion failed
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      
      toast({
        title: 'Error',
        description: 'Failed to delete property. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      rented: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.pending}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen overflow-y-auto overflow-x-hidden bg-gray-900 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Loading Properties...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen overflow-y-auto overflow-x-hidden bg-gray-900 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Error Loading Properties</h1>
          <p className="text-white/80">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto overflow-x-hidden bg-gray-900">
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20 w-full sm:w-auto">
            <h1 className="text-xl sm:text-3xl font-bold text-white drop-shadow-lg">Property Management</h1>
            <p className="text-sm sm:text-base text-white/90 drop-shadow-sm">Manage all your rental properties</p>
          </div>
          <Button 
            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg w-full sm:w-auto"
            onClick={handleAddProperty}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">Add Property</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm h-auto">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs sm:text-sm p-2 sm:p-3"
            >
              <span className="hidden sm:inline">All Properties</span>
              <span className="sm:hidden">All</span>
              <span className="ml-1">({listings.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs sm:text-sm p-2 sm:p-3"
            >
              <span className="hidden sm:inline">Active</span>
              <span className="sm:hidden">Act</span>
              <span className="ml-1">({listings.filter(l => l.status === 'active').length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="rented" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs sm:text-sm p-2 sm:p-3"
            >
              <span className="hidden sm:inline">Rented</span>
              <span className="sm:hidden">Rent</span>
              <span className="ml-1">({listings.filter(l => l.status === 'rented').length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="maintenance" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs sm:text-sm p-2 sm:p-3"
            >
              <span className="hidden sm:inline">Maintenance</span>
              <span className="sm:hidden">Main</span>
              <span className="ml-1">({listings.filter(l => l.status === 'maintenance').length})</span>
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-white font-medium drop-shadow-sm">Search Properties</Label>
                <Input
                  id="search"
                  placeholder="Search by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
            </div>

            <TabsContent value={activeTab} className="space-y-4 w-full">
              {filteredListings.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
                  {filteredListings.map((listing) => (
                    <Card key={listing.id} className="hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm w-full">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-base sm:text-lg text-gray-900 truncate flex-1 min-w-0">
                            {listing.title}
                          </CardTitle>
                          <div className="flex-shrink-0">
                            {getStatusBadge(listing.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{listing.address || listing.description}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="font-semibold text-gray-900">
                            ${listing.price?.toLocaleString() || 'N/A'}/month
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>Available Now</span>
                        </div>

                        {listing.beds && listing.baths && (
                          <div className="text-sm text-gray-600">
                            {listing.beds} bed{listing.beds !== 1 ? 's' : ''} • {listing.baths} bath{listing.baths !== 1 ? 's' : ''}
                            {listing.square_footage && ` • ${listing.square_footage} sq ft`}
                          </div>
                        )}

                        {/* Responsive Action Buttons that fit on screen */}
                        <div className="pt-3 border-t border-gray-200">
                          <div className="grid grid-cols-3 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 font-medium text-xs sm:text-sm p-2"
                              onClick={() => handleViewProperty(listing)}
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 font-medium text-xs sm:text-sm p-2"
                              onClick={() => handleEditProperty(listing)}
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 font-medium text-xs sm:text-sm p-2"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Del</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteProperty(listing)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center bg-white/20 backdrop-blur-sm border-white/30">
                  <Home className="w-12 h-12 mx-auto text-white/80 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white drop-shadow-sm">
                    {searchTerm ? 'No Properties Found' : 'No Properties Yet'}
                  </h3>
                  <p className="text-white/90 mb-4 drop-shadow-sm">
                {searchTerm 
                  ? 'No properties match your search criteria.' 
                  : activeTab === 'all' 
                    ? "You haven't added any properties yet."
                    : `No properties in the ${activeTab} category.`
                }
              </p>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}