import { TinderentSwipeContainer } from './TinderentSwipeContainer';
import { ListingFilters } from '@/hooks/useSmartMatching';

interface CategoryBrowseContainerProps {
  onListingTap: (listingId: string) => void;
  onInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
  filters?: ListingFilters;
}

export function CategoryBrowseContainer({
  onListingTap,
  onInsights,
  onMessageClick,
  filters
}: CategoryBrowseContainerProps) {
  // All filters and category selection now handled via sidebar
  // This component passes filters down to the swipe interface

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Swipe Container - Filters passed from parent */}
      <TinderentSwipeContainer
        onListingTap={onListingTap}
        onInsights={onInsights}
        onMessageClick={onMessageClick}
        filters={filters}
      />
    </div>
  );
}