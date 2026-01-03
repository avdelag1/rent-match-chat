import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useMessageActivationCount } from '@/hooks/useMessageActivationCount';
import { SwipessLogo } from './SwipessLogo';
import { QuickFilterDropdown, QuickFilters } from './QuickFilterDropdown';

// Colorful gradient text for "Activation" button
const ActivationText = () => (
  <span className="font-bold text-xs tracking-tight">
    <span className="text-orange-400">A</span>
    <span className="text-pink-400">c</span>
    <span className="text-purple-400">t</span>
    <span className="text-blue-400">i</span>
    <span className="text-cyan-400">v</span>
    <span className="text-green-400">a</span>
    <span className="text-yellow-400">t</span>
    <span className="text-orange-400">i</span>
    <span className="text-pink-400">o</span>
    <span className="text-purple-400">n</span>
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
  onSettingsClick?: () => void;
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
  onSettingsClick,
  onMessageActivationsClick,
  className,
  showFilters,
  filters,
  onFiltersChange,
  userRole,
}: TopBarProps) {
  const { unreadCount: notificationCount } = useUnreadNotifications();
  const { count: activationCount } = useMessageActivationCount();

  // Badge color based on activation count
  const getActivationBadgeColor = () => {
    if (activationCount > 5) return 'from-green-500 to-emerald-500 shadow-green-500/50';
    if (activationCount > 0) return 'from-orange-500 to-amber-500 shadow-orange-500/50';
    return 'from-red-500 to-rose-500 shadow-red-500/50';
  };

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
          {/* Message Activations Button - Colorful Text */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 500 }}
          >
            <Button
              variant="ghost"
              className="relative h-10 px-3 hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center gap-1"
              onClick={onMessageActivationsClick}
              aria-label={`Message activations (${activationCount} remaining)`}
            >
              <ActivationText />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg ring-2 ring-background bg-gradient-to-br ml-1",
                  getActivationBadgeColor()
                )}
              >
                {activationCount > 99 ? '99+' : activationCount}
              </motion.span>
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

export const TopBar = memo(TopBarComponent);
