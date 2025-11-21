import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  max?: number;
}

export function NotificationBadge({ count, className = '', max = 99 }: NotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <Badge
          variant="destructive"
          className={`
            absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5
            bg-red-500 hover:bg-red-600 text-white text-xs font-bold
            rounded-full flex items-center justify-center
            animate-pulse shadow-lg ring-2 ring-white
            leading-none
            ${className}
          `}
        >
          {displayCount}
        </Badge>
      </motion.div>
    </AnimatePresence>
  );
}