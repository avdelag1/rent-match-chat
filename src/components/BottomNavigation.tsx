/**
 * BOTTOM NAVIGATION BAR
 *
 * Full-width, ergonomic bottom navigation optimized for one-handed use.
 * HIGH CONTRAST: Clear active/inactive states with solid colors.
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

  // HIGH CONTRAST: Clear color distinction between active and inactive states
  const getIconColorClass = (item: NavItem, active: boolean) => {
    if (!active) {
      // Inactive icons - bright and clearly visible against dark background
      return 'text-white/90';
    }

    // Active icons - solid, high-contrast colors
    switch (item.id) {
      case 'browse':
        return 'text-white';
      case 'likes':
      case 'liked':
        return 'text-orange-400'; // Bright orange for flames/likes
      case 'messages':
        return 'text-cyan-400'; // Bright cyan for messages
      case 'listings':
        return 'text-white';
      case 'profile':
        return 'text-white';
      case 'hire':
      case 'services':
        return 'text-emerald-400'; // Bright green for services
      case 'filter':
        return 'text-violet-400'; // Bright purple for filter
      default:
        return 'text-white';
    }
  };

  // HIGH CONTRAST: Clear indicator dot colors
  const getIndicatorColorClass = (item: NavItem) => {
    switch (item.id) {
      case 'browse':
        return 'bg-white';
      case 'likes':
      case 'liked':
        return 'bg-orange-400';
      case 'messages':
        return 'bg-cyan-400';
      case 'listings':
        return 'bg-white';
      case 'profile':
        return 'bg-white';
      case 'hire':
      case 'services':
        return 'bg-emerald-400';
      case 'filter':
        return 'bg-violet-400';
      default:
        return 'bg-white';
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
            <button
              key={item.id}
              onClick={(e) => handleNavClick(e, item)}
              onPointerDown={(e) => { e.stopPropagation(); if (item.path) prefetchRoute(item.path); }}
              onTouchStart={(e) => { e.stopPropagation(); if (item.path) prefetchRoute(item.path); }}
              className={cn(
                'relative flex items-center justify-center rounded-xl',
                'transition-all duration-100 ease-out',
                'active:scale-[0.9]',
                'touch-manipulation',
                '-webkit-tap-highlight-color-transparent'
              )}
              style={{
                minWidth: TOUCH_TARGET_SIZE,
                minHeight: TOUCH_TARGET_SIZE,
                padding: 12,
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
                      "absolute -top-0.5 -right-0.5 rounded-full min-w-[20px] h-[20px] flex items-center justify-center text-[11px] font-bold text-white px-1",
                      item.id === 'messages' ? 'bg-cyan-500' : 'bg-orange-500'
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
              
              {/* HIGH CONTRAST: Label below icon */}
              <span className={cn(
                'absolute -bottom-5 text-[10px] font-medium whitespace-nowrap transition-colors duration-150',
                active ? 'text-white' : 'text-white/60'
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
