import { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useOwnerListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Home, Plus, Edit, Trash2, Eye, MapPin, Calendar, DollarSign, ShieldCheck, CheckCircle } from 'lucide-react';
import { ListingPreviewDialog } from '@/components/ListingPreviewDialog';
import { UnifiedListingForm } from '@/components/UnifiedListingForm';
import { CategorySelectionDialog } from '@/components/CategorySelectionDialog';
import { OwnerListingsStats } from '@/components/OwnerListingsStats';


interface PropertyManagementProps {
  initialCategory?: string | null;
  initialMode?: string | null;
}

export const PropertyManagement = memo(({ initialCategory, initialMode }: PropertyManagementProps) => {
  const { user } = useAuth();
  const { data: listings = [], isLoading, error } = useOwnerListings();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(initialCategory || 'all');
  const [viewingProperty, setViewingProperty] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const queryClient = useQueryClient();

  // Auto-open form when category is provided via URL params
  useEffect(() => {
    if (initialCategory && initialMode) {
      console.log('Auto-opening form for category:', initialCategory, 'mode:', initialMode);
      setEditingProperty({ category: initialCategory, mode: initialMode });
      setIsFormOpen(true);
      setActiveTab(initialCategory);
    }
  }, [initialCategory, initialMode]);

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    let matchesCategory = true;
    if (activeTab === 'property') matchesCategory = !listing.category || listing.category === 'property';
    else if (activeTab === 'yacht') matchesCategory = listing.category === 'yacht';
    else if (activeTab === 'motorcycle') matchesCategory = listing.category === 'motorcycle';
    else if (activeTab === 'bicycle') matchesCategory = listing.category === 'bicycle';
    else if (activeTab === 'active') matchesCategory = listing.status === 'active';
    else if (activeTab === 'rented') matchesCategory = listing.status === 'rented';
    else if (activeTab === 'maintenance') matchesCategory = listing.status === 'maintenance';
    
    return matchesSearch && matchesCategory;
  });

  console.log('PropertyManagement - Current user:', user?.id);
  console.log('PropertyManagement - Owner listings:', listings.length);
  console.log('PropertyManagement - Filtered listings:', filteredListings.length);

  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowCategoryDialog(true);
    // Open form directly
    setIsFormOpen(true);
  };

  const handleCategorySelect = (category: 'property' | 'yacht' | 'motorcycle' | 'bicycle', mode: 'rent' | 'sale' | 'both') => {
    setEditingProperty({ category, mode });
    setShowCategoryDialog(false);
    // Form is already open from handleAddProperty
  };

  const handleEditProperty = (listing: any) => {
    console.log('Edit property:', listing.id);
    setEditingProperty(listing);
    setIsFormOpen(true);
  };

  const handleViewProperty = (listing: any) => {
    console.log('View property:', listing.id);
    setViewingProperty(listing);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setViewingProperty(null);
  };

  const handleEditFromPreview = () => {
    if (viewingProperty) {
      setEditingProperty(viewingProperty);
      setShowPreview(false);
      setIsFormOpen(true);
    }
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

  const handleToggleAvailability = async (listing: any, newStatus: string) => {
    try {
      // Optimistically update the UI
      queryClient.setQueryData(['listings'], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.map(item =>
          item.id === listing.id
            ? { ...item, availability_status: newStatus, status: newStatus === 'available' ? 'active' : newStatus }
            : item
        );
      });

      // Show immediate feedback
      const statusLabels: Record<string, string> = {
        available: 'Available',
        rented: 'Rented Out',
        sold: 'Sold',
        pending: 'Pending'
      };

      toast({
        title: 'Updating Availability...',
        description: `Marking ${listing.title} as ${statusLabels[newStatus] || newStatus}.`,
      });

      // Update in database using RPC function
      const { error } = await supabase.rpc('toggle_listing_availability', {
        p_listing_id: listing.id,
        p_new_availability: newStatus
      });

      if (error) throw error;

      // Show success message
      toast({
        title: 'Availability Updated',
        description: `${listing.title} is now marked as ${statusLabels[newStatus] || newStatus}.`,
      });

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['listings'] });

    } catch (error: any) {
      console.error('Error updating availability:', error);

      // Revert the optimistic update if update failed
      queryClient.invalidateQueries({ queryKey: ['listings'] });

      toast({
        title: 'Error',
        description: 'Failed to update availability. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      available: 'bg-green-100 text-green-800',
      rented: 'bg-blue-100 text-blue-800',
      sold: 'bg-purple-100 text-purple-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
      inactive: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.pending}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
      </Badge>
    );
  };

  const getAvailabilityBadge = (availabilityStatus: string) => {
    const availabilityColors = {
      available: 'bg-green-100 text-green-800 border-green-300',
      rented: 'bg-blue-100 text-blue-800 border-blue-300',
      sold: 'bg-purple-100 text-purple-800 border-purple-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };

    const availabilityIcons = {
      available: '✓',
      rented: '🏠',
      sold: '💰',
      pending: '⏳',
    };

    return (
      <Badge variant="outline" className={availabilityColors[availabilityStatus as keyof typeof availabilityColors] || availabilityColors.available}>
        {availabilityIcons[availabilityStatus as keyof typeof availabilityIcons] || ''}{' '}
        {availabilityStatus?.charAt(0).toUpperCase() + availabilityStatus?.slice(1) || 'Available'}
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
            className="gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg w-full sm:w-auto"
            onClick={handleAddProperty}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">Add Listing</span>
          </Button>
        </div>

        {/* Statistics Dashboard */}
        <OwnerListingsStats listings={listings} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 bg-white/10 backdrop-blur-sm h-auto">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs sm:text-sm p-2 sm:p-3"
            >
              <span className="hidden sm:inline">All</span>
              <span className="sm:hidden">All</span>
              <span className="ml-1">({listings.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="property" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs sm:text-sm p-2 sm:p-3"
            >
              <span className="hidden sm:inline">Properties</span>
              <span className="sm:hidden">Prop</span>
              <span className="ml-1">({listings.filter(l => !l.category || l.category === 'property').length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="yacht" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs sm:text-sm p-2 sm:p-3"
            >
              <span className="hidden sm:inline">Yachts</span>
              <span className="sm:hidden">Yac</span>
              <span className="ml-1">({listings.filter(l => l.category === 'yacht').length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="motorcycle" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs sm:text-sm p-2 sm:p-3"
            >
              <span className="hidden sm:inline">Motorcycles</span>
              <span className="sm:hidden">Moto</span>
              <span className="ml-1">({listings.filter(l => l.category === 'motorcycle').length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bicycle" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-xs sm:text-sm p-2 sm:p-3"
            >
              <span className="hidden sm:inline">Bicycles</span>
              <span className="sm:hidden">Bike</span>
              <span className="ml-1">({listings.filter(l => l.category === 'bicycle').length})</span>
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
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg text-gray-900 truncate">
                              {listing.title}
                            </CardTitle>
                            {(listing as any).has_verified_documents && (
                              (listing as any).category === 'bicycle' ? (
                                <div title="Verified documents">
                                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                </div>
                              ) : (
                                <div title="Verified documents">
                                  <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                </div>
                              )
                            )}
                          </div>
                          <div className="flex-shrink-0 flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {listing.category === 'yacht' ? '⛵ Yacht' :
                               listing.category === 'motorcycle' ? '🏍️ Moto' :
                               listing.category === 'bicycle' ? '🚴 Bike' :
                               '🏠 Property'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {listing.mode === 'both' ? '💰🏠 Both' :
                               listing.mode === 'sale' ? '💰 Sale' :
                               '🏠 Rent'}
                            </Badge>
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
                            ${listing.price?.toLocaleString() || 'N/A'}
                            {listing.mode === 'rent' ? '/month' : ''}
                          </span>
                        </div>

                        {/* Availability Status Toggle */}
                        <div className="pt-2 pb-2 border-t border-gray-100">
                          <div className="flex flex-col gap-2">
                            <Label className="text-xs text-gray-600 font-medium">Availability Status</Label>
                            <Select
                              value={listing.status || 'available'}
                              onValueChange={(value) => handleToggleAvailability(listing, value)}
                            >
                              <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">✓ Available</SelectItem>
                                <SelectItem value="rented">🏠 Rented Out</SelectItem>
                                <SelectItem value="sold">💰 Sold</SelectItem>
                                <SelectItem value="pending">⏳ Pending</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-1">
                              {getAvailabilityBadge(listing.status || 'available')}
                            </div>
                          </div>
                        </div>

                        {/* Category-specific details */}
                        {listing.category === 'property' && listing.beds && listing.baths && (
                          <div className="text-sm text-gray-600">
                            {listing.beds} bed{listing.beds !== 1 ? 's' : ''} • {listing.baths} bath{listing.baths !== 1 ? 's' : ''}
                            {listing.square_footage && ` • ${listing.square_footage} sq ft`}
                          </div>
                        )}
                        
                        {listing.category === 'yacht' && (
                          <div className="text-sm text-gray-600">
                            {listing.length_m && `${listing.length_m}m`}
                            {listing.berths && ` • ${listing.berths} berths`}
                            {listing.max_passengers && ` • ${listing.max_passengers} passengers`}
                          </div>
                        )}
                        
                        {listing.category === 'motorcycle' && (
                          <div className="text-sm text-gray-600">
                            {listing.brand} {listing.model}
                            {listing.engine_cc && ` • ${listing.engine_cc}cc`}
                            {listing.year && ` • ${listing.year}`}
                          </div>
                        )}
                        
                        {listing.category === 'bicycle' && (
                          <div className="text-sm text-gray-600">
                            {listing.brand} {listing.model}
                            {listing.electric_assist && ' • ⚡ Electric'}
                            {listing.frame_size && ` • ${listing.frame_size}`}
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


        {/* Listing Preview */}
        <ListingPreviewDialog
          isOpen={showPreview}
          onClose={handleClosePreview}
          property={viewingProperty}
          onEdit={handleEditFromPreview}
          showEditButton={true}
        />

        {/* Category Selection Dialog */}
        <CategorySelectionDialog
          open={showCategoryDialog}
          onOpenChange={setShowCategoryDialog}
          onCategorySelect={handleCategorySelect}
        />

        {/* Unified Listing Form */}
        <UnifiedListingForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProperty(null);
          }}
          editingProperty={editingProperty}
        />
      </div>
    </div>
  );
});