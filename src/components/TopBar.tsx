import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, Filter, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  onFiltersClick?: () => void;
  className?: string;
  showFilters?: boolean;
}

export function TopBar({ onNotificationsClick, onSettingsClick, onFiltersClick, className, showFilters = false }: TopBarProps) {
  const { unreadCount: notificationCount } = useUnreadNotifications();
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn('app-header bg-background/80 backdrop-blur-2xl border-b border-white/5', className)}
    >
      <div className="flex items-center justify-between h-10 max-w-screen-xl mx-auto">
        {/* Logo with animated gradient */}
        <motion.div
          className="flex items-center gap-0.5 select-none"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span
            className="text-2xl font-bold tracking-wide font-brand"
            style={{
              background: 'linear-gradient(90deg, #f97316, #ea580c, #fbbf24, #ff6b35, #dc2626, #f97316)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Swipess
          </span>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 hover:bg-white/10 rounded-xl transition-all duration-200"
              onClick={onNotificationsClick}
              aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
            >
              <Bell className="h-5 w-5 text-foreground/80" />
              <AnimatePresence>
                {notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-red-500 to-orange-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg shadow-red-500/50 ring-2 ring-background"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Filters (Owner only) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 500 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 hover:bg-white/10 rounded-xl transition-all duration-200"
                  onClick={onFiltersClick}
                  aria-label="Open filters"
                >
                  <Filter className="h-5 w-5 text-foreground/80" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Radio */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.17, type: 'spring', stiffness: 500 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-white/10 rounded-xl transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/radio');
              }}
              aria-label="Radio"
            >
              <Radio className="h-5 w-5 text-foreground/80" />
            </Button>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-white/10 rounded-xl transition-all duration-200"
              onClick={onSettingsClick}
              aria-label="Settings menu"
            >
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Settings className="h-5 w-5 text-foreground/80" />
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
