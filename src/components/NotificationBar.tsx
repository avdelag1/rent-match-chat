import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, MessageCircle, Star, User, Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type NotificationType = 'like' | 'message' | 'super_like' | 'match' | 'new_user' | 'premium_purchase' | 'activation_purchase';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  avatar?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationBarProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export function NotificationBar({ notifications, onDismiss, onMarkAllRead, onNotificationClick }: NotificationBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visible, setVisible] = useState(false);

  const unreadNotifications = useMemo(() => notifications.filter(n => !n.read), [notifications]);
  const hasUnread = unreadNotifications.length > 0;

  useEffect(() => {
    if (hasUnread) {
      setVisible(true);
      // Auto-show for 3 seconds when new notifications arrive
      const timer = setTimeout(() => {
        if (!isExpanded) {
          setVisible(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasUnread, isExpanded]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'super_like':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'match':
        return <Flame className="w-4 h-4 text-orange-500 fill-current" />;
      case 'new_user':
        return <User className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'border-orange-200 bg-orange-50';
      case 'message':
        return 'border-blue-200 bg-blue-50';
      case 'super_like':
        return 'border-yellow-200 bg-yellow-50';
      case 'match':
        return 'border-orange-200 bg-orange-50';
      case 'new_user':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (!hasUnread && !isExpanded) {
    return null;
  }

  return (
    <AnimatePresence>
      {(visible || isExpanded) && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 pt-2"
        >
          <Card className="mx-auto max-w-4xl bg-white/95 backdrop-blur-md border shadow-lg">
            
            {/* Notification Summary Header */}
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <span className="font-medium text-sm">
                      {unreadNotifications.length} new notification{unreadNotifications.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {unreadNotifications.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadNotifications.length}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {isExpanded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAllRead();
                      }}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setVisible(false);
                      setIsExpanded(false);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Expanded Notifications List */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="max-h-80 overflow-y-auto">
                    {unreadNotifications.slice(0, 5).map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${getNotificationColor(notification.type)}`}
                        onClick={() => onNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          {notification.avatar ? (
                            <Avatar className="w-10 h-10 border-2 border-white">
                              <AvatarImage src={notification.avatar} />
                              <AvatarFallback>
                                {notification.title.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-gray-900 truncate">
                                {notification.title}
                              </p>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismiss(notification.id);
                            }}
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    
                    {unreadNotifications.length > 5 && (
                      <div className="p-3 text-center">
                        <p className="text-xs text-gray-500">
                          +{unreadNotifications.length - 5} more notifications
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}