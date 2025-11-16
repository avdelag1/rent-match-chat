import { useEffect } from 'react';

interface PrefetchOptions {
  currentIndex: number;
  profiles: any[];
  prefetchCount?: number;
}

/**
 * Prefetch images for next N profiles while user views current profile
 * Dramatically improves perceived performance - images appear instant on next swipe
 */
export function usePrefetchImages({
  currentIndex,
  profiles,
  prefetchCount = 2
}: PrefetchOptions) {
  useEffect(() => {
    // Get next N profiles to prefetch
    const profilesToPrefetch = profiles.slice(
      currentIndex + 1,
      currentIndex + 1 + prefetchCount
    );

    // Prefetch images for each profile
    profilesToPrefetch.forEach((profile) => {
      // Handle both main photo and gallery images
      const imagesToPrefetch = [];

      // Main profile image
      if (profile.avatar_url) {
        imagesToPrefetch.push(profile.avatar_url);
      }

      // Gallery images
      if (profile.profile_images && Array.isArray(profile.profile_images)) {
        imagesToPrefetch.push(...profile.profile_images);
      }

      // For property listings
      if (profile.images && Array.isArray(profile.images)) {
        imagesToPrefetch.push(...profile.images);
      }

      // Prefetch each image
      imagesToPrefetch.forEach((imageUrl) => {
        if (imageUrl) {
          const img = new Image();
          img.src = imageUrl;
          // Optional: Add to cache for faster load
          // This works even if image isn't immediately visible
        }
      });
    });
  }, [currentIndex, profiles, prefetchCount]);
}
