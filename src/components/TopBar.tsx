import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useNavigate } from 'react-router-dom';
import { SwipessLogo } from './SwipessLogo';
import { QuickFilterDropdown, QuickFilters } from './QuickFilterDropdown';
import { ModeSwitcher } from './ModeSwitcher';
import { useScrollDirection } from '@/hooks/useScrollDirection';

// Clean bright text for "Message Activation" button - no glow, pure color
const MessageActivationText = () => (
  <>
    <span className="hidden sm:inline font-bold text-sm tracking-tight bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent whitespace-nowrap">
      Message Activation
    </span>
    <Zap className="sm:hidden h-5 w-5 text-amber-400" />
  </>
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
  // Immersive mode - transparent header for full-bleed swipe cards
  transparent?: boolean;
  // Scroll-aware hiding - set to true to enable hide on scroll
  hideOnScroll?: boolean;
}

function TopBarComponent({
  onNotificationsClick,
  onMessageActivationsClick,
  className,
  showFilters,
  filters,
  onFiltersChange,
  userRole,
  transparent = false,
  hideOnScroll = false,
}: TopBarProps) {
  // Scroll-aware hide/show behavior
  // IMPORTANT: Target the dashboard scroll container, not window (content scrolls inside the container)
  const { isVisible } = useScrollDirection({ 
    threshold: 15, 
    showAtTop: true,
    targetSelector: '#dashboard-scroll-container',
  });
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

  // Determine if header should be hidden
  const shouldHide = hideOnScroll && !isVisible;

  return (
    <header
      className={cn(
        'app-header',
        // Always transparent - gradient overlays provide contrast
        'bg-transparent border-transparent backdrop-blur-none',
        // Scroll-aware hiding
        shouldHide && 'header-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between h-12 max-w-screen-xl mx-auto gap-2">
        {/* Left side: Logo + Mode Switch + Filters - properly aligned */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink">
          <motion.div
            className="flex items-center gap-0.5 select-none cursor-pointer flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogoClick}
          >
            <SwipessLogo size="xs" />
          </motion.div>

          {/* Mode Switcher - Switch between Client and Owner modes */}
          <div className="flex-shrink-0">
            <ModeSwitcher variant="pill" size="sm" className="md:hidden" />
            <ModeSwitcher variant="pill" size="md" className="hidden md:flex" />
          </div>

          {/* Quick Filter Dropdown */}
          {showFilters && filters && onFiltersChange && userRole && (
            <div className="flex-shrink-0">
              <QuickFilterDropdown
                filters={filters}
                onChange={onFiltersChange}
                userRole={userRole}
              />
            </div>
          )}
        </div>

        {/* Right side: Actions - Always visible */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Message Activations Button - ULTRA BRIGHT with glow effect */}
          <Button
            variant="ghost"
            className="relative h-9 sm:h-10 md:h-11 px-2 sm:px-3 md:px-4 hover:bg-transparent rounded-xl transition-all duration-200 flex items-center"
            onClick={onMessageActivationsClick}
            aria-label="Message activations"
          >
            <MessageActivationText />
          </Button>

          {/* Notifications - ULTRA BRIGHT with glow styling */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 hover:bg-transparent rounded-xl transition-all duration-200 group flex-shrink-0"
            onClick={onNotificationsClick}
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {/* Bell icon - clean bright color */}
              <Bell
                className={cn(
                  "h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-200",
                  notificationCount > 0
                    ? "text-amber-400 group-hover:text-amber-300"
                    : "text-white/90 group-hover:text-white"
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
                  className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-[20px] flex items-center justify-center shadow-lg shadow-orange-500/50 ring-2 ring-background"
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
