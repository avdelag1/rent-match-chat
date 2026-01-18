/**
 * BOTTOM NAVIGATION BAR
 *
 * Full-width, ergonomic bottom navigation optimized for one-handed use.
 *
 * TOUCH OPTIMIZATION:
 * - Expands horizontally to use full screen width
 * - Larger hit areas (minimum 48px) for reliable thumb taps
 * - Generous spacing between touch targets
 * - Safe area handling for iOS home indicator
 *
 * DESIGN:
 * - No visible frames or outlines on buttons
 * - Color-coded icons for active states
 * - Subtle active indicator dot
 * - GPU-accelerated animations
 */

import { startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, SlidersHorizontal, Flame, MessageCircle, User, Plus, List, Building2, Heart, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount';
import { springConfigs } from '@/utils/springConfigs';
import { prefetchRoute } from '@/utils/routePrefetcher';

/**
 * TOUCH TARGET SIZING
 *
 * Based on Apple HIG (44pt minimum) scaled for comfortable one-handed use.
 * These values ensure "my thumb never misses, even one-handed."
 */
const ICON_SIZE = 28; // Slightly larger icons for visibility
const TOUCH_TARGET_SIZE = 52; // Comfortable touch target (exceeds 44pt minimum)
const NAV_BUTTON_PADDING = 14; // Padding inside touch target around icon

interface BottomNavigationProps {
  userRole: 'client' | 'owner' | 'admin';
  onFilterClick?: () => void;
  onAddListingClick?: () => void;
  onListingsClick?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  onClick?: () => void;
  badge?: number;
  isCenter?: boolean;
}

export function BottomNavigation({ userRole, onFilterClick, onAddListingClick, onListingsClick }: BottomNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useUnreadMessageCount();

  // Client/Renter Navigation Items - with Filter between Browse and Flames
  const clientNavItems: NavItem[] = [
    {
      id: 'browse',
      label: 'Browse',
      icon: Home,
      path: '/client/dashboard',
    },
    {
      id: 'filter',
      label: 'Filter',
      icon: Filter,
      onClick: onFilterClick,
    },
    {
      id: 'likes',
      label: 'Flames',
      icon: Flame,
      path: '/client/liked-properties',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      path: '/messages',
      badge: unreadCount,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/client/profile',
    },
  ];

  // Owner/Landlord Navigation Items
  const ownerNavItems: NavItem[] = [
    {
      id: 'browse',
      label: 'Browse',
      icon: Building2,
      path: '/owner/dashboard',
    },
    {
      id: 'filter',
      label: 'Filter',
      icon: SlidersHorizontal,
      onClick: onFilterClick,
    },
    {
      id: 'liked',
      label: 'Liked',
      icon: Heart,
      path: '/owner/liked-clients',
    },
    {
      id: 'listings',
      label: 'Listings',
      icon: List,
      path: '/owner/properties',
      isCenter: true,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      path: '/messages',
      badge: unreadCount,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/owner/profile',
    },
  ];

  const navItems = userRole === 'client' ? clientNavItems : ownerNavItems;

  const handleNavClick = (event: React.MouseEvent, item: NavItem) => {
    // Prevent event bubbling to avoid accidental triggers of other buttons
    event.stopPropagation();

    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      // INSTANT NAVIGATION: Use startTransition to keep current UI responsive
      // while React prepares the new route - feels like native app
      startTransition(() => {
        navigate(item.path!);
      });
    }
  };

  const isActive = (item: NavItem) => {
    if (!item.path) return false;
    return location.pathname === item.path;
  };

  // Get icon color class only (for the Icon component)
  const getIconColorClass = (item: NavItem, active: boolean) => {
    if (!active) return 'text-gray-500';

    switch (item.id) {
      case 'browse':
        return 'text-red-400';
      case 'likes':
      case 'liked':
        return 'text-orange-400';
      case 'messages':
        return 'text-blue-400';
      case 'listings':
        return 'text-red-400';
      case 'profile':
        return 'text-red-400';
      case 'hire':
      case 'services':
        return 'text-emerald-400';
      case 'filter':
        return 'text-purple-400';
      default:
        return 'text-red-400';
    }
  };

  // Get indicator dot color for active state
  const getIndicatorColorClass = (item: NavItem) => {
    switch (item.id) {
      case 'browse':
        return 'bg-red-400';
      case 'likes':
      case 'liked':
        return 'bg-orange-400';
      case 'messages':
        return 'bg-blue-400';
      case 'listings':
        return 'bg-red-400';
      case 'profile':
        return 'bg-red-400';
      case 'hire':
      case 'services':
        return 'bg-emerald-400';
      case 'filter':
        return 'bg-purple-400';
      default:
        return 'bg-red-400';
    }
  };


  return (
    <nav className="app-bottom-bar pointer-events-none px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          ...springConfigs.snappy,
          delay: 0.1
        }}
        // FULL-WIDTH LAYOUT: Use available screen width, evenly distribute buttons
        className="flex items-center justify-evenly w-full max-w-lg mx-auto px-2 py-2 pointer-events-auto bg-background/90 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
        style={{
          // GPU acceleration for smooth animations
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <motion.button
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                ...springConfigs.instant,
                delay: 0.15 + index * 0.05
              }}
              onClick={(e) => handleNavClick(e, item)}
              // INSTANT NAVIGATION: Prefetch on earliest possible events
              onPointerDown={(e) => { e.stopPropagation(); item.path && prefetchRoute(item.path); }}
              onTouchStart={(e) => { e.stopPropagation(); item.path && prefetchRoute(item.path); }}
              onMouseEnter={(e) => { e.stopPropagation(); item.path && prefetchRoute(item.path); }}
              onFocus={(e) => { e.stopPropagation(); item.path && prefetchRoute(item.path); }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92, transition: springConfigs.instant }}
              // EXPANDED TOUCH TARGETS: Each button has generous hit area
              className="relative transition-colors duration-200 select-none touch-manipulation flex items-center justify-center rounded-2xl"
              style={{
                // Ensure minimum touch target size
                minWidth: TOUCH_TARGET_SIZE,
                minHeight: TOUCH_TARGET_SIZE,
                padding: NAV_BUTTON_PADDING,
                // GPU acceleration
                transform: 'translateZ(0)',
                willChange: 'transform',
              }}
            >
              {/* Notification Badge - Shows unread count number */}
              <AnimatePresence>
                {item.badge && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={cn(
                      "absolute -top-0.5 -right-0.5 rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg ring-2 ring-background text-[11px] font-bold text-white px-1",
                      item.id === 'messages' ? 'bg-blue-500' : 'bg-orange-500'
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
                )}
              </AnimatePresence>

              <div className="flex flex-col items-center">
                <Icon
                  className={cn(
                    'transition-all duration-200',
                    getIconColorClass(item, active)
                  )}
                  style={{
                    // Use constant for icon size - slightly larger for center items
                    width: item.isCenter ? ICON_SIZE + 2 : ICON_SIZE,
                    height: item.isCenter ? ICON_SIZE + 2 : ICON_SIZE,
                  }}
                  strokeWidth={active ? 2.5 : 2}
                />

                {/* Active indicator - subtle underline dot */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      className={cn(
                        "w-5 h-0.5 rounded-full mt-1.5",
                        getIndicatorColorClass(item)
                      )}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </nav>
  );
}
