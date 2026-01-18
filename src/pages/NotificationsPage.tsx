/** SPEED OF LIGHT: DashboardLayout is now rendered at route level */
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell, MessageSquare, Flame, Star, Sparkles, Trash2,
  CheckCheck, Filter, MoreHorizontal, Archive, Eye,
  Home, Ship, Bike, Car
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { formatDistanceToNow } from '@/utils/timeFormatter';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/prodLogger';
import { VirtualizedNotificationList } from '@/components/VirtualizedNotificationList';
import { usePrefetchManager } from '@/hooks/usePrefetchManager';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  link_url?: string | null;
  related_user_id?: string | null;
  metadata?: any;
}

const NotificationIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
  switch (type) {
    case 'new_message':
    case 'message':
      return <MessageSquare className={`${className} text-blue-500`} />;
    case 'new_like':
    case 'like':
      return <Flame className={`${className} text-orange-500`} />;
    case 'new_match':
    case 'match':
      return <Sparkles className={`${className} text-amber-500`} />;
    case 'super_like':
      return <Star className={`${className} text-yellow-500`} />;
    case 'property':
      return <Home className={`${className} text-emerald-500`} />;
    case 'yacht':
      return <Ship className={`${className} text-cyan-500`} />;
    case 'bicycle':
      return <Bike className={`${className} text-orange-500`} />;
    case 'vehicle':
      return <Car className={`${className} text-purple-500`} />;
    default:
      return <Bell className={`${className} text-muted-foreground`} />;
  }
};

const NotificationIconBg = ({ type }: { type: string }) => {
  const bgGradients: Record<string, string> = {
    'new_message': 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10',
    'message': 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10',
    'new_like': 'bg-gradient-to-br from-orange-500/20 to-amber-500/10',
    'like': 'bg-gradient-to-br from-orange-500/20 to-amber-500/10',
    'new_match': 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10',
    'match': 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10',
    'super_like': 'bg-gradient-to-br from-yellow-500/20 to-orange-500/10',
    'property': 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10',
    'yacht': 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10',
    'bicycle': 'bg-gradient-to-br from-orange-500/20 to-red-500/10',
    'vehicle': 'bg-gradient-to-br from-purple-500/20 to-pink-500/10',
  };

  return (
    <div className={`p-3 rounded-2xl shadow-lg ${bgGradients[type] || 'bg-gradient-to-br from-muted to-muted-foreground/20'}`}>
      <NotificationIcon type={type} className="w-6 h-6" />
    </div>
  );
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const { user } = useAuth();
  const { data: userRole } = useUserRole(user?.id);
  const { prefetchNextNotificationsPage } = usePrefetchManager();

  // PERFORMANCE FIX: Prefetch is now triggered from INSIDE VirtualizedNotificationList
  // via onEndReached prop - this is more reliable than outer scroll detection
  const handleEndReached = useCallback(() => {
    if (!user?.id || notifications.length < 50) return;
    prefetchNextNotificationsPage(user.id, notifications.length);
  }, [user?.id, notifications.length, prefetchNextNotificationsPage]);

  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();
    // Auto-mark all notifications as read when visiting this page
    markAllAsReadSilently();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications-page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const n = payload.new as Record<string, unknown>;
            const newNotification: Notification = {
              id: n.id as string,
              type: (n.type as string) || 'system',
              title: n.type === 'new_like' || n.type === 'like' ? 'New Like' :
                     n.type === 'new_match' || n.type === 'match' ? 'New Match!' :
                     n.type === 'new_message' || n.type === 'message' ? 'New Message' :
                     n.type === 'super_like' ? 'Super Like!' : 'Notification',
              message: (n.message as string) || '',
              created_at: n.created_at as string,
              read: (n.read as boolean) || false,
              link_url: n.link_url as string | null,
              related_user_id: n.related_user_id as string | null,
              metadata: n.metadata,
            };
            setNotifications(prev => [newNotification, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== (payload.old as { id: string }).id));
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as { id: string; read: boolean };
            setNotifications(prev =>
              prev.map(n => n.id === updated.id ? { ...n, read: updated.read } : n)
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  // Mark all as read without toast (silent version for auto-marking)
  const markAllAsReadSilently = async () => {
    if (!user?.id) return;
    try {
      await supabase
        .from('notifications')
        .update({ read: true } as any)
        .eq('user_id', user.id)
        .eq('read', false);
    } catch (error) {
      logger.error('Error auto-marking as read:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const formattedNotifications: Notification[] = (data || []).map((n: Record<string, unknown>) => ({
        id: n.id as string,
        type: (n.type as string) || 'system',
        title: n.type === 'new_like' || n.type === 'like' ? 'New Like' :
               n.type === 'new_match' || n.type === 'match' ? 'New Match!' :
               n.type === 'new_message' || n.type === 'message' ? 'New Message' :
               n.type === 'super_like' ? 'Super Like!' : 'Notification',
        message: (n.message as string) || '',
        created_at: n.created_at as string,
        read: (n.read as boolean) || false,
        link_url: n.link_url as string | null,
        related_user_id: n.related_user_id as string | null,
        metadata: n.metadata,
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      logger.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true } as any)
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      logger.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true } as any)
        .eq('user_id', user.id)
        .eq('read', false);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      toast({
        title: 'All notifications marked as read',
        description: 'Your notifications have been updated.',
      });
    } catch (error) {
      logger.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed.',
      });
    } catch (error) {
      logger.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification.',
        variant: 'destructive',
      });
    }
  };

  const deleteAllNotifications = async () => {
    if (!user?.id) return;
    setDeletingAll(true);

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);
      
      toast({
        title: 'All notifications deleted',
        description: 'Your notifications have been cleared.',
      });
    } catch (error) {
      logger.error('Error deleting all notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notifications.',
        variant: 'destructive',
      });
    } finally {
      setDeletingAll(false);
      setDeleteDialogOpen(false);
    }
  };

  const confirmDelete = (notificationId: string) => {
    setNotificationToDelete(notificationId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete);
    } else {
      deleteAllNotifications();
    }
    setNotificationToDelete(null);
    setDeleteDialogOpen(false);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'messages') return n.type === 'new_message' || n.type === 'message';
    if (activeFilter === 'likes') return n.type === 'new_like' || n.type === 'like' || n.type === 'super_like';
    if (activeFilter === 'matches') return n.type === 'new_match' || n.type === 'match';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20 sm:pb-24 overflow-y-auto">
        <div className="px-3 py-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <PageHeader 
              title="Notifications"
              subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              actions={
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={markAllAsRead}
                      className="gap-2"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Mark all read</span>
                    </Button>
                  )}
                  
                  {notifications.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setNotificationToDelete(null);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete all notifications
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              }
            />

          {/* Filter Tabs */}
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="flex w-full bg-card/80 backdrop-blur-sm border border-border/40 rounded-xl p-1 h-auto gap-1">
              <TabsTrigger
                value="all"
                className="flex-1 min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-medium transition-all"
              >
                <span>All</span>
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="flex-1 min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-medium transition-all gap-1"
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-background/50">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="flex-1 min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-medium transition-all"
              >
                <span className="hidden sm:inline">Msgs</span>
                <MessageSquare className="w-4 h-4 sm:hidden" />
              </TabsTrigger>
              <TabsTrigger
                value="likes"
                className="flex-1 min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-medium transition-all"
              >
                <span className="hidden sm:inline">Flames</span>
                <Flame className="w-4 h-4 sm:hidden" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeFilter} className="mt-4 sm:mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="animate-pulse bg-gradient-to-br from-card/80 to-card/40 border-border/40 shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-muted to-muted-foreground/20" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-gradient-to-r from-muted to-muted-foreground/20 rounded-lg" />
                            <div className="h-3 w-2/3 bg-gradient-to-r from-muted to-muted-foreground/20 rounded-lg" />
                            <div className="h-3 w-1/4 bg-gradient-to-r from-muted to-muted-foreground/20 rounded-lg" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-full blur-2xl scale-150 animate-pulse" />
                    <div className="relative p-6 sm:p-8 rounded-full bg-gradient-to-br from-primary/10 via-purple-500/5 to-primary/10 border-2 border-primary/20 shadow-2xl shadow-primary/10">
                      <Bell className="w-12 h-12 sm:w-14 sm:h-14 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent mb-3">
                    {activeFilter === 'all' ? 'No notifications yet' : `No ${activeFilter} notifications`}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                    {activeFilter === 'all'
                      ? "New activity will appear here"
                      : `No ${activeFilter} notifications at the moment`
                    }
                  </p>
                </motion.div>
              ) : (
                // PERFORMANCE FIX: Removed outer scroll wrapper - prefetch now handled
                // inside VirtualizedNotificationList via onEndReached prop
                <VirtualizedNotificationList
                  notifications={filteredNotifications}
                  onMarkAsRead={markAsRead}
                  onDelete={confirmDelete}
                  onEndReached={handleEndReached}
                />
              )}
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {notificationToDelete ? 'Delete notification?' : 'Delete all notifications?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {notificationToDelete 
                ? 'This notification will be permanently deleted.'
                : 'All your notifications will be permanently deleted. This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingAll ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
