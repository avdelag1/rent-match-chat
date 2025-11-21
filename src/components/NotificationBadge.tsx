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
          variant="default"
          className={`
            absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5
            text-[10px] font-bold
            rounded-full flex items-center justify-center
            shadow-md ring-2 ring-background
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