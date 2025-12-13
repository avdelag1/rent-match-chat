import { Bell, Settings, Filter } from 'lucide-react';
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
    <header className={cn('app-header bg-background/95 backdrop-blur-md', className)}>
      <div className="flex items-center justify-between h-10 max-w-screen-xl mx-auto">
        {/* Logo with animated gradient */}
        <div className="flex items-center gap-1.5 select-none">
          <span className="text-2xl font-black tracking-tight">
            <span className="text-foreground">Swipe</span>
          </span>
          <span 
            className="text-3xl font-black tracking-tight animate-gradient-shift"
            style={{
              background: 'linear-gradient(90deg, #f97316 0%, #ea580c 20%, #fbbf24 40%, #ff6b35 60%, #dc2626 80%, #f97316 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Match
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Notifications (Likes/Matches) */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 hover:bg-muted/50 rounded-lg transition-all duration-200"
            onClick={onNotificationsClick}
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
          >
            <Bell className="h-5 w-5 text-foreground/80" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-[11px] font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center shadow-lg shadow-red-500/60 border-2 border-background animate-pulse">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Button>

          {/* Filters (Owner only) */}
          {showFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-muted/50 rounded-lg transition-all duration-200"
              onClick={onFiltersClick}
              aria-label="Open filters"
            >
              <Filter className="h-5 w-5 text-foreground/80" />
            </Button>
          )}

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-muted/50 rounded-lg transition-all duration-200"
            onClick={onSettingsClick}
            aria-label="Settings menu"
          >
            <Settings className="h-5 w-5 text-foreground/80" />
          </Button>
        </div>
      </div>
    </header>
  );
}
