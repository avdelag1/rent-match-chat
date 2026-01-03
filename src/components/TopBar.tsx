import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { SwipessLogo } from './SwipessLogo';
import { QuickFilterDropdown, QuickFilters } from './QuickFilterDropdown';

// Colorful gradient text for "Message Activation" button - Red/Orange theme
const MessageActivationText = () => (
  <span className="font-bold text-xs tracking-tight bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
    Message Activation
  </span>
);

export type OwnerClientGender = 'female' | 'male' | 'any';
export type OwnerClientType = 'all' | 'hire' | 'rent' | 'buy';

export interface OwnerFilters {
  clientGender?: OwnerClientGender;
  clientType?: OwnerClientType;
}

interface TopBarProps {
  onNotificationsClick?: () => void;
  onMessageActivationsClick?: () => void;
  className?: string;
  // Filter props
  showFilters?: boolean;
  filters?: QuickFilters;
  onFiltersChange?: (filters: QuickFilters) => void;
  userRole?: 'client' | 'owner';
}

function TopBarComponent({
  onNotificationsClick,
  onMessageActivationsClick,
  className,
  showFilters,
  filters,
  onFiltersChange,
  userRole,
}: TopBarProps) {
  const { unreadCount: notificationCount } = useUnreadNotifications();

  const defaultFilters: QuickFilters = {
    categories: [],
    listingType: 'both',
    clientGender: 'any',
    clientType: 'all',
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn('app-header bg-background/80 backdrop-blur-2xl border-b border-white/5', className)}
    >
      <div className="flex items-center justify-between h-10 max-w-screen-xl mx-auto">
        {/* Left side: Logo + Filters */}
        <div className="flex items-center gap-2">
          <motion.div
            className="flex items-center gap-0.5 select-none"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SwipessLogo size="sm" />
          </motion.div>

          {/* Quick Filter Dropdown */}
          {showFilters && filters && onFiltersChange && userRole && (
            <QuickFilterDropdown
              filters={filters}
              onChange={onFiltersChange}
              userRole={userRole}
            />
          )}
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-1">
          {/* Message Activations Button - Colorful Text (no badge) */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 500 }}
          >
            <Button
              variant="ghost"
              className="relative h-10 px-3 hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center"
              onClick={onMessageActivationsClick}
              aria-label="Message activations"
            >
              <MessageActivationText />
            </Button>
          </motion.div>

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
        </div>
      </div>
    </motion.header>
  );
}

export const TopBar = memo(TopBarComponent);
