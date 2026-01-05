import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { getFullImageUrl, getThumbnailUrl, preloadImage } from '@/utils/imageOptimization';

interface PropertyImageGalleryProps {
  images: string[];
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

function PropertyImageGalleryComponent({
  images,
  alt,
  isOpen,
  onClose,
  initialIndex = 0
}: PropertyImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  // Track loaded images for instant display
  const loadedImagesRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState(0);

  // Preload ALL images when gallery opens for instant navigation
  useEffect(() => {
    if (!isOpen || !images.length) return;

    // Preload current image first (high priority)
    const currentUrl = getFullImageUrl(images[currentIndex]);
    if (!loadedImagesRef.current.has(currentUrl)) {
      const img = new Image();
      img.fetchPriority = 'high';
      img.decoding = 'async';
      img.onload = () => {
        loadedImagesRef.current.add(currentUrl);
        forceUpdate(n => n + 1);
      };
      img.src = currentUrl;
    }

    // Preload adjacent images immediately
    const adjacentIndices = [
      (currentIndex + 1) % images.length,
      currentIndex === 0 ? images.length - 1 : currentIndex - 1
    ];

    adjacentIndices.forEach(idx => {
      const url = getFullImageUrl(images[idx]);
      if (!loadedImagesRef.current.has(url)) {
        const img = new Image();
        img.fetchPriority = 'high';
        img.decoding = 'async';
        img.onload = () => loadedImagesRef.current.add(url);
        img.src = url;
      }
    });

    // Preload remaining images in background
    images.forEach((image, idx) => {
      if (idx !== currentIndex && !adjacentIndices.includes(idx)) {
        const url = getFullImageUrl(image);
        if (!loadedImagesRef.current.has(url)) {
          requestIdleCallback?.(() => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => loadedImagesRef.current.add(url);
            img.src = url;
          }) || setTimeout(() => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => loadedImagesRef.current.add(url);
            img.src = url;
          }, 100);
        }
      }
    });
  }, [currentIndex, images, isOpen]);

  // Reset index when dialog opens with new initialIndex
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  }, [images.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose();
  }, [goToPrevious, goToNext, onClose]);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  }, []);

  if (!images || images.length === 0) return null;

  const currentImageUrl = getFullImageUrl(images[currentIndex]);
  const isCurrentLoaded = loadedImagesRef.current.has(currentImageUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black/95"
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center justify-between text-white">
              <div className="text-lg font-medium">
                {currentIndex + 1} of {images.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="text-white hover:bg-white/20"
                >
                  {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Image - NO TRANSITIONS for instant feel */}
          <div className="flex-1 flex items-center justify-center p-4 pt-16">
            <div className="relative max-w-full max-h-full">
              {/* Loading placeholder */}
              {!isCurrentLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              <img
                src={currentImageUrl}
                alt={`${alt} ${currentIndex + 1}`}
                className={`max-w-full max-h-full object-contain ${
                  isZoomed ? 'scale-150 cursor-grab' : 'cursor-zoom-in'
                }`}
                style={{
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
                onClick={() => setIsZoomed(!isZoomed)}
                draggable={false}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                onClick={goToNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Thumbnail Strip - Use image URL as key */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex gap-2 justify-center overflow-x-auto max-w-full">
                {images.map((image, index) => (
                  <button
                    key={`thumb-${image}-${index}`}
                    onClick={() => handleThumbnailClick(index)}
                    className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden ${
                      index === currentIndex
                        ? 'border-white scale-110'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                    style={{ transform: 'translateZ(0)' }}
                  >
                    <img
                      src={getThumbnailUrl(image)}
                      alt={`${alt} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Swipe indicators for mobile */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/60 text-sm text-center">
            {images.length > 1 && 'Swipe or use arrow keys to navigate'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Memoize to prevent unnecessary re-renders
export const PropertyImageGallery = memo(PropertyImageGalleryComponent);