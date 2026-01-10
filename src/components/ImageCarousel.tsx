import { useState, useCallback, useEffect, memo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  aspectRatio?: 'square' | '4:3' | '16:9' | 'auto';
  className?: string;
  showThumbnails?: boolean;
}

// Global image cache - shared across all carousels for instant re-display
const globalImageCache = new Map<string, { loaded: boolean; decoded: boolean }>();

// Preload queue to avoid competing preloads
const preloadQueue: Set<string> = new Set();

function preloadImage(url: string): void {
  if (preloadQueue.has(url) || globalImageCache.has(url)) return;
  preloadQueue.add(url);

  // Use requestIdleCallback for non-blocking preload
  const preload = () => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      preloadQueue.delete(url);
      globalImageCache.set(url, { loaded: true, decoded: false });
      // Decode in idle time for instant display later
      if ('decode' in img) {
        img.decode().then(() => {
          const cached = globalImageCache.get(url);
          if (cached) cached.decoded = true;
        }).catch(() => {});
      }
    };
    img.onerror = () => {
      preloadQueue.delete(url);
    };
    img.src = url;
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload, { timeout: 2000 });
  } else {
    setTimeout(preload, 100);
  }
}

// Async image decode with fallback
async function decodeImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      if ('decode' in img) {
        img.decode().then(() => resolve(true)).catch(() => resolve(true));
      } else {
        resolve(true);
      }
    };
    img.onerror = () => resolve(false);
  });
}

const ImageCarouselComponent = ({
  images,
  alt,
  aspectRatio = '4:3',
  className,
  showThumbnails = true
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Two-layer approach: previous image stays visible while next decodes
  const [displayedSrc, setDisplayedSrc] = useState<string | null>(null);
  const [previousSrc, setPreviousSrc] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const decodingRef = useRef<boolean>(false);

  // Get current image source
  const currentImageSrc = images?.[currentIndex] || null;

  // CORE FIX: Two-layer image transition - never show empty/black
  // Previous image stays visible until new image is fully decoded
  useEffect(() => {
    if (!currentImageSrc) return;
    if (decodingRef.current) return; // Prevent race conditions

    // Check if already cached and decoded
    const cached = globalImageCache.get(currentImageSrc);
    if (cached?.decoded && displayedSrc !== currentImageSrc) {
      // Instant switch for cached+decoded images
      setPreviousSrc(displayedSrc);
      setDisplayedSrc(currentImageSrc);
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 100);
      return;
    }

    // If first load (no displayedSrc yet), show immediately and decode
    if (!displayedSrc) {
      setDisplayedSrc(currentImageSrc);
      decodeImage(currentImageSrc).then((success) => {
        if (success) {
          globalImageCache.set(currentImageSrc, { loaded: true, decoded: true });
        }
      });
      return;
    }

    // New image needs decoding - keep previous visible during decode
    if (displayedSrc !== currentImageSrc) {
      decodingRef.current = true;
      setPreviousSrc(displayedSrc);
      setIsTransitioning(true);

      decodeImage(currentImageSrc).then((success) => {
        decodingRef.current = false;
        if (success) {
          globalImageCache.set(currentImageSrc, { loaded: true, decoded: true });
          setDisplayedSrc(currentImageSrc);
          setHasError(false);
        } else {
          setHasError(true);
          // Still show the image even if decode failed
          setDisplayedSrc(currentImageSrc);
        }
        // Brief transition then clear previous
        setTimeout(() => {
          setIsTransitioning(false);
          setPreviousSrc(null);
        }, 150);
      });
    }
  }, [currentImageSrc, displayedSrc]);

  // Preload adjacent images when current index changes
  useEffect(() => {
    if (!images || images.length === 0) return;

    // Preload next and previous images
    const indicesToPreload = [
      (currentIndex + 1) % images.length,
      (currentIndex - 1 + images.length) % images.length,
    ];

    indicesToPreload.forEach(idx => {
      if (images[idx]) {
        preloadImage(images[idx]);
      }
    });
  }, [currentIndex, images]);

  if (!images || images.length === 0) {
    return (
      <div className={cn(
        "w-full bg-muted/20 rounded-lg flex items-center justify-center",
        aspectRatio === 'square' && 'aspect-square',
        aspectRatio === '4:3' && 'aspect-[4/3]',
        aspectRatio === '16:9' && 'aspect-video',
        aspectRatio === 'auto' && 'h-64',
        className
      )}>
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleImageClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const imageWidth = rect.width;

    // If clicked on left 30% of image, go previous
    if (clickX < imageWidth * 0.3) {
      goToPrevious();
    }
    // If clicked on right 30% of image, go next
    else if (clickX > imageWidth * 0.7) {
      goToNext();
    }
  }, [goToPrevious, goToNext]);

  const aspectRatioClass = cn(
    aspectRatio === 'square' && 'aspect-square',
    aspectRatio === '4:3' && 'aspect-[4/3]',
    aspectRatio === '16:9' && 'aspect-video',
    aspectRatio === 'auto' && 'h-full'
  );

  return (
    <div className={cn("relative w-full h-full", className)} ref={containerRef}>
      {/* Main Image Container - Fixed aspect ratio prevents layout shift */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-lg cursor-pointer group",
          aspectRatioClass
        )}
        onClick={handleImageClick}
      >
        {/* LAYER 1: Neutral blur placeholder - always visible as base
            Uses a light neutral gradient instead of dark/black */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800"
          style={{ zIndex: 1 }}
        />

        {/* LAYER 2: Blurred version of current image (if available) as enhanced placeholder */}
        {displayedSrc && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              zIndex: 2,
              filter: 'blur(20px)',
              transform: 'scale(1.1)',
            }}
          >
            <img
              src={displayedSrc}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
              aria-hidden="true"
            />
          </div>
        )}

        {/* LAYER 3: Previous image - stays visible during transition */}
        {previousSrc && isTransitioning && (
          <img
            src={previousSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              zIndex: 3,
              opacity: 1,
            }}
            aria-hidden="true"
          />
        )}

        {/* LAYER 4: Current image - fades in after decode */}
        {displayedSrc && (
          <img
            src={displayedSrc}
            alt={`${alt} ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            style={{
              zIndex: 4,
              opacity: isTransitioning && previousSrc ? 0 : 1,
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
              setHasError(true);
            }}
          />
        )}

        {/* Click Areas - Visual hints on hover (desktop only) */}
        {images.length > 1 && (
          <>
            <div
              className="absolute left-0 top-0 w-[30%] h-full bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-start pl-4 pointer-events-none"
              style={{ zIndex: 10 }}
            >
              <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div
              className="absolute right-0 top-0 w-[30%] h-full bg-gradient-to-l from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end pr-4 pointer-events-none"
              style={{ zIndex: 10 }}
            >
              <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </>
        )}

        {/* Navigation Buttons (desktop) */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ zIndex: 11 }}
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ zIndex: 11 }}
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2 py-1 rounded text-sm backdrop-blur-sm"
            style={{ zIndex: 12 }}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Progress dots (mobile-friendly) */}
        {images.length > 1 && images.length <= 10 && (
          <div
            className="absolute top-2 left-0 right-0 flex justify-center gap-1 px-4"
            style={{ zIndex: 12 }}
          >
            {images.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={cn(
                  "flex-1 h-1 rounded-full transition-all duration-200 max-w-8",
                  idx === currentIndex
                    ? 'bg-white'
                    : 'bg-white/40'
                )}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((image, index) => (
            <button
              key={`thumb-${image}-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all duration-200",
                index === currentIndex
                  ? 'border-primary scale-105'
                  : 'border-transparent hover:border-primary/50'
              )}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ImageCarousel = memo(ImageCarouselComponent);
