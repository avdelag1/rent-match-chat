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
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { springConfigs } from '@/utils/springConfigs';
import { prefetchRoute } from '@/utils/routePrefetcher';

/**
 * TOUCH TARGET SIZING
 *
 * Based on Apple HIG (44pt minimum) scaled for comfortable one-handed use.
 * These values ensure "my thumb never misses, even one-handed."
 */
const ICON_SIZE = 24; // Compact icons for cleaner look
const TOUCH_TARGET_SIZE = 56; // Expanded touch target with more breathing room
const NAV_BUTTON_PADDING = 16; // More padding for better icon spacing

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
  
  // Hide on scroll down, show on scroll up - targets the dashboard scroll container
  const { isVisible } = useScrollDirection({ 
    threshold: 15, 
    showAtTop: true,
    targetSelector: '#dashboard-scroll-container'
  });

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
      path: '/client/filters',
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
      path: '/owner/filters',
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

  // Get icon color class only (for the Icon component) - ULTRA BRIGHT with glow
  const getIconColorClass = (item: NavItem, active: boolean) => {
    if (!active) return 'text-white/80 drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]';

    switch (item.id) {
      case 'browse':
        return 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]';
      case 'likes':
      case 'liked':
        return 'text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.9)]';
      case 'messages':
        return 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.9)]';
      case 'listings':
        return 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]';
      case 'profile':
        return 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]';
      case 'hire':
      case 'services':
        return 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]';
      case 'filter':
        return 'text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]';
      default:
        return 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]';
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
    <nav className={cn("app-bottom-bar pointer-events-none px-1", !isVisible && "nav-hidden")}>
      <div
        // TINDER-STYLE: No background frame - buttons float on gradient overlay
        // The swipe card's GradientMaskBottom provides the visual contrast
        className="flex items-center justify-between w-full max-w-xl mx-auto px-2 py-2 pointer-events-auto"
        style={{
          // GPU acceleration for smooth animations
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          // No background - pure transparent for Tinder-style floating buttons
        }}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <motion.button
              key={item.id}
              onClick={(e) => handleNavClick(e, item)}
              // INSTANT NAVIGATION: Prefetch on earliest possible events
              onPointerDown={(e) => { e.stopPropagation(); if (item.path) prefetchRoute(item.path); }}
              onTouchStart={(e) => { e.stopPropagation(); if (item.path) prefetchRoute(item.path); }}
              onMouseEnter={(e) => { e.stopPropagation(); if (item.path) prefetchRoute(item.path); }}
              onFocus={(e) => { e.stopPropagation(); if (item.path) prefetchRoute(item.path); }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92, transition: springConfigs.instant }}
              // EXPANDED TOUCH TARGETS: Each button has generous hit area
              className="relative transition-colors duration-75 select-none touch-manipulation flex items-center justify-center rounded-2xl"
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

              <Icon
                className={cn(
                  'transition-all duration-75',
                  getIconColorClass(item, active),
                  active && 'fill-current'
                )}
                style={{
                  // Use constant for icon size - slightly larger for center items
                  width: item.isCenter ? ICON_SIZE + 2 : ICON_SIZE,
                  height: item.isCenter ? ICON_SIZE + 2 : ICON_SIZE,
                }}
                strokeWidth={active ? 2.5 : 2}
              />
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
