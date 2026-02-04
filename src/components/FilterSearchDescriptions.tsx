/**
 * FILTER-SPECIFIC SEARCH DESCRIPTIONS
 *
 * Provides unique search descriptions and messaging for each filter category
 * Displayed when no cards are available (empty state)
 */

import { QuickFilterCategory } from '@/types/filters';

export interface FilterSearchDescription {
  title: string;
  description: string;
  searchingTitle: string;
  searchingDescription: string;
  refreshButtonText: string;
}

/**
 * Get filter-specific search descriptions
 */
export function getFilterSearchDescription(
  category: QuickFilterCategory,
  listingType: 'rent' | 'sale' | 'both' = 'both'
): FilterSearchDescription {
  const descriptions: Record<QuickFilterCategory, FilterSearchDescription> = {
    property: {
      title: 'No Properties Found',
      description:
        listingType === 'rent'
          ? 'Looking for the perfect place to rent. Try adjusting your filters or check back soon for new listings.'
          : listingType === 'sale'
          ? 'Searching for properties for sale. New listings are added daily - adjust your filters or refresh to discover more.'
          : 'Searching for properties to rent or buy. Expand your filters or check back regularly for new opportunities.',
      searchingTitle: 'Searching for Properties',
      searchingDescription: 'Scanning available properties in your area...',
      refreshButtonText: 'Refresh Properties',
    },

    motorcycle: {
      title: 'No Motorcycles Found',
      description:
        'Looking for motorcycles and scooters. Try expanding your search criteria or check back later for new rides.',
      searchingTitle: 'Searching for Motorcycles',
      searchingDescription: 'Finding motorcycles and scooters that match your criteria...',
      refreshButtonText: 'Refresh Motorcycles',
    },

    bicycle: {
      title: 'No Bicycles Found',
      description:
        'Searching for bicycles and e-bikes. Adjust your filters or refresh to discover available rides in your area.',
      searchingTitle: 'Searching for Bicycles',
      searchingDescription: 'Looking for bicycles and e-bikes near you...',
      refreshButtonText: 'Refresh Bicycles',
    },

    services: {
      title: 'No Services Found',
      description:
        'Looking for workers and contractors. Try broadening your search or check back soon for available professionals.',
      searchingTitle: 'Searching for Services',
      searchingDescription: 'Finding workers and contractors in your area...',
      refreshButtonText: 'Refresh Services',
    },
  };

  return descriptions[category] || descriptions.property;
}

/**
 * Get category-specific tips for better search results
 */
export function getFilterSearchTips(category: QuickFilterCategory): string[] {
  const tips: Record<QuickFilterCategory, string[]> = {
    property: [
      'Try expanding your price range',
      'Consider different neighborhoods',
      'Adjust bedroom or bathroom requirements',
      'Remove specific amenity filters',
    ],

    motorcycle: [
      'Try different motorcycle types',
      'Expand your price range',
      'Consider both rent and sale options',
      'Check back regularly for new listings',
    ],

    bicycle: [
      'Try different bicycle types',
      'Consider both regular and e-bikes',
      'Expand your budget range',
      'New listings are added daily',
    ],

    services: [
      'Try different service categories',
      'Expand your search radius',
      'Consider checking different times',
      'Professionals join regularly',
    ],
  };

  return tips[category] || tips.property;
}

/**
 * Get category-specific motivational messages
 */
export function getFilterMotivationalMessage(category: QuickFilterCategory): string {
  const messages: Record<QuickFilterCategory, string> = {
    property: "Don't worry - new properties are listed every day! Your perfect place might be just around the corner.",
    motorcycle: "The right ride is out there! New motorcycles and scooters are added regularly.",
    bicycle: "Keep looking! New bicycles and e-bikes become available all the time.",
    services: "The perfect professional for your needs is just a refresh away. New service providers join daily!",
  };

  return messages[category] || messages.property;
}

/**
 * Get category display info (for UI labels)
 */
export function getCategoryDisplayInfo(category: QuickFilterCategory) {
  const info: Record<QuickFilterCategory, { singular: string; plural: string; icon: string; color: string }> = {
    property: {
      singular: 'Property',
      plural: 'Properties',
      icon: '🏠',
      color: 'hsl(var(--primary))',
    },
    motorcycle: {
      singular: 'Motorcycle',
      plural: 'Motorcycles',
      icon: '🏍️',
      color: 'hsl(220 10% 46%)',
    },
    bicycle: {
      singular: 'Bicycle',
      plural: 'Bicycles',
      icon: '🚴',
      color: 'hsl(142 76% 36%)',
    },
    services: {
      singular: 'Service',
      plural: 'Services',
      icon: '🔧',
      color: 'hsl(271 91% 65%)',
    },
  };

  return info[category] || info.property;
}
