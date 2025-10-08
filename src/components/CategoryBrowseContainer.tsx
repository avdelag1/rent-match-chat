import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { CategorySelector, Category, Mode } from './CategorySelector';
import { CategoryFilters } from './CategoryFilters';
import { TinderentSwipeContainer } from './TinderentSwipeContainer';
import { useCategoryListings } from '@/hooks/useCategoryListings';
import { useSwipedListings } from '@/hooks/useListings';

interface CategoryBrowseContainerProps {
  onListingTap: (listingId: string) => void;
  onInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

export function CategoryBrowseContainer({ 
  onListingTap, 
  onInsights, 
  onMessageClick 
}: CategoryBrowseContainerProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('property');
  const [selectedMode, setSelectedMode] = useState<Mode>('rent');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: swipedIds = [] } = useSwipedListings();
  const { data: listings = [], isLoading } = useCategoryListings(
    selectedCategory,
    selectedMode,
    filters,
    swipedIds
  );

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setFilters({}); // Reset filters when changing category
  };

  const handleModeChange = (mode: Mode) => {
    setSelectedMode(mode);
    setFilters({}); // Reset filters when changing mode
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Category & Mode Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CategorySelector
              selectedCategory={selectedCategory}
              selectedMode={selectedMode}
              onCategoryChange={handleCategoryChange}
              onModeChange={handleModeChange}
            />
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Filter className="w-4 h-4" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {Object.keys(filters).length}
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Filter Chips */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2 px-2">
          {Object.entries(filters).map(([key, value]: [string, any]) => (
            <span key={key} className="text-xs bg-muted px-3 py-1 rounded-full">
              {key}: {Array.isArray(value) ? value.join(', ') : value.toString()}
            </span>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({})}
            className="text-xs h-6"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Swipe Container */}
      {selectedCategory === 'property' ? (
        <TinderentSwipeContainer
          onListingTap={onListingTap}
          onInsights={onInsights}
          onMessageClick={onMessageClick}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold mb-2">
                Browse {selectedCategory === 'yacht' ? 'Yachts' : selectedCategory === 'motorcycle' ? 'Motorcycles' : 'Bicycles'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {isLoading ? 'Loading...' : `Found ${listings.length} listings`}
              </p>
              {!isLoading && listings.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No listings found. Try adjusting your filters.
                </p>
              )}
              {listings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {listings.map((listing: any) => (
                    <Card key={listing.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        {listing.images?.[0] && (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                        )}
                        <h4 className="font-semibold mb-1">{listing.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {listing.brand} {listing.model}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">
                            ${listing.price?.toLocaleString()}
                          </span>
                          {listing.year && (
                            <span className="text-xs text-muted-foreground">{listing.year}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filters Dialog */}
      <CategoryFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        category={selectedCategory}
        mode={selectedMode}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />
    </div>
  );
}