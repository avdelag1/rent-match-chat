import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { MapPin, Bed, Bath, Square, Heart, X } from 'lucide-react';
import { Listing } from '@/hooks/useListings';

interface SimpleListingCardProps {
  listing: Listing;
  onLike: () => void;
  onPass: () => void;
}

export function SimpleListingCard({ listing, onLike, onPass }: SimpleListingCardProps) {
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

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onDrag={handleDrag}
      className="w-full h-[700px] bg-white rounded-3xl shadow-2xl overflow-hidden relative cursor-grab active:cursor-grabbing"
      whileTap={{ cursor: 'grabbing' }}
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
      <div className="relative h-[500px] bg-gray-100">
        {listing.images && listing.images.length > 0 ? (
          <>
            <img
              src={listing.images[currentImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover"
              draggable={false}
            />

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
      <div className="p-6 h-[200px] flex flex-col">
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{listing.title}</h2>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{listing.neighborhood}, {listing.city}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-600">${listing.price?.toLocaleString()}</div>
            <div className="text-sm text-gray-500">/month</div>
          </div>
        </div>

        {/* Details */}
        <div className="flex gap-4 text-gray-700 mt-auto">
          {listing.beds && (
            <div className="flex items-center gap-1">
              <Bed className="w-5 h-5" />
              <span className="font-medium">{listing.beds}</span>
            </div>
          )}
          {listing.baths && (
            <div className="flex items-center gap-1">
              <Bath className="w-5 h-5" />
              <span className="font-medium">{listing.baths}</span>
            </div>
          )}
          {listing.square_footage && (
            <div className="flex items-center gap-1">
              <Square className="w-5 h-5" />
              <span className="font-medium">{listing.square_footage} ft²</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
