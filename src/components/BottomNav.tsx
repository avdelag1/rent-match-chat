import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, SlidersHorizontal, MessageCircle, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUnreadLikes } from '@/hooks/useUnreadLikes';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  active: 'home' | 'explore' | 'likes' | 'messages' | 'profile';
  userRole: 'owner' | 'client';
}

export function BottomNav({ active, userRole }: BottomNavProps) {
  const { unreadCount: likesCount } = useUnreadLikes();
  const { unreadCount: messagesCount } = useUnreadMessageCount();

  const dashboardLink = userRole === 'owner' ? '/owner/dashboard' : '/client/dashboard';
  const filtersLink = userRole === 'owner' ? '/owner/filters-explore' : '/client/dashboard';
  const likesLink = userRole === 'owner' ? '/owner/liked-clients' : '/client/liked-properties';
  const profileLink = userRole === 'owner' ? '/owner/profile' : '/client/profile';

  const navItems = [
    { to: dashboardLink, icon: Flame, label: 'Home', id: 'home' },
    { to: filtersLink, icon: SlidersHorizontal, label: 'Explore', id: 'explore' },
    { to: likesLink, icon: Flame, label: 'Flames', id: 'likes', badge: likesCount },
    { to: '/messages', icon: MessageCircle, label: 'Messages', id: 'messages', badge: messagesCount },
    { to: profileLink, icon: User, label: 'Profile', id: 'profile' },
  ];

  return (
    <motion.nav 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.1 }}
      className="app-bottom-bar bg-card/90 backdrop-blur-2xl border-t border-white/5"
    >
      <div className="flex justify-around items-center max-w-2xl mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) => cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all relative',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary/80'
              )}
              end={item.id === 'home'}
            >
              {({ isActive }) => (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.05, type: 'spring', stiffness: 500 }}
                  className="flex flex-col items-center"
                >
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className={cn('w-6 h-6 transition-all', isActive && 'drop-shadow-[0_0_8px_currentColor]')} />
                    <AnimatePresence>
                      {item.badge && item.badge > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Badge className={cn(
                            "absolute -top-2 -right-2 h-[20px] min-w-[20px] rounded-full px-1 flex items-center justify-center text-white text-[10px] font-bold leading-none shadow-lg ring-2 ring-background",
                            item.id === 'messages' 
                              ? 'bg-blue-500' 
                              : 'bg-gradient-to-br from-orange-500 to-red-500'
                          )}>
                            {item.badge > 99 ? '99+' : item.badge}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <span className={cn(
                    'text-xs font-medium mt-1 transition-all',
                    isActive && 'text-primary'
                  )}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator dot */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </div>
    </motion.nav>
  );
}
