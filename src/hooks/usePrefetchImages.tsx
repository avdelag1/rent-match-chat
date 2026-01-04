import { useEffect, useRef } from 'react';
import { getCardImageUrl } from '@/utils/imageOptimization';

interface PrefetchOptions {
  currentIndex: number;
  profiles: any[];
  prefetchCount?: number;
}

/**
 * Optimized image prefetching - balances speed with mobile performance
 *
 * FIX: Reduced from aggressive "all images for 5 profiles" to:
 * - Only next 2 profiles (not 5)
 * - Only first 2 images per profile (hero + next)
 * - Uses requestIdleCallback for non-critical prefetches
 * - No aggressive decode() (let browser handle it naturally)
 */
export function usePrefetchImages({
  currentIndex,
  profiles,
  prefetchCount = 2 // Reduced from 5 to prevent network saturation
}: PrefetchOptions) {
  const prefetchedIndices = useRef(new Set<number>());
  const imageCache = useRef(new Map<string, HTMLImageElement>());

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

      // FIX: Only collect first 2 images (hero + next), not ALL images
      const imagesToPrefetch: string[] = [];

      // For property listings - only first 2 images
      if (profile.images && Array.isArray(profile.images)) {
        imagesToPrefetch.push(...profile.images.slice(0, 2));
      }
      // Fallback to avatar if no property images
      else if (profile.avatar_url) {
        imagesToPrefetch.push(profile.avatar_url);
      }

      // FIX: Use idle callback for non-first-profile prefetches
      const prefetchImages = () => {
        imagesToPrefetch.forEach((imageUrl, imgIndex) => {
          if (imageUrl && imageUrl !== '/placeholder.svg' && imageUrl !== '/placeholder-avatar.svg') {
            const optimizedUrl = getCardImageUrl(imageUrl);

            // Skip if already in cache
            if (imageCache.current.has(optimizedUrl)) return;

            const img = new Image();

            // Only first image of first profile gets high priority
            img.fetchPriority = (offset === 0 && imgIndex === 0) ? 'high' : 'low';
            img.decoding = 'async';

            // Store in cache to prevent re-fetching
            imageCache.current.set(optimizedUrl, img);
            img.src = optimizedUrl;

            // FIX: Removed aggressive decode() - let browser handle naturally
            // This prevents CPU spikes during swipe interactions
          }
        });
      };

      // First profile prefetches immediately, others use idle time
      if (offset === 0) {
        prefetchImages();
      } else if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(prefetchImages, { timeout: 2000 });
      } else {
        // Fallback: delay non-critical prefetches
        setTimeout(prefetchImages, 100 * offset);
      }
    });

    // Clean up old prefetched indices to prevent memory leak
    if (prefetchedIndices.current.size > 50) {
      const indicesToKeep = new Set<number>();
      for (let i = Math.max(0, currentIndex - 2); i < currentIndex + prefetchCount + 5; i++) {
        indicesToKeep.add(i);
      }
      prefetchedIndices.current = indicesToKeep;
    }

    // Clean up old cached images (keep last 30, reduced from 100)
    if (imageCache.current.size > 30) {
      const keys = Array.from(imageCache.current.keys());
      const toRemove = keys.slice(0, keys.length - 30);
      toRemove.forEach(key => imageCache.current.delete(key));
    }
  }, [currentIndex, profiles, prefetchCount]);
}
