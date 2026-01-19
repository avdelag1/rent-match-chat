/**
 * UNIFIED FILTER TYPES
 * Single source of truth for all filter-related types
 * Used by: QuickFilterBar, QuickFilterDropdown, CascadeFilterButton, CollapsibleFilterButton
 */

/**
 * Available listing categories
 * These are the UI representation values
 * Note: 'services' maps to 'worker' in the database
 */
export type QuickFilterCategory =
  | 'property'
  | 'motorcycle'  // ALWAYS use 'motorcycle' not 'moto'
  | 'vehicle'
  | 'yacht'
  | 'bicycle'
  | 'services';   // UI name (maps to 'worker' in database)

/**
 * Listing types for property rentals
 */
export type QuickFilterListingType = 'rental' | 'sale' | 'both';

/**
 * Client gender filter for owner dashboard
 */
export type ClientGender = 'male' | 'female' | 'other' | 'all';

/**
 * Client type filter for owner dashboard
 */
export type ClientType = 'individual' | 'family' | 'business' | 'all';

/**
 * Quick filter interface
 * Used for both client and owner quick filter UI
 */
export interface QuickFilters {
  // Listing filters (for clients browsing listings)
  categories?: QuickFilterCategory[];
  category?: QuickFilterCategory;
  listingType?: QuickFilterListingType;

  // Client filters (for owners browsing clients)
  clientGender?: ClientGender;
  clientType?: ClientType;

  // Advanced filters (applied from AdvancedFilters dialog)
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  budgetRange?: [number, number];
  moveInTimeframe?: string;

  // Special flags
  activeCategory?: QuickFilterCategory;
}

/**
 * Category configuration for UI display
 */
export interface CategoryConfig {
  label: string;
  icon: string;
  color: string;
  description: string;
}

/**
 * Category display configuration map
 */
export const categoryConfig: Record<QuickFilterCategory, CategoryConfig> = {
  property: {
    label: 'Property',
    icon: '🏠',
    color: 'bg-blue-500',
    description: 'Houses, apartments, rooms'
  },
  motorcycle: {
    label: 'Motorcycle',
    icon: '🏍️',
    color: 'bg-red-500',
    description: 'Motorcycles, scooters, bikes'
  },
  vehicle: {
    label: 'Vehicle',
    icon: '🚗',
    color: 'bg-green-500',
    description: 'Cars, trucks, vans'
  },
  yacht: {
    label: 'Yacht',
    icon: '⛵',
    color: 'bg-cyan-500',
    description: 'Boats, yachts, watercraft'
  },
  bicycle: {
    label: 'Bicycle',
    icon: '🚴',
    color: 'bg-yellow-500',
    description: 'Bicycles, e-bikes'
  },
  worker: {
    label: 'Services',
    icon: '🛠️',
    color: 'bg-purple-500',
    description: 'Workers, contractors, services'
  }
};

/**
 * Maps UI category names to database category names
 * Only needed for legacy support - prefer using database names directly
 */
export const categoryToDatabase: Record<string, QuickFilterCategory> = {
  'property': 'property',
  'motorcycle': 'motorcycle',
  'moto': 'motorcycle',  // Legacy support
  'vehicle': 'vehicle',
  'yacht': 'yacht',
  'bicycle': 'bicycle',
  'services': 'worker',  // UI shows "Services", DB uses "worker"
  'worker': 'worker'
};

/**
 * Normalizes a category string to database format
 */
export function normalizeCategoryName(category: string | undefined): QuickFilterCategory | undefined {
  if (!category) return undefined;
  return categoryToDatabase[category.toLowerCase()] || category as QuickFilterCategory;
}
