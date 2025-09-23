import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { Home, Plus, Edit, Trash2, Eye, MapPin, Calendar, DollarSign } from 'lucide-react';

export function PropertyManagement() {
  const { user } = useAuth();
  const { data: allListings = [], isLoading, error } = useListings();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter listings to show only those owned by current user
  const listings = allListings.filter(listing => listing.owner_id === user?.id);

  const filteredListings = listings.filter(listing =>
    listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('PropertyManagement - Current user:', user?.id);
  console.log('PropertyManagement - All listings:', allListings.length);
  console.log('PropertyManagement - Owner listings:', listings.length);
  console.log('PropertyManagement - Filtered listings:', filteredListings.length);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Loading Properties...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Error Loading Properties</h1>
          <p className="text-white/80">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Property Management</h1>
          <p className="text-muted-foreground">Manage all your rental properties</p>
        </div>
        <Button 
          className="gap-2"
          onClick={() => {
            // Set hash so DashboardLayout opens the PropertyForm
            if (location.hash !== '#add-property') {
              location.hash = '#add-property';
            }
          }}
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Properties</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="rented">Rented</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Properties</Label>
              <Input
                id="search"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{listing.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {listing.description}
                          </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">${listing.price}/month</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Available Now
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <Card className="p-8 text-center">
              <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No properties match your search criteria.' : 'You haven\'t added any properties yet.'}
              </p>
              <Button 
                onClick={() => {
                  // Set hash so DashboardLayout opens the PropertyForm
                  if (location.hash !== '#add-property') {
                    location.hash = '#add-property';
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Active properties will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rented">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Rented properties will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Properties under maintenance will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}