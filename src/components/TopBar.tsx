import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useNavigate } from 'react-router-dom';
import { SwipessLogo } from './SwipessLogo';
import { QuickFilterDropdown } from './QuickFilterDropdown';
import { ModeSwitcher } from './ModeSwitcher';
import { useScrollDirection } from '@/hooks/useScrollDirection';

// UPGRADED BRIGHTNESS: Text is now a brighter, more vibrant gradient with glow effect
const MessageActivationText = () => (
  <>
    <span className="hidden sm:inline font-bold text-sm tracking-tight bg-gradient-to-r from-yellow-200 via-orange-300 to-yellow-200 bg-clip-text text-transparent whitespace-nowrap drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
      Message Activation
    </span>
    <Zap className="sm:hidden h-5 w-5 text-yellow-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
  </>
);

interface TopBarProps {
  onNotificationsClick?: () => void;
  onMessageActivationsClick?: () => void;
  className?: string;
  showFilters?: boolean;
  userRole?: 'client' | 'owner';
  transparent?: boolean;
  hideOnScroll?: boolean;
}

function TopBarComponent({
  onNotificationsClick,
  onMessageActivationsClick,
  className,
  showFilters,
  userRole,
  transparent = false,
  hideOnScroll = false,
}: TopBarProps) {
  const { isVisible } = useScrollDirection({ 
    threshold: 15, 
    showAtTop: true,
    targetSelector: '#dashboard-scroll-container',
  });
  const { unreadCount: notificationCount } = useUnreadNotifications();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (userRole === 'owner') {
      navigate('/owner/dashboard');
    } else {
      navigate('/client/dashboard');
    }
  };

  const shouldHide = hideOnScroll && !isVisible;

  return (
    <header
      className={cn(
        'app-header',
        'bg-transparent border-transparent backdrop-blur-none',
        shouldHide && 'header-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between h-12 max-w-screen-xl mx-auto gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-shrink">
          <motion.div
            className="flex items-center gap-0.5 select-none cursor-pointer flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogoClick}
          >
            <SwipessLogo size="xs" />
          </motion.div>

          <div className="flex-shrink-0">
            <ModeSwitcher variant="pill" size="sm" className="md:hidden" />
            <ModeSwitcher variant="pill" size="md" className="hidden md:flex" />
          </div>

          {showFilters && userRole && (
            <div className="flex-shrink-0">
              <QuickFilterDropdown userRole={userRole} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* UPGRADED BRIGHTNESS: Added a subtle background glow on hover */}
          <Button
            variant="ghost"
            className="relative h-9 sm:h-10 md:h-11 px-2 sm:px-3 md:px-4 hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center"
            onClick={onMessageActivationsClick}
            aria-label="Message activations"
          >
            <MessageActivationText />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 hover:bg-white/10 rounded-xl transition-all duration-200 group flex-shrink-0"
            onClick={() => navigate('/radio')}
            aria-label="Radio Player"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Radio className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)] group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </motion.div>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 hover:bg-white/10 rounded-xl transition-all duration-200 group flex-shrink-0"
            onClick={onNotificationsClick}
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {/* UPGRADED BRIGHTNESS: Icon is now brighter and more visible with glow effect */}
              <Bell
                className={cn(
                  "h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200",
                  notificationCount > 0
                    ? "text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)] group-hover:text-amber-200 group-hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]"
                    : "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)] group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                )}
              />
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
