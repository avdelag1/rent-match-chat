/**
 * Example Dashboard Component
 * Shows how to use InfiniteCardFeed in a real application
 * This is a reference implementation - copy and customize for your needs
 */

import { useState } from 'react';
import { InfiniteCardFeed } from './InfiniteCardFeed';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Filter, MessageCircle, X } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Listing = Database['public']['Tables']['listings']['Row'];

interface ClientProfile {
  user_id: string;
  full_name: string;
  age: number | null;
  bio: string | null;
}

/**
 * Example: Client Dashboard (Browse Properties)
 */
export function ExampleClientDashboard() {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    minPrice: 0,
    maxPrice: 50000,
    beds: 0,
    petFriendly: undefined as boolean | undefined,
    furnished: undefined as boolean | undefined
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-4">
      {/* Header */}
      <div className="container mx-auto mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Discover Properties</h1>
          <Button
            variant="outline"
            onClick={() => setShowFilters(true)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Active Filters Display */}
        {(filters.city || filters.minPrice > 0 || filters.beds > 0) && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {filters.city && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {filters.city}
              </span>
            )}
            {filters.minPrice > 0 && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                ${filters.minPrice}+
              </span>
            )}
            {filters.beds > 0 && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {filters.beds}+ beds
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Feed */}
      <div className="container mx-auto max-w-md">
        <InfiniteCardFeed
          mode="client"
          onCardTap={(listing) => setSelectedListing(listing as Listing)}
          onMessage={(listing) => {
            // Navigate to messages or open chat
            console.log('Start conversation about:', (listing as Listing).title);
          }}
          filters={filters}
        />
      </div>

      {/* Filters Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Properties</DialogTitle>
            <DialogDescription>
              Customize your search to find the perfect property
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* City */}
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., Mexico City"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
            </div>

            {/* Price Range */}
            <div>
              <Label>Price Range: ${filters.minPrice} - ${filters.maxPrice}</Label>
              <div className="flex gap-4 mt-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: Number(e.target.value) })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <Label>Minimum Bedrooms: {filters.beds}</Label>
              <Slider
                value={[filters.beds]}
                onValueChange={([value]) => setFilters({ ...filters, beds: value })}
                max={5}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Pet Friendly */}
            <div className="flex items-center justify-between">
              <Label htmlFor="petFriendly">Pet Friendly</Label>
              <Switch
                id="petFriendly"
                checked={filters.petFriendly || false}
                onCheckedChange={(checked) =>
                  setFilters({ ...filters, petFriendly: checked })
                }
              />
            </div>

            {/* Furnished */}
            <div className="flex items-center justify-between">
              <Label htmlFor="furnished">Furnished</Label>
              <Switch
                id="furnished"
                checked={filters.furnished || false}
                onCheckedChange={(checked) =>
                  setFilters({ ...filters, furnished: checked })
                }
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setFilters({
                  city: '',
                  minPrice: 0,
                  maxPrice: 50000,
                  beds: 0,
                  petFriendly: undefined,
                  furnished: undefined
                });
              }}
            >
              Clear All
            </Button>
            <Button className="flex-1" onClick={() => setShowFilters(false)}>
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Listing Detail Dialog */}
      <Dialog
        open={!!selectedListing}
        onOpenChange={(open) => !open && setSelectedListing(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedListing.title}</DialogTitle>
                <DialogDescription>
                  {selectedListing.city} • ${selectedListing.price?.toLocaleString()}/month
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Images */}
                {selectedListing.images && selectedListing.images.length > 0 && (
                  <img
                    src={selectedListing.images[0]}
                    alt={selectedListing.title || ''}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedListing.description}</p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedListing.beds && (
                    <div>
                      <span className="text-sm text-muted-foreground">Bedrooms</span>
                      <p className="font-semibold">{selectedListing.beds}</p>
                    </div>
                  )}
                  {selectedListing.baths && (
                    <div>
                      <span className="text-sm text-muted-foreground">Bathrooms</span>
                      <p className="font-semibold">{selectedListing.baths}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contact Owner
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Save Listing
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Example: Owner Dashboard (Browse Potential Tenants)
 */
export function ExampleOwnerDashboard() {
  const [selectedProfile, setSelectedProfile] = useState<ClientProfile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 65,
    smokingHabit: undefined as string | undefined
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-4">
      {/* Header */}
      <div className="container mx-auto mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Find Perfect Tenants</h1>
          <Button
            variant="outline"
            onClick={() => setShowFilters(true)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Card Feed */}
      <div className="container mx-auto max-w-md">
        <InfiniteCardFeed
          mode="owner"
          onCardTap={(profile) => setSelectedProfile(profile as ClientProfile)}
          onMessage={(profile) => {
            console.log('Start conversation with:', (profile as ClientProfile).full_name);
          }}
          filters={filters}
        />
      </div>

      {/* Filters Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Profiles</DialogTitle>
            <DialogDescription>
              Find the ideal tenant for your property
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Age Range */}
            <div>
              <Label>Age Range: {filters.minAge} - {filters.maxAge}</Label>
              <div className="flex gap-4 mt-2">
                <Input
                  type="number"
                  value={filters.minAge}
                  onChange={(e) =>
                    setFilters({ ...filters, minAge: Number(e.target.value) })
                  }
                />
                <Input
                  type="number"
                  value={filters.maxAge}
                  onChange={(e) =>
                    setFilters({ ...filters, maxAge: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          <Button onClick={() => setShowFilters(false)}>Apply Filters</Button>
        </DialogContent>
      </Dialog>

      {/* Profile Detail Dialog */}
      <Dialog
        open={!!selectedProfile}
        onOpenChange={(open) => !open && setSelectedProfile(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedProfile && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProfile.full_name}</DialogTitle>
                <DialogDescription>Age: {selectedProfile.age}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <p>{selectedProfile.bio}</p>

                <Button className="w-full gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
