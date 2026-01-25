import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useNavigate } from 'react-router-dom';
import { SwipessLogo } from './SwipessLogo';
import { QuickFilterDropdown, QuickFilters } from './QuickFilterDropdown';
import { ModeSwitcher } from './ModeSwitcher';

// Colorful gradient text for "Message Activation" button - Red/Orange theme
const MessageActivationText = () => (
  <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
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
  const navigate = useNavigate();

  const defaultFilters: QuickFilters = {
    categories: [],
    listingType: 'both',
    clientGender: 'any',
    clientType: 'all',
  };

  const handleLogoClick = () => {
    if (userRole === 'owner') {
      navigate('/owner/dashboard');
    } else {
      navigate('/client/dashboard');
    }
  };

  return (
    <header
      className={cn('app-header bg-background/95 border-b border-white/5 shadow-sm', className)}
    >
      <div className="flex items-center justify-between h-12 max-w-screen-xl mx-auto">
        {/* Left side: Logo + Mode Switch + Filters */}
        <div className="flex items-center gap-3">
          <motion.div
            className="flex items-center gap-0.5 select-none cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogoClick}
          >
            <SwipessLogo size="xs" />
          </motion.div>

          {/* Mode Switcher - Switch between Client and Owner modes */}
          <ModeSwitcher variant="pill" size="md" />

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
        <div className="flex items-center gap-2">
          {/* Message Activations Button - Colorful Text (no badge) */}
          <Button
            variant="ghost"
            className="relative h-11 px-4 hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center"
            onClick={onMessageActivationsClick}
            aria-label="Message activations"
          >
            <MessageActivationText />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-11 w-11 hover:bg-white/10 rounded-xl transition-all duration-200 group"
            onClick={onNotificationsClick}
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {/* Bell icon with gradient on hover */}
              <Bell
                className={cn(
                  "h-6 w-6 transition-all duration-300",
                  notificationCount > 0
                    ? "text-orange-500 group-hover:text-orange-400"
                    : "text-foreground/80 group-hover:text-foreground"
                )}
              />
              {/* Animated ring effect when there are notifications */}
              <AnimatePresence>
                {notificationCount > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                    className="absolute inset-0 rounded-full border-2 border-orange-500"
                  />
                )}
              </AnimatePresence>
            </motion.div>
            <AnimatePresence mode="wait">
              {notificationCount > 0 && (
                <motion.span
                  key="notification-badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg shadow-orange-500/50 ring-2 ring-background"
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </header>
  );
}

export const TopBar = memo(TopBarComponent);
