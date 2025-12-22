import { useState, useEffect, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useOwnerListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Home, Plus, Edit, Trash2, Eye, MapPin, DollarSign, ShieldCheck, CheckCircle, Search, Anchor, Bike, CircleDot, Car, LayoutGrid, Sparkles, ImageIcon, Share2 } from 'lucide-react';
import { ListingPreviewDialog } from '@/components/ListingPreviewDialog';
import { UnifiedListingForm } from '@/components/UnifiedListingForm';
import { CategorySelectionDialog } from '@/components/CategorySelectionDialog';
import { OwnerListingsStats } from '@/components/OwnerListingsStats';
import { ShareDialog } from '@/components/ShareDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';


interface PropertyManagementProps {
  initialCategory?: string | null;
  initialMode?: string | null;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'yacht': return <Anchor className="w-3.5 h-3.5" />;
    case 'motorcycle': return <CircleDot className="w-3.5 h-3.5" />;
    case 'bicycle': return <Bike className="w-3.5 h-3.5" />;
    case 'vehicle': return <Car className="w-3.5 h-3.5" />;
    default: return <Home className="w-3.5 h-3.5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'yacht': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'motorcycle': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'bicycle': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'vehicle': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
};

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
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [sharingListing, setSharingListing] = useState<any>(null);
  const queryClient = useQueryClient();

  // Auto-open form when category is provided via URL params
  useEffect(() => {
    if (initialCategory && initialMode) {
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
    setEditingProperty(listing);
    setIsFormOpen(true);
  };

  const handleViewProperty = (listing: any) => {
    setViewingProperty(listing);
    setShowPreview(true);
  };

  const handleShareListing = (listing: any) => {
    setSharingListing(listing);
    setShowShareDialog(true);
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
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Active' },
      available: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Available' },
      rented: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Rented' },
      sold: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Sold' },
      maintenance: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Maintenance' },
      pending: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Pending' },
      inactive: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Inactive' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge className={cn("text-[10px] sm:text-xs font-medium border-0", config.bg, config.text)}>
        {config.label}
      </Badge>
    );
  };

  const tabItems = [
    { id: 'all', label: 'All', icon: LayoutGrid, count: listings.length },
    { id: 'property', label: 'Properties', icon: Home, count: listings.filter(l => !l.category || l.category === 'property').length },
    { id: 'yacht', label: 'Yachts', icon: Anchor, count: listings.filter(l => l.category === 'yacht').length },
    { id: 'motorcycle', label: 'Motorcycles', icon: CircleDot, count: listings.filter(l => l.category === 'motorcycle').length },
    { id: 'bicycle', label: 'Bicycles', icon: Bike, count: listings.filter(l => l.category === 'bicycle').length },
    { id: 'active', label: 'Active', icon: CheckCircle, count: listings.filter(l => l.status === 'active').length },
    { id: 'rented', label: 'Rented', icon: Home, count: listings.filter(l => l.status === 'rented').length },
  ];

  if (isLoading) {
    return (
      <div className="min-h-full overflow-y-auto overflow-x-hidden bg-gray-900 p-4 sm:p-6 pb-24 sm:pb-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-white/80 text-xs sm:text-sm">Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full overflow-y-auto overflow-x-hidden bg-gray-900 p-4 sm:p-6 pb-24 sm:pb-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="p-3 sm:p-4 rounded-full bg-red-500/20">
            <Home className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white">Error Loading Listings</h1>
          <p className="text-white/60 text-xs sm:text-sm text-center max-w-md px-4">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full overflow-y-auto overflow-x-hidden bg-gray-900">
      <div className="p-3 sm:p-6 pb-24 sm:pb-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">My Listings</h1>
              <p className="text-xs sm:text-sm text-white/60">Manage and track all your rental properties</p>
            </div>
          </div>
          <Button
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg shadow-primary/25 w-full sm:w-auto"
            onClick={handleAddProperty}
          >
            <Plus className="w-4 h-4" />
            <span>Add Listing</span>
          </Button>
        </motion.div>

        {/* Statistics Dashboard */}
        <OwnerListingsStats listings={listings} />

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by title, location, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
          />
        </motion.div>

        {/* Tabs - Horizontally scrollable on mobile */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
              <TabsList className="w-max sm:w-full h-auto p-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl flex gap-1 min-w-full sm:flex-wrap">
                {tabItems.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition-all whitespace-nowrap flex-shrink-0 sm:flex-1 sm:min-w-0",
                      "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg",
                      "data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-gray-700/50"
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span className="truncate">{tab.label}</span>
                    <span className="text-[10px] sm:text-xs opacity-70">({tab.count})</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {/* Fade indicators for scroll hint on mobile */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none sm:hidden" />
          </div>

          <TabsContent value={activeTab} className="mt-4 sm:mt-6">
            <AnimatePresence mode="wait">
              {filteredListings.length > 0 ? (
                <motion.div
                  key="listings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {filteredListings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="group overflow-hidden bg-gray-800/50 border-gray-700/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                        {/* Image Section */}
                        <div className="relative aspect-[16/10] bg-gray-700/50 overflow-hidden">
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700/50 to-gray-800/50">
                              <ImageIcon className="w-10 h-10 text-gray-600" />
                            </div>
                          )}

                          {/* Overlay badges */}
                          <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                            <Badge className={cn(
                              "text-[10px] sm:text-xs font-medium border flex items-center gap-1",
                              getCategoryColor(listing.category || 'property')
                            )}>
                              {getCategoryIcon(listing.category || 'property')}
                              <span className="hidden sm:inline">
                                {listing.category === 'yacht' ? 'Yacht' :
                                 listing.category === 'motorcycle' ? 'Moto' :
                                 listing.category === 'bicycle' ? 'Bike' :
                                 listing.category === 'vehicle' ? 'Vehicle' :
                                 'Property'}
                              </span>
                            </Badge>
                            <div className="flex items-center gap-1.5">
                              {(listing as any).has_verified_documents && (
                                <div className="p-1 rounded-full bg-blue-500/20 backdrop-blur-sm" title="Verified">
                                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                                </div>
                              )}
                              {getStatusBadge(listing.status)}
                            </div>
                          </div>

                          {/* Price badge */}
                          <div className="absolute bottom-2 left-2">
                            <div className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm">
                              <span className="text-sm sm:text-base font-bold text-white">
                                ${listing.price?.toLocaleString() || 'N/A'}
                              </span>
                              {listing.mode === 'rent' && (
                                <span className="text-[10px] sm:text-xs text-gray-300">/mo</span>
                              )}
                            </div>
                          </div>

                          {/* Mode badge */}
                          <div className="absolute bottom-2 right-2">
                            <Badge className={cn(
                              "text-[10px] sm:text-xs font-medium border-0",
                              listing.mode === 'both' ? 'bg-amber-500/80' :
                              listing.mode === 'sale' ? 'bg-purple-500/80' :
                              'bg-blue-500/80',
                              'text-white'
                            )}>
                              {listing.mode === 'both' ? 'Rent/Sale' :
                               listing.mode === 'sale' ? 'For Sale' :
                               'For Rent'}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-3 sm:p-4 space-y-3">
                          {/* Title */}
                          <div>
                            <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
                              {listing.title}
                            </h3>
                            {(listing.address || listing.city) && (
                              <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="text-xs truncate">
                                  {listing.address || listing.city || listing.neighborhood}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Category-specific details */}
                          <div className="text-xs text-gray-400">
                            {(!listing.category || listing.category === 'property') && listing.beds && listing.baths && (
                              <span>
                                {listing.beds} bed{listing.beds !== 1 ? 's' : ''} • {listing.baths} bath{listing.baths !== 1 ? 's' : ''}
                                {listing.square_footage && ` • ${listing.square_footage} sq ft`}
                              </span>
                            )}
                            {listing.category === 'yacht' && (
                              <span>
                                {listing.length_m && `${listing.length_m}m`}
                                {listing.berths && ` • ${listing.berths} berths`}
                                {listing.max_passengers && ` • ${listing.max_passengers} guests`}
                              </span>
                            )}
                            {listing.category === 'motorcycle' && (
                              <span>
                                {listing.brand} {listing.model}
                                {listing.engine_cc && ` • ${listing.engine_cc}cc`}
                                {listing.year && ` • ${listing.year}`}
                              </span>
                            )}
                            {listing.category === 'bicycle' && (
                              <span>
                                {listing.brand} {listing.model}
                                {listing.electric_assist && ' • Electric'}
                                {listing.frame_size && ` • ${listing.frame_size}`}
                              </span>
                            )}
                          </div>

                          {/* Availability Status */}
                          <div className="pt-2 border-t border-gray-700/50">
                            <Select
                              value={listing.status || 'available'}
                              onValueChange={(value) => handleToggleAvailability(listing, value)}
                            >
                              <SelectTrigger className="w-full h-8 text-xs bg-gray-700/50 border-gray-600/50 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="rented">Rented Out</SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-4 gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs h-8"
                              onClick={() => handleViewProperty(listing)}
                            >
                              <Eye className="w-3.5 h-3.5 sm:mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs h-8"
                              onClick={() => handleShareListing(listing)}
                            >
                              <Share2 className="w-3.5 h-3.5 sm:mr-1" />
                              <span className="hidden sm:inline">Share</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs h-8"
                              onClick={() => handleEditProperty(listing)}
                            >
                              <Edit className="w-3.5 h-3.5 sm:mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 text-xs h-8"
                                >
                                  <Trash2 className="w-3.5 h-3.5 sm:mr-1" />
                                  <span className="hidden sm:inline">Del</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-gray-800 border-gray-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Delete Listing</AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-400">
                                    Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProperty(listing)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="bg-gray-800/30 border-gray-700/30 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                      <div className="p-4 rounded-2xl bg-gray-700/30 mb-4">
                        {searchTerm ? (
                          <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
                        ) : (
                          <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2 text-center">
                        {searchTerm ? 'No Results Found' : 'No Listings Yet'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400 mb-6 text-center max-w-md">
                        {searchTerm
                          ? 'Try adjusting your search terms or filters.'
                          : activeTab === 'all'
                            ? "Start building your portfolio by adding your first listing."
                            : `No listings in the ${activeTab} category yet.`
                        }
                      </p>
                      {!searchTerm && (
                        <Button
                          className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          onClick={handleAddProperty}
                        >
                          <Plus className="w-4 h-4" />
                          Add Your First Listing
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
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

        {/* Share Listing Dialog */}
        <ShareDialog
          open={showShareDialog}
          onOpenChange={(open) => {
            setShowShareDialog(open);
            if (!open) setSharingListing(null);
          }}
          listingId={sharingListing?.id}
          title={sharingListing?.title || 'Listing'}
          description={`Check out this ${sharingListing?.category || 'property'} on Swipes: ${sharingListing?.title}${sharingListing?.price ? ` - $${sharingListing.price.toLocaleString()}` : ''}`}
        />
      </div>
    </div>
  );
});
