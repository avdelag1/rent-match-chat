import { Bell, Settings, Flame, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface TopBarProps {
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  onFiltersClick?: () => void;
  className?: string;
  showFilters?: boolean;
}

export function TopBar({ onNotificationsClick, onSettingsClick, onFiltersClick, className, showFilters = false }: TopBarProps) {
  const { unreadCount: notificationCount } = useUnreadNotifications();
  const { isVisible, isAtTop } = useScrollDirection();

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isAtTop
          ? 'bg-background/95 shadow-sm'
          : 'bg-background/80 shadow-md',
        'backdrop-blur-xl border-b border-border/20',
        className
      )}
      animate={{
        y: isVisible ? 0 : -44,
        opacity: isVisible ? 1 : 0
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <div className="flex items-center justify-between h-11 px-4 max-w-screen-xl mx-auto">
        {/* Logo - Compact */}
        <div className="flex items-center gap-2 select-none flex-shrink-0">
          <motion.div
            className="text-red-600 hover:text-red-500 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Flame className="h-5 w-5" />
          </motion.div>
          <span className="text-sm font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent hidden sm:inline">
            TINDERENT
          </span>
        </div>

        {/* Actions - Minimal Icon Buttons */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 hover:bg-transparent text-foreground/70 hover:text-foreground transition-colors"
              onClick={onNotificationsClick}
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <motion.span
                  className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full h-4 w-4 shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
              )}
            </Button>
          </motion.div>

          {/* Filters (Owner only) */}
          {showFilters && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-transparent text-foreground/70 hover:text-foreground transition-colors"
                onClick={onFiltersClick}
                title="Filters"
              >
                <Filter className="h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {/* Settings */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-transparent text-foreground/70 hover:text-foreground transition-colors"
              onClick={onSettingsClick}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
