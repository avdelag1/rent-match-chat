
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SwipeContainer } from '@/components/SwipeContainer';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Heart, Home, MapPin, TrendingUp, Users, Calendar } from 'lucide-react';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

const ClientDashboard = ({ onPropertyInsights, onMessageClick }: ClientDashboardProps) => {
  const handleListingTap = (listingId: string) => {
    console.log('Listing tapped:', listingId);
  };

  const handleInsights = (listingId: string) => {
    if (onPropertyInsights) {
      onPropertyInsights(listingId);
    }
  };

  // Mock data for dashboard stats
  const stats = [
    {
      title: 'Properties Liked',
      value: '23',
      icon: Heart,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    {
      title: 'Properties Viewed',
      value: '156',
      icon: Home,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Areas Explored',
      value: '8',
      icon: MapPin,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      title: 'Match Score',
      value: '92%',
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Liked a property',
      property: 'Modern Apartment in Aldea Zama',
      time: '2 hours ago',
      type: 'like'
    },
    {
      id: 2,
      action: 'Viewed property details',
      property: 'Beachfront Villa with Pool',
      time: '4 hours ago',
      type: 'view'
    },
    {
      id: 3,
      action: 'Updated preferences',
      property: 'Search filters modified',
      time: '1 day ago',
      type: 'update'
    },
    {
      id: 4,
      action: 'New match found',
      property: 'Eco-friendly Studio Near Beach',
      time: '2 days ago',
      type: 'match'
    }
  ];

  const trendingNeighborhoods = [
    { name: 'Aldea Zama', properties: 45, trend: '+12%' },
    { name: 'Tulum Centro', properties: 32, trend: '+8%' },
    { name: 'La Veleta', properties: 28, trend: '+15%' },
    { name: 'Holistika', properties: 18, trend: '+5%' }
  ];

  return (
    <DashboardLayout userRole="client">
      <div className="p-6 lg:p-8 space-y-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Discover Your Perfect Home in Tulum
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Swipe through curated properties that match your lifestyle and preferences
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-white/70 text-sm">{stat.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Swipe Area */}
            <div className="lg:col-span-2">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-center flex items-center justify-center gap-2">
                    <Home className="w-5 h-5" />
                    Available Properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pb-8">
                  <SwipeContainer 
                    onListingTap={handleListingTap} 
                    onInsights={handleInsights}
                    onMessageClick={onMessageClick}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with Activity and Trends */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-80 overflow-y-auto">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="p-4 border-b border-white/10 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === 'like' ? 'bg-red-400' :
                            activity.type === 'view' ? 'bg-blue-400' :
                            activity.type === 'match' ? 'bg-green-400' :
                            'bg-purple-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium">
                              {activity.action}
                            </p>
                            <p className="text-white/70 text-xs truncate">
                              {activity.property}
                            </p>
                            <p className="text-white/50 text-xs mt-1">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trending Neighborhoods */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Trending Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingNeighborhoods.map((area, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{area.name}</p>
                        <p className="text-white/60 text-sm">{area.properties} properties</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-green-500/20 text-green-400 border-green-500/30"
                      >
                        {area.trend}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Pro Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-white/80 text-sm">
                    💡 Swipe right to like properties that match your style
                  </div>
                  <div className="text-white/80 text-sm">
                    🎯 Update your preferences for better matches
                  </div>
                  <div className="text-white/80 text-sm">
                    💬 Message owners directly when you find the perfect place
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
