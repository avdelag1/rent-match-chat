import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoPreviewProps {
  photos: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function PhotoPreview({ photos, isOpen, onClose, initialIndex = 0 }: PhotoPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!photos.length) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background/98"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="relative h-full flex items-center justify-center p-4">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-foreground hover:bg-muted"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation dots */}
            {photos.length > 1 && (
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
                <div className="flex space-x-2">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDotClick(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentIndex
                          ? 'bg-primary scale-125'
                          : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Main photo container */}
            <div 
              className="relative max-w-4xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <img
                  src={photos[currentIndex]}
                  alt={`Profile photo ${currentIndex + 1}`}
                  className="w-full h-full object-cover rounded-2xl shadow-2xl"
                  style={{ maxHeight: '85vh' }}
                />
              </motion.div>

              {/* Navigation arrows */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90 text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevious();
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90 text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Photo counter */}
            {photos.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-background/85 text-foreground px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {photos.length}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}