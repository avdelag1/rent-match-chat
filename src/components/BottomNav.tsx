import { NavLink, useLocation } from 'react-router-dom';
import { Flame, SlidersHorizontal, MessageCircle, User, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUnreadLikes } from '@/hooks/useUnreadLikes';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount';
import { motion, AnimatePresence } from 'framer-motion';
import { springConfigs } from '@/utils/modernAnimations';

interface BottomNavProps {
  active: 'home' | 'explore' | 'likes' | 'messages' | 'profile';
  userRole: 'owner' | 'client';
}

export function BottomNav({ active, userRole }: BottomNavProps) {
  const { unreadCount: likesCount } = useUnreadLikes();
  const { unreadCount: messagesCount } = useUnreadMessageCount();
  const location = useLocation();

  const dashboardLink = userRole === 'owner' ? '/owner/dashboard' : '/client/dashboard';
  const filtersLink = userRole === 'owner' ? '/owner/filters-explore' : '/client/dashboard';
  const likesLink = userRole === 'owner' ? '/owner/liked-clients' : '/client/liked-properties';
  const profileLink = userRole === 'owner' ? '/owner/profile' : '/client/profile';

  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      to: dashboardLink,
      end: true,
    },
    {
      id: 'explore',
      icon: SlidersHorizontal,
      label: 'Explore',
      to: filtersLink,
    },
    {
      id: 'likes',
      icon: Flame,
      label: 'Flames',
      to: likesLink,
      badge: likesCount,
      badgeGradient: true,
    },
    {
      id: 'messages',
      icon: MessageCircle,
      label: 'Messages',
      to: '/messages',
      badge: messagesCount,
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      to: profileLink,
    },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.end) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to);
  };

  return (
    <nav className="app-bottom-bar bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.end}
              className="relative flex flex-col items-center justify-center py-2 px-4 min-w-[64px]"
            >
              {({ isActive: navIsActive }) => (
                <motion.div
                  className="flex flex-col items-center justify-center gap-1 relative"
                  whileTap={{ scale: 0.9 }}
                  transition={springConfigs.ios}
                >
                  {/* Active background indicator */}
                  <AnimatePresence>
                    {(active || navIsActive) && (
                      <motion.div
                        layoutId="navActiveIndicator"
                        className="absolute -inset-2 rounded-2xl bg-primary/10"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={springConfigs.tab}
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon container */}
                  <div className="relative z-10">
                    <motion.div
                      animate={{
                        scale: active || navIsActive ? 1.1 : 1,
                        y: active || navIsActive ? -2 : 0,
                      }}
                      transition={springConfigs.snappy}
                    >
                      <Icon
                        className={`w-6 h-6 transition-colors duration-200 ${
                          active || navIsActive
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                        strokeWidth={active || navIsActive ? 2.5 : 2}
                      />
                    </motion.div>

                    {/* Badge */}
                    <AnimatePresence>
                      {item.badge && item.badge > 0 && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={springConfigs.bouncy}
                          className="absolute -top-2 -right-3"
                        >
                          <Badge
                            className={`
                              h-[20px] min-w-[20px] rounded-full px-1.5 flex items-center justify-center
                              text-[10px] font-bold leading-none shadow-lg ring-2 ring-card
                              ${item.badgeGradient
                                ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                                : 'bg-blue-500 text-white'
                              }
                            `}
                          >
                            {item.badge > 99 ? '99+' : item.badge}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Label */}
                  <motion.span
                    className={`text-[10px] font-medium relative z-10 transition-colors duration-200 ${
                      active || navIsActive
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                    animate={{
                      fontWeight: active || navIsActive ? 600 : 500,
                    }}
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
