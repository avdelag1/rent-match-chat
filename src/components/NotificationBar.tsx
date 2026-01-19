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
        return 'border-orange-500/30 bg-gradient-to-r from-orange-500/15 to-red-500/10';
      case 'message':
        return 'border-blue-500/30 bg-gradient-to-r from-blue-500/15 to-cyan-500/10';
      case 'super_like':
        return 'border-yellow-500/30 bg-gradient-to-r from-yellow-500/15 to-amber-500/10';
      case 'match':
        return 'border-pink-500/30 bg-gradient-to-r from-pink-500/15 to-purple-500/10';
      case 'new_user':
        return 'border-green-500/30 bg-gradient-to-r from-green-500/15 to-emerald-500/10';
      default:
        return 'border-gray-500/30 bg-gradient-to-r from-gray-500/15 to-gray-400/10';
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
          <Card className="mx-auto max-w-4xl bg-gradient-to-br from-gray-900/98 to-gray-800/98 backdrop-blur-xl border-white/10 shadow-2xl rounded-3xl">
            
            {/* Notification Summary Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center ring-2 ring-primary/30">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-base text-white">
                        {unreadNotifications.length} new notification{unreadNotifications.length !== 1 ? 's' : ''}
                      </span>
                      <p className="text-xs text-gray-400">Tap to expand</p>
                    </div>
                  </div>
                  {unreadNotifications.length > 0 && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-none shadow-lg shadow-red-500/30 text-xs px-2.5 py-1">
                      {unreadNotifications.length}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {isExpanded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAllRead();
                      }}
                      className="text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
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
                    className="h-9 w-9 p-0 rounded-full hover:bg-white/10"
                  >
                    <X className="w-5 h-5 text-gray-400" />
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
                    {unreadNotifications.slice(0, 5).map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all duration-200 backdrop-blur-sm ${getNotificationColor(notification.type)}`}
                        onClick={() => onNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          {notification.avatar ? (
                            <Avatar className="w-12 h-12 border-2 border-white/20 ring-2 ring-primary/20">
                              <AvatarImage src={notification.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-purple-500/30 text-white font-bold">
                                {notification.title.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/20 shadow-lg">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-white truncate">
                                {notification.title}
                              </p>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-primary"></span>
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
                            className="h-7 w-7 p-0 opacity-50 hover:opacity-100 hover:bg-white/10 rounded-full"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                    
                    {unreadNotifications.length > 5 && (
                      <div className="p-4 text-center border-t border-white/5">
                        <p className="text-sm text-gray-400 font-medium">
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