import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, SlidersHorizontal, Flame, MessageCircle, User, Plus, List, Building2, Heart, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount';
import { springConfigs } from '@/utils/springConfigs';

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

  const handleNavClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
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
    <nav className="app-bottom-bar pointer-events-none px-3">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          ...springConfigs.snappy,
          delay: 0.1
        }}
        className="flex items-center justify-center gap-2 px-4 py-3 pointer-events-auto bg-background/95 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mx-auto max-w-fit"
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
              onClick={() => handleNavClick(item)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, transition: springConfigs.instant }}
              className="relative transition-colors duration-200 select-none touch-manipulation flex items-center justify-center p-3 rounded-2xl"
            >
              {/* Notification Badge - Shows unread count number */}
              <AnimatePresence>
                {item.badge && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className={cn(
                      "absolute -top-1 -right-1 rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg ring-2 ring-background text-[10px] font-bold text-white px-1",
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
                    'h-6 w-6 transition-all duration-200',
                    item.isCenter && 'h-7 w-7',
                    getIconColorClass(item, active)
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />

                {/* Active indicator - subtle underline */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      className={cn(
                        "w-4 h-0.5 rounded-full mt-1",
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
