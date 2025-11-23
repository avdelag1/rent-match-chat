import { Button } from '@/components/ui/button';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface SwipeTopBarProps {
  currentIndex: number;
  totalCount: number;
  onBack: () => void;
  onFilters?: () => void;
}

export function SwipeTopBar({ currentIndex, totalCount, onBack, onFilters }: SwipeTopBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Renter Counter */}
        <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
          <span className="text-white font-semibold text-sm">
            {currentIndex + 1} / {totalCount}
          </span>
        </div>

        {/* Filter Button */}
        {onFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onFilters}
            className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white shadow-lg backdrop-blur-md"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
