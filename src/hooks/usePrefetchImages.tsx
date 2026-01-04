import { useEffect, useRef } from 'react';
import { getCardImageUrl } from '@/utils/imageOptimization';

interface PrefetchOptions {
  currentIndex: number;
  profiles: any[];
  prefetchCount?: number;
}

/**
 * Ultra-aggressive image prefetching - Instagram/Tinder speed
 * Prefetches next 5 profiles with ALL their images
 * Images appear INSTANTLY on swipe - zero delay
 */
export function usePrefetchImages({
  currentIndex,
  profiles,
  prefetchCount = 5 // Increased to 5 for maximum prefetching
}: PrefetchOptions) {
  const prefetchedIndices = useRef(new Set<number>());
  const imageCache = useRef(new Map<string, HTMLImageElement>());

  useEffect(() => {
    // Get next N profiles to prefetch
    const profilesToPrefetch = profiles.slice(
      currentIndex + 1,
      currentIndex + 1 + prefetchCount
    );

    // Prefetch images for each profile IN PARALLEL
    profilesToPrefetch.forEach((profile, offset) => {
      const profileIndex = currentIndex + 1 + offset;

      // Skip if already prefetched
      if (prefetchedIndices.current.has(profileIndex)) return;

      // Mark as prefetched
      prefetchedIndices.current.add(profileIndex);

      // Collect ALL images from this profile
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

      // Prefetch each image with maximum priority
      imagesToPrefetch.forEach((imageUrl, imgIndex) => {
        if (imageUrl && imageUrl !== '/placeholder.svg' && imageUrl !== '/placeholder-avatar.svg') {
          const optimizedUrl = getCardImageUrl(imageUrl);

          // Skip if already in cache
          if (imageCache.current.has(optimizedUrl)) return;

          const img = new Image();

          // First 3 images of first 2 profiles get HIGH priority
          if (offset < 2 && imgIndex < 3) {
            img.fetchPriority = 'high';
          } else {
            img.fetchPriority = 'low';
          }

          // Decode async for better performance
          img.decoding = 'async';

          // Store in cache to prevent re-fetching
          imageCache.current.set(optimizedUrl, img);

          img.src = optimizedUrl;

          // Force decode to ensure image is ready in cache
          if ('decode' in img) {
            img.decode().catch(() => {});
          }
        }
      });
    });

    // Clean up old prefetched indices to prevent memory leak
    if (prefetchedIndices.current.size > 100) {
      const indicesToKeep = new Set<number>();
      for (let i = Math.max(0, currentIndex - 5); i < currentIndex + prefetchCount + 10; i++) {
        indicesToKeep.add(i);
      }
      prefetchedIndices.current = indicesToKeep;
    }

    // Clean up old cached images (keep last 100)
    if (imageCache.current.size > 100) {
      const keys = Array.from(imageCache.current.keys());
      const toRemove = keys.slice(0, keys.length - 100);
      toRemove.forEach(key => imageCache.current.delete(key));
    }
  }, [currentIndex, profiles, prefetchCount]);
}
