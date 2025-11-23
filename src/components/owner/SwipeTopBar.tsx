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
      className="fixed top-0 left-0 right-0 z-[100] bg-transparent"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="w-10 h-10 text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Counter - Minimal Style */}
        <div className="text-white/80 font-semibold text-sm">
          <span>{currentIndex + 1}</span>
          <span className="text-white/50"> / {totalCount}</span>
        </div>

        {/* Filter Button */}
        {onFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onFilters}
            className="w-10 h-10 text-white hover:bg-white/10 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
