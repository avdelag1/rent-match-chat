/**
 * BOTTOM NAVIGATION BAR
 *
 * Full-width, ergonomic bottom navigation optimized for one-handed use.
 * TRANSPARENT: No background, floating on content.
 * BRIGHT: White icons with enhanced visibility.
 */

import { startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, SlidersHorizontal, Flame, MessageCircle, User, Plus, List, Building2, Heart, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { prefetchRoute } from '@/utils/routePrefetcher';

// BRIGHT ICON SIZING
const ICON_SIZE = 26;
const TOUCH_TARGET_SIZE = 56;

interface BottomNavigationProps {
  userRole: 'client' | 'owner' | 'admin';
  onFilterClick?: () => void;
  onAddListingClick?: () => void;
  onListingsClick?: () => void;
}

interface NavItem {
  id: string;
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

  // Client/Renter Navigation Items
  const clientNavItems: NavItem[] = [
    { id: 'browse', icon: Home, path: '/client/dashboard' },
    { id: 'profile', icon: User, path: '/client/profile' },
    { id: 'likes', icon: Flame, path: '/client/liked-properties' },
    { id: 'messages', icon: MessageCircle, path: '/messages', badge: unreadCount },
    { id: 'filter', icon: Filter, path: '/client/filters' },
  ];

  // Owner/Landlord Navigation Items
  const ownerNavItems: NavItem[] = [
    { id: 'browse', icon: Building2, path: '/owner/dashboard' },
    { id: 'profile', icon: User, path: '/owner/profile' },
    { id: 'liked', icon: Heart, path: '/owner/liked-clients' },
    { id: 'listings', icon: List, path: '/owner/properties', isCenter: true },
    { id: 'messages', icon: MessageCircle, path: '/messages', badge: unreadCount },
    { id: 'filter', icon: SlidersHorizontal, path: '/owner/filters' },
  ];

  const navItems = userRole === 'client' ? clientNavItems : ownerNavItems;

  const handleNavClick = (event: React.MouseEvent, item: NavItem) => {
    event.stopPropagation();
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      startTransition(() => {
        navigate(item.path!);
      });
    }
  };

  const isActive = (item: NavItem) => {
    if (!item.path) return false;
    return location.pathname === item.path;
  };

  // BRIGHT: Clear active/inactive with enhanced colors
  const getIconColorClass = (active: boolean) => {
    return active ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]' : 'text-white/80';
  };

  // BRIGHT: Indicator dot
  const getIndicatorColorClass = () => {
    return 'bg-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]';
  };


  return (
    <nav className={cn("app-bottom-bar pointer-events-none px-1", !isVisible && "nav-hidden")}>
      <div
        // TRANSPARENT: No background, floating on content
        className="flex items-center justify-between w-full max-w-xl mx-auto px-2 pointer-events-auto bg-transparent"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {navItems.map((item) => {
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
                'hover:bg-white/10',
                'touch-manipulation',
                '-webkit-tap-highlight-color-transparent'
              )}
              style={{
                minWidth: TOUCH_TARGET_SIZE,
                minHeight: TOUCH_TARGET_SIZE,
                padding: 12,
              }}
            >
              {/* BRIGHT: Active indicator dot */}
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className={cn(
                    'absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                    getIndicatorColorClass()
                  )}
                />
              )}

              {/* Notification Badge - BRIGHT orange */}
              <AnimatePresence>
                {item.badge && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={cn(
                      "absolute -top-0.5 -right-0.5 rounded-full min-w-[20px] h-[20px] flex items-center justify-center text-[11px] font-bold text-white px-1 z-10",
                      "bg-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]"
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
                )}
              </AnimatePresence>

              <Icon
                className={cn(
                  'transition-all duration-150',
                  getIconColorClass(active),
                  active && 'fill-current'
                )}
                style={{
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                }}
                strokeWidth={active ? 2.5 : 2}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
