/**
 * BOTTOM NAVIGATION BAR
 *
 * Full-width, ergonomic bottom navigation optimized for one-handed use.
 * HIGH CONTRAST: Clear active/inactive states with solid colors.
 * BRIGHT & VIBRANT: Clean light background with vivid orange accents.
 */

import { startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, SlidersHorizontal, Flame, MessageCircle, User, Plus, List, Building2, Heart, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { prefetchRoute } from '@/utils/routePrefetcher';

// HIGH CONTRAST SIZING
const ICON_SIZE = 26; // Larger icons for better visibility
const TOUCH_TARGET_SIZE = 56;

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

  // Client/Renter Navigation Items - Profile next to Browse, Filter at the end
  const clientNavItems: NavItem[] = [
    {
      id: 'browse',
      label: 'Browse',
      icon: Home,
      path: '/client/dashboard',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/client/profile',
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
      id: 'filter',
      label: 'Filter',
      icon: Filter,
      path: '/client/filters',
    },
  ];

  // Owner/Landlord Navigation Items - Profile next to Browse, Filter at the end
  const ownerNavItems: NavItem[] = [
    {
      id: 'browse',
      label: 'Browse',
      icon: Building2,
      path: '/owner/dashboard',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/owner/profile',
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
      id: 'filter',
      label: 'Filter',
      icon: SlidersHorizontal,
      path: '/owner/filters',
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

  // HIGH CONTRAST: Clear color distinction between active and inactive states - VIBRANT ORANGE
  const getIconColorClass = (item: NavItem, active: boolean) => {
    if (!active) {
      // Inactive icons - BRIGHT and clearly visible against light background
      return 'text-gray-500';
    }

    // Active icons - VIBRANT orange
    return 'text-orange-500';
  };

  // HIGH CONTRAST: Clear indicator dot colors - VIBRANT ORANGE
  const getIndicatorColorClass = (item: NavItem) => {
    return 'bg-orange-500';
  };


  return (
    <nav className={cn("app-bottom-bar pointer-events-none px-1", !isVisible && "nav-hidden")}>
      <div
        // BRIGHT STYLE: Clean light background with vibrant buttons
        className="flex items-end justify-between w-full max-w-xl mx-auto px-1 py-1 pointer-events-auto"
        style={{
          // GPU acceleration for smooth animations
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          // Clean light background
        }}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <button
              key={item.id}
              onClick={(e) => handleNavClick(e, item)}
              onPointerDown={(e) => { e.stopPropagation(); if (item.path) prefetchRoute(item.path); }}
              onTouchStart={(e) => { e.stopPropagation(); if (item.path) prefetchRoute(item.path); }}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-xl gap-0.5',
                'transition-all duration-100 ease-out',
                'active:scale-[0.95]',
                'hover:bg-orange-100',
                'touch-manipulation',
                '-webkit-tap-highlight-color-transparent'
              )}
              style={{
                minWidth: item.isCenter ? 64 : 56,
                minHeight: 48,
                padding: '6px 8px',
              }}
            >
              {/* HIGH CONTRAST: Visible indicator dot for active state */}
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className={cn(
                    'absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                    getIndicatorColorClass(item)
                  )}
                />
              )}

              {/* Notification Badge */}
              <AnimatePresence>
                {item.badge && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={cn(
                      "absolute -top-0.5 -right-0.5 rounded-full min-w-[20px] h-[20px] flex items-center justify-center text-[11px] font-bold text-white px-1 z-10",
                      "bg-orange-500"
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
                )}
              </AnimatePresence>

              <Icon
                className={cn(
                  'transition-colors duration-150',
                  getIconColorClass(item, active)
                )}
                style={{
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                }}
                strokeWidth={active ? 2.5 : 2}
              />
              {/* Text label - brighter and enhanced */}
              <span className={cn(
                'text-[9px] font-bold uppercase tracking-wider transition-colors duration-150',
                active 
                  ? 'text-orange-500' 
                  : 'text-gray-500'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
