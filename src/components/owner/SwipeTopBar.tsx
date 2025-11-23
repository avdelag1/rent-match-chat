import { Button } from '@/components/ui/button';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface SwipeTopBarProps {
  currentIndex: number;
  totalCount: number;
  onBack: () => void;
  onFilters?: () => void;
}

export function SwipeTopBar({ currentIndex, totalCount, onBack, onFilters }: SwipeTopBarProps) {
  const { isVisible } = useScrollDirection();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      animate={{
        y: isVisible ? 0 : -70,
        opacity: isVisible ? 1 : 0,
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)'
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <div className="flex items-center justify-between px-4 py-3 h-11 backdrop-blur-xl bg-gradient-to-b from-black/40 to-transparent border-b border-white/5">
        {/* Back Button - Icon Only */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Counter - Minimal Compact Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/70 text-xs font-medium"
        >
          <span className="text-white">{currentIndex + 1}</span>
          <span className="text-white/50"> / {totalCount}</span>
        </motion.div>

        {/* Filter Button - Icon Only */}
        {onFilters && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onFilters}
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
