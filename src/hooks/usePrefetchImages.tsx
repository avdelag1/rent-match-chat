import { useEffect, useRef } from 'react';
import { getCardImageUrl } from '@/utils/imageOptimization';

interface PrefetchOptions {
  currentIndex: number;
  profiles: any[];
  prefetchCount?: number;
}

/**
 * Supercharged image prefetching for lightning-fast photo loads
 * Prefetches next N profiles AGGRESSIVELY with high priority
 * Images appear INSTANTLY on swipe - "speed of light" performance
 */
export function usePrefetchImages({
  currentIndex,
  profiles,
  prefetchCount = 3 // Increased from 2 to 3 for more aggressive prefetching
}: PrefetchOptions) {
  const prefetchedIndices = useRef(new Set<number>());

  useEffect(() => {
    // Get next N profiles to prefetch
    const profilesToPrefetch = profiles.slice(
      currentIndex + 1,
      currentIndex + 1 + prefetchCount
    );

    // Prefetch images for each profile
    profilesToPrefetch.forEach((profile, offset) => {
      const profileIndex = currentIndex + 1 + offset;

      // Skip if already prefetched
      if (prefetchedIndices.current.has(profileIndex)) return;

      // Mark as prefetched
      prefetchedIndices.current.add(profileIndex);

      // Handle both main photo and gallery images
      const imagesToPrefetch: string[] = [];

      // Main profile image
      if (profile.avatar_url) {
        imagesToPrefetch.push(profile.avatar_url);
      }

      // Gallery images - prefetch ALL of them for instant viewing
      if (profile.profile_images && Array.isArray(profile.profile_images)) {
        imagesToPrefetch.push(...profile.profile_images);
      }

      // For property listings - prefetch ALL property images
      if (profile.images && Array.isArray(profile.images)) {
        imagesToPrefetch.push(...profile.images);
      }

      // Prefetch each image with high priority and optimization
      imagesToPrefetch.forEach((imageUrl, imgIndex) => {
        if (imageUrl && imageUrl !== '/placeholder.svg' && imageUrl !== '/placeholder-avatar.svg') {
          const img = new Image();

          // Set high priority for first 3 images of next profile
          if (offset === 0 && imgIndex < 3) {
            img.fetchPriority = 'high';
          }

          // Decode async for better performance
          img.decoding = 'async';

          // Use optimized URL for faster loading (smaller file size)
          img.src = getCardImageUrl(imageUrl);

          // Force decode to ensure image is ready in cache
          if ('decode' in img) {
            img.decode().catch(() => {
              // Ignore decode errors - image will still load normally
            });
          }
        }
      });
    });

    // Clean up old prefetched indices to prevent memory leak
    if (prefetchedIndices.current.size > 50) {
      const indicesToKeep = new Set<number>();
      for (let i = Math.max(0, currentIndex - 5); i < currentIndex + prefetchCount + 5; i++) {
        indicesToKeep.add(i);
      }
      prefetchedIndices.current = indicesToKeep;
    }
  }, [currentIndex, profiles, prefetchCount]);
}
