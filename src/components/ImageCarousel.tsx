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

// Preload queue to avoid competing preloads
const preloadQueue: Set<string> = new Set();

function preloadImage(url: string): void {
  if (preloadQueue.has(url)) return;
  preloadQueue.add(url);
  
  // Use requestIdleCallback for non-blocking preload
  const preload = () => {
    const img = new Image();
    img.src = url;
    img.onload = () => preloadQueue.delete(url);
    img.onerror = () => preloadQueue.delete(url);
  };
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload, { timeout: 2000 });
  } else {
    setTimeout(preload, 100);
  }
}

const ImageCarouselComponent = ({ 
  images, 
  alt, 
  aspectRatio = '4:3',
  className,
  showThumbnails = true 
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Reset loading state when current image changes
  useEffect(() => {
    if (loadedImages.has(currentIndex)) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [currentIndex, loadedImages]);

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
    if (index === currentIndex) {
      setIsLoading(false);
    }
  }, [currentIndex]);

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
          "relative w-full overflow-hidden rounded-lg cursor-pointer group bg-muted/30",
          aspectRatioClass
        )}
        onClick={handleImageClick}
      >
        {/* Skeleton placeholder - always visible until image loads */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 animate-pulse">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ 
                animation: 'shimmer 1.5s infinite',
                backgroundSize: '200% 100%'
              }} 
            />
          </div>
        )}

        {/* Current image */}
        <img
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-75",
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          loading="eager" // Current image loads eagerly
          decoding="async"
          onLoad={() => handleImageLoad(currentIndex)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
            handleImageLoad(currentIndex);
          }}
        />
        
        {/* Click Areas - Visual hints on hover (desktop only) */}
        {images.length > 1 && (
          <>
            <div className="absolute left-0 top-0 w-[30%] h-full bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-start pl-4 pointer-events-none">
              <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div className="absolute right-0 top-0 w-[30%] h-full bg-gradient-to-l from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-end pr-4 pointer-events-none">
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
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2 py-1 rounded text-sm backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Progress dots (mobile-friendly) */}
        {images.length > 1 && images.length <= 10 && (
          <div className="absolute top-2 left-0 right-0 flex justify-center gap-1 px-4">
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
