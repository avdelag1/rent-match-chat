import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Flame, 
  MessageCircle, 
  Eye, 
  Star, 
  TrendingUp, 
  Calendar,
  Filter,
  Bell
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'like' | 'message' | 'view' | 'match' | 'super_like' | 'favorite';
  user: {
    name: string;
    image?: string;
    role: 'client' | 'owner';
  };
  target: {
    name: string;
    type: 'property' | 'profile';
  };
  timestamp: Date;
  metadata?: {
    score?: number;
    location?: string;
    price?: number;
  };
}

interface ActivityFeedProps {
  userRole: 'client' | 'owner';
}

export function ActivityFeed({ userRole }: ActivityFeedProps) {
  const [activities] = useState<Activity[]>([
    {
      id: '1',
      type: 'like',
      user: { name: 'Maria Santos', role: 'client' },
      target: { name: 'Beachfront Villa Tulum', type: 'property' },
      timestamp: new Date('2024-01-16T10:30:00'),
      metadata: { score: 92, price: 2500 }
    },
    {
      id: '2', 
      type: 'super_like',
      user: { name: 'John Rodriguez', role: 'client' },
      target: { name: 'Modern Loft Downtown', type: 'property' },
      timestamp: new Date('2024-01-16T09:15:00'),
      metadata: { score: 88, price: 1800 }
    },
    {
      id: '3',
      type: 'message',
      user: { name: 'Ana Garcia', role: 'client' },
      target: { name: 'You', type: 'profile' },
      timestamp: new Date('2024-01-16T08:45:00')
    },
    {
      id: '4',
      type: 'view',
      user: { name: 'Carlos Mendoza', role: 'client' },
      target: { name: 'Luxury Penthouse', type: 'property' },
      timestamp: new Date('2024-01-15T16:20:00'),
      metadata: { score: 76 }
    },
    {
      id: '5',
      type: 'match',
      user: { name: 'Sofia Lopez', role: 'client' },
      target: { name: 'Eco-Friendly House', type: 'property' },
      timestamp: new Date('2024-01-15T14:10:00'),
      metadata: { score: 94 }
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'likes' | 'messages' | 'matches'>('all');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like': return <Flame className="w-4 h-4 text-red-400" />;
      case 'super_like': return <Star className="w-4 h-4 text-yellow-400" />;
      case 'message': return <MessageCircle className="w-4 h-4 text-blue-400" />;
      case 'view': return <Eye className="w-4 h-4 text-gray-400" />;
      case 'match': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'favorite': return <Flame className="w-4 h-4 text-orange-400" />;
      default: return <Bell className="w-4 h-4 text-white" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    const { type, user, target } = activity;
    switch (type) {
      case 'like':
        return `${user.name} liked your ${target.type}`;
      case 'super_like':
        return `${user.name} super liked your ${target.type}`;
      case 'message':
        return `${user.name} sent you a message`;
      case 'view':
        return `${user.name} viewed your ${target.type}`;
      case 'match':
        return `You matched with ${user.name}`;
      case 'favorite':
        return `${user.name} favorited your ${target.type}`;
      default:
        return `Activity from ${user.name}`;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'likes') return ['like', 'super_like'].includes(activity.type);
    if (filter === 'messages') return activity.type === 'message';
    if (filter === 'matches') return activity.type === 'match';
    return true;
  });

  const todayActivities = filteredActivities.filter(a => 
    a.timestamp.toDateString() === new Date().toDateString()
  );
  
  const yesterdayActivities = filteredActivities.filter(a => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return a.timestamp.toDateString() === yesterday.toDateString();
  });

  const olderActivities = filteredActivities.filter(a => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return a.timestamp < yesterday;
  });

  const ActivityList = ({ activities, title }: { activities: Activity[], title: string }) => (
    <div className="space-y-3">
      {activities.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-foreground/60 uppercase tracking-wide">
            {title}
          </h3>
          {activities.map((activity) => (
            <Card key={activity.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={activity.user.image} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {activity.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <p className="text-foreground text-sm">
                        {getActivityText(activity)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-foreground/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                      
                      {activity.metadata?.score && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.metadata.score}% match
                        </Badge>
                      )}
                      
                      {activity.metadata?.price && (
                        <Badge variant="outline" className="text-xs border-green-400 text-green-400">
                          ${activity.metadata.price}/mo
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-foreground/50 text-xs mt-1">
                      {activity.target.name}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {activity.type === 'message' && (
                      <Button size="sm" variant="ghost" className="text-foreground/70 hover:text-foreground hover:bg-foreground/10">
                        Reply
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-foreground/70 hover:text-foreground hover:bg-foreground/10">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Activity Feed</h2>
          <p className="text-foreground/70">Stay updated with your latest interactions</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-foreground/70 hover:text-foreground hover:bg-foreground/10"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <Flame className="w-6 h-6 mx-auto text-red-400 mb-2" />
            <div className="text-lg font-bold text-foreground">
              {activities.filter(a => ['like', 'super_like'].includes(a.type)).length}
            </div>
            <div className="text-foreground/60 text-xs">Likes Today</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-6 h-6 mx-auto text-blue-400 mb-2" />
            <div className="text-lg font-bold text-foreground">
              {activities.filter(a => a.type === 'message').length}
            </div>
            <div className="text-foreground/60 text-xs">Messages</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <Eye className="w-6 h-6 mx-auto text-gray-400 mb-2" />
            <div className="text-lg font-bold text-foreground">
              {activities.filter(a => a.type === 'view').length}
            </div>
            <div className="text-foreground/60 text-xs">Views</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto text-green-400 mb-2" />
            <div className="text-lg font-bold text-foreground">
              {activities.filter(a => a.type === 'match').length}
            </div>
            <div className="text-foreground/60 text-xs">Matches</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
          <TabsTrigger value="all" className="text-foreground data-[state=active]:bg-foreground/20">
            All
          </TabsTrigger>
          <TabsTrigger value="likes" className="text-foreground data-[state=active]:bg-foreground/20">
            Likes
          </TabsTrigger>
          <TabsTrigger value="messages" className="text-foreground data-[state=active]:bg-foreground/20">
            Messages
          </TabsTrigger>
          <TabsTrigger value="matches" className="text-foreground data-[state=active]:bg-foreground/20">
            Matches
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={filter} className="space-y-6 mt-6">
          <ActivityList activities={todayActivities} title="Today" />
          <ActivityList activities={yesterdayActivities} title="Yesterday" />
          <ActivityList activities={olderActivities} title="Earlier" />
          
          {filteredActivities.length === 0 && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto text-foreground/50 mb-4" />
                <p className="text-foreground/70">No activities yet</p>
                <p className="text-foreground/50 text-sm">Start swiping to see your activity feed</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}