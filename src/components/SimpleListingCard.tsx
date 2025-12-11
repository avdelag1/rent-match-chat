import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { MapPin, Bed, Bath, Square, Flame, X, MessageCircle } from 'lucide-react';
import { Listing } from '@/hooks/useListings';
import { Button } from '@/components/ui/button';

interface SimpleListingCardProps {
  listing: Listing;
  onLike: () => void;
  onPass: () => void;
  onMessage?: () => void;
  onTap?: () => void;
}

export function SimpleListingCard({ listing, onLike, onPass, onMessage, onTap }: SimpleListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;

    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        onLike();
      } else {
        onPass();
      }
    }
    setDragDirection(null);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (info.offset.x > 50) {
      setDragDirection('right');
    } else if (info.offset.x < -50) {
      setDragDirection('left');
    } else {
      setDragDirection(null);
    }
  };

  const nextImage = () => {
    if (listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const threshold = rect.width * 0.3; // 30% from each edge = 40% center area for insights

    if (clickX < threshold) {
      prevImage();
    } else if (clickX > rect.width - threshold) {
      nextImage();
    } else {
      // Tap on center 40% area - open insights
      if (onTap) {
        onTap();
      }
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      onDrag={handleDrag}
      className="w-full max-w-md mx-auto h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden relative cursor-grab active:cursor-grabbing"
      whileTap={{ cursor: 'grabbing' }}
      animate={{ x: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
    >
      {/* Like/Pass Overlay */}
      {dragDirection && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {dragDirection === 'right' ? (
            <div className="absolute top-8 left-8">
              <div className="bg-green-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl transform rotate-[-20deg] shadow-xl border-4 border-white">
                LIKE
              </div>
            </div>
          ) : (
            <div className="absolute top-8 right-8">
              <div className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl transform rotate-[20deg] shadow-xl border-4 border-white">
                PASS
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image */}
      <div className="relative h-[400px] bg-gray-100">
        {listing.images && listing.images.length > 0 ? (
          <>
            <img
              src={listing.images[currentImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover cursor-pointer"
              draggable={false}
              onClick={handleImageClick}
            />

            {/* Quick Actions - Message Icon in Top Right - PROMINENT */}
            <div className="absolute top-3 right-3 flex gap-2 z-20">
              <Button
                size="sm"
                variant="outline"
                className="w-12 h-12 p-0 bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white text-white hover:from-blue-600 hover:to-blue-700 shadow-[0_4px_12px_rgba(59,130,246,0.4),0_2px_6px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.5),0_3px_8px_rgba(59,130,246,0.4)] hover:scale-110 active:scale-95 transition-all duration-200 transform-gpu backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMessage?.();
                }}
              >
                <MessageCircle className="w-6 h-6 stroke-[2.5]" />
              </Button>
            </div>

            {/* Image Navigation */}
            {listing.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-20"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-20"
                >
                  ›
                </button>

                {/* Image Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                  {listing.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <span className="text-6xl">🏠</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div 
        className="p-4 h-[200px] flex flex-col overflow-hidden cursor-pointer"
        onClick={() => onTap?.()}
      >
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{listing.title}</h2>
            <div className="flex items-center text-gray-700">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{listing.neighborhood}, {listing.city}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-red-600">${listing.price?.toLocaleString()}</div>
            <div className="text-sm text-gray-600 font-medium">/month</div>
          </div>
        </div>

        {/* Description Preview */}
        {listing.description && (
          <p className="text-sm text-gray-700 line-clamp-2 mb-2 leading-relaxed">
            {listing.description}
          </p>
        )}

        {/* Details */}
        <div className="flex gap-4 text-gray-800 mt-auto">
          {listing.beds && (
            <div className="flex items-center gap-1">
              <Bed className="w-5 h-5" />
              <span className="text-sm font-semibold">{listing.beds}</span>
            </div>
          )}
          {listing.baths && (
            <div className="flex items-center gap-1">
              <Bath className="w-5 h-5" />
              <span className="text-sm font-semibold">{listing.baths}</span>
            </div>
          )}
          {listing.square_footage && (
            <div className="flex items-center gap-1">
              <Square className="w-5 h-5" />
              <span className="text-sm font-semibold">{listing.square_footage} ft²</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
