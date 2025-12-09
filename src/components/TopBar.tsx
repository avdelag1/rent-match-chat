import { Bell, Settings, Flame, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

interface TopBarProps {
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  onFiltersClick?: () => void;
  className?: string;
  showFilters?: boolean;
}

export function TopBar({ onNotificationsClick, onSettingsClick, onFiltersClick, className, showFilters = false }: TopBarProps) {
  const { unreadCount: notificationCount } = useUnreadNotifications();

  return (
    <header 
      className={cn('fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-white/10 z-50', className)}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between h-11 px-4 max-w-screen-xl mx-auto">
        {/* Logo with Modern Animation */}
        <div className="flex items-center gap-1.5 select-none">
          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-1.5 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-200 hover:scale-110">
            <Flame className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent animate-gradient-text">
            TINDERENT
          </span>
        </div>

        {/* Actions - Minimal Icon Only */}
        <div className="flex items-center gap-2">
          {/* Notifications (Likes/Matches) */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 hover:bg-background/60 hover:backdrop-blur-md rounded-xl transition-all duration-200"
            onClick={onNotificationsClick}
          >
            <Bell className="h-4 w-4 text-foreground/70 hover:text-foreground" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-3 w-3 shadow-lg animate-pulse" />
            )}
          </Button>

          {/* Filters (Owner only) */}
          {showFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-background/60 hover:backdrop-blur-md rounded-xl transition-all duration-200"
              onClick={onFiltersClick}
            >
              <Filter className="h-4 w-4 text-foreground/70 hover:text-foreground" />
            </Button>
          )}

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-background/60 hover:backdrop-blur-md rounded-xl transition-all duration-200"
            onClick={onSettingsClick}
          >
            <Settings className="h-4 w-4 text-foreground/70 hover:text-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}
