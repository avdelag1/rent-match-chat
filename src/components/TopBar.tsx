import { Bell, Settings, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

interface TopBarProps {
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

export function TopBar({ onNotificationsClick, onSettingsClick, className }: TopBarProps) {
  const { unreadCount: notificationCount } = useUnreadNotifications();

  return (
    <header className={cn('fixed top-0 left-0 right-0 bg-background border-b border-border z-50', className)}>
      <div className="flex items-center justify-between h-14 px-4 max-w-screen-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-2">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            TINDERENT
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications (Likes/Matches) */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            onClick={onNotificationsClick}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onSettingsClick}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
