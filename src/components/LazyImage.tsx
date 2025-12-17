import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getBlurDataUrl } from '@/utils/imageOptimization';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * LazyImage Component
 * Renders images with blur-up effect for progressive loading
 * - Displays blurred placeholder while image loads
 * - Automatically fades to full image when ready
 * - Improves perceived performance
 */
export function LazyImage({
  src,
  alt,
  className,
  width,
  height,
  objectFit = 'cover',
  loading = 'lazy',
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (loading === 'eager' && imgRef.current) {
      // Force load for eager images
      imgRef.current.src = src;
    }
  }, [src, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  const blurUrl = getBlurDataUrl(src);

  return (
    <div
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{
        width,
        height,
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    >
      {/* Blur placeholder */}
      <img
        src={blurUrl}
        alt=""
        className={cn(
          'absolute inset-0 w-full h-full transition-opacity duration-300',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
        style={{ objectFit }}
        aria-hidden="true"
      />

      {/* Main image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          isLoaded && !error ? 'opacity-100' : 'opacity-0'
        )}
        style={{ objectFit }}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
}
