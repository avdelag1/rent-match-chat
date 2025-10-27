import { TinderentSwipeContainer } from './TinderentSwipeContainer';

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
  // All filters and category selection now handled via sidebar
  // This component is simplified to just show the swipe interface

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Swipe Container - All filters now in sidebar */}
      <TinderentSwipeContainer
        onListingTap={onListingTap}
        onInsights={onInsights}
        onMessageClick={onMessageClick}
      />
    </div>
  );
}