/**
 * Image optimization utilities for lightning-fast photo loading
 * Optimizes Supabase storage URLs with transformations for better performance
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Optimize Supabase storage image URL with transformation parameters
 * Reduces file size and improves load times dramatically
 */
export function optimizeImageUrl(
  url: string,
  options: ImageTransformOptions = {}
): string {
  // Skip if not a Supabase storage URL
  if (!url || !url.includes('supabase.co/storage')) {
    return url;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover'
  } = options;

  // Parse the URL
  const urlObj = new URL(url);

  // Add transformation parameters
  const params = new URLSearchParams(urlObj.search);

  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  params.set('quality', quality.toString());
  params.set('format', format);
  params.set('resize', resize);

  // Return optimized URL
  urlObj.search = params.toString();
  return urlObj.toString();
}

/**
 * Get optimized thumbnail URL (small preview)
 */
export function getThumbnailUrl(url: string): string {
  return optimizeImageUrl(url, {
    width: 400,
    height: 400,
    quality: 75,
    format: 'webp'
  });
}

/**
 * Get optimized card image URL (swipe cards)
 */
export function getCardImageUrl(url: string): string {
  return optimizeImageUrl(url, {
    width: 800,
    height: 1200,
    quality: 85,
    format: 'webp'
  });
}

/**
 * Get optimized full-size image URL (gallery view)
 */
export function getFullImageUrl(url: string): string {
  return optimizeImageUrl(url, {
    width: 1920,
    quality: 90,
    format: 'webp'
  });
}

/**
 * Generate blur data URL for progressive loading
 * Creates a tiny blurred placeholder while full image loads
 */
export function getBlurDataUrl(url: string): string {
  if (!url || !url.includes('supabase.co/storage')) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg==';
  }

  return optimizeImageUrl(url, {
    width: 10,
    height: 10,
    quality: 30,
    format: 'webp'
  });
}

/**
 * Preload an image into browser cache
 * Returns promise that resolves when image is loaded
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve();
      return;
    }

    const img = new Image();
    img.decoding = 'async';
    img.fetchPriority = 'high';

    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));

    img.src = url;

    // Force decode if supported
    if ('decode' in img) {
      img.decode().then(resolve).catch(reject);
    }
  });
}

/**
 * Batch preload multiple images
 * Preloads in parallel for maximum speed
 */
export async function preloadImages(urls: string[]): Promise<void> {
  const validUrls = urls.filter(url => url && url !== '/placeholder.svg' && url !== '/placeholder-avatar.svg');

  await Promise.allSettled(
    validUrls.map(url => preloadImage(url))
  );
}
