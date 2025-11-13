import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface ZoomableImageCarouselProps {
  images: string[];
  alt: string;
  initialIndex?: number;
}

export function ZoomableImageCarousel({ images, alt, initialIndex = 0 }: ZoomableImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goToPrevious = () => setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
  const goToNext = () => setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1);

  return (
    <>
      {/* Main Carousel with Zoom Button */}
      <div className="relative w-full">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          <img
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setIsFullscreen(true)}
          />
          
          {/* Zoom Button Overlay */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white"
            onClick={() => setIsFullscreen(true)}
          >
            <ZoomIn className="w-4 h-4 mr-2" />
            Zoom
          </Button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white" 
                onClick={goToPrevious}
              >
                <ChevronLeft />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white" 
                onClick={goToNext}
              >
                <ChevronRight />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                  idx === currentIndex ? 'border-primary' : 'border-border'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black/80 text-white rounded-full"
            onClick={() => setIsFullscreen(false)}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Zoomable Image with Pinch Zoom Support */}
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={4}
            centerOnInit
            wheel={{ step: 0.1 }}
            pinch={{ step: 5 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Zoom Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    onClick={() => zoomOut()} 
                    className="bg-black/60 hover:bg-black/80 text-white"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => resetTransform()} 
                    className="bg-black/60 hover:bg-black/80 text-white"
                  >
                    Reset
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    onClick={() => zoomIn()} 
                    className="bg-black/60 hover:bg-black/80 text-white"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>

                {/* Navigation in Fullscreen */}
                {images.length > 1 && (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/60 hover:bg-black/80 text-white rounded-full"
                      onClick={goToPrevious}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/60 hover:bg-black/80 text-white rounded-full"
                      onClick={goToNext}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {images.length}
                </div>

                {/* Zoomable Image */}
                <TransformComponent wrapperClass="w-full h-full flex items-center justify-center">
                  <img
                    src={images[currentIndex]}
                    alt={`${alt} ${currentIndex + 1}`}
                    className="max-w-full max-h-[95vh] object-contain"
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </DialogContent>
      </Dialog>
    </>
  );
}
