
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Users, Home, MessageSquare, TrendingUp, Eye, Heart, DollarSign, Calendar, Plus } from 'lucide-react';

interface OwnerDashboardProps {
  onClientInsights?: (profileId: string) => void;
  onMessageClick?: () => void;
}

const OwnerDashboard = ({ onClientInsights, onMessageClick }: OwnerDashboardProps) => {
  const handleProfileTap = (profileId: string) => {
    console.log('Profile tapped:', profileId);
  };

  const handleInsights = (profileId: string) => {
    if (onClientInsights) {
      onClientInsights(profileId);
    }
  };

  // Mock data for owner dashboard
  const ownerStats = [
    {
      title: 'Active Listings',
      value: '12',
      icon: Home,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      change: '+2 this month'
    },
    {
      title: 'Total Views',
      value: '1,234',
      icon: Eye,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      change: '+15% this week'
    },
    {
      title: 'Profile Matches',
      value: '48',
      icon: Heart,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      change: '+8 new matches'
    },
    {
      title: 'Monthly Revenue',
      value: '$24,500',
      icon: DollarSign,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      change: '+12% vs last month'
    }
  ];

  const recentMatches = [
    {
      id: 1,
      name: 'María González',
      property: 'Aldea Zama Apartment',
      matchScore: 92,
      time: '2 hours ago',
      status: 'new'
    },
    {
      id: 2,
      name: 'Carlos Ruiz',
      property: 'Beachfront Villa',
      matchScore: 88,
      time: '4 hours ago',
      status: 'messaged'
    },
    {
      id: 3,
      name: 'Ana López',
      property: 'Eco Studio',
      matchScore: 95,
      time: '1 day ago',
      status: 'interested'
    },
    {
      id: 4,
      name: 'David Chen',
      property: 'Jungle Retreat',
      matchScore: 85,
      time: '2 days ago',
      status: 'viewed'
    }
  ];

  const propertyPerformance = [
    {
      name: 'Modern Apartment - Aldea Zama',
      views: 156,
      likes: 23,
      messages: 8,
      status: 'Active',
      revenue: '$2,800'
    },
    {
      name: 'Beachfront Villa - La Veleta',
      views: 98,
      likes: 15,
      messages: 5,
      status: 'Active',
      revenue: '$4,200'
    },
    {
      name: 'Eco Studio - Tulum Centro',
      views: 87,
      likes: 12,
      messages: 3,
      status: 'Pending',
      revenue: '$1,600'
    }
  ];

  const upcomingEvents = [
    {
      type: 'Property Tour',
      title: 'Showing to María González',
      time: 'Today, 3:00 PM',
      property: 'Aldea Zama Apartment'
    },
    {
      type: 'Contract Signing',
      title: 'Lease agreement with Carlos',
      time: 'Tomorrow, 10:00 AM',
      property: 'Beachfront Villa'
    },
    {
      type: 'Property Maintenance',
      title: 'Pool cleaning service',
      time: 'Friday, 2:00 PM',
      property: 'Villa Complex'
    }
  ];

  return (
    <DashboardLayout userRole="owner">
      <div className="p-6 lg:p-8 space-y-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Property Owner Dashboard
              </h1>
              <p className="text-white/80 text-lg">
                Connect with potential tenants and manage your properties
              </p>
            </div>
            <Button className="bg-green-500 hover:bg-green-600 mt-4 lg:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Add New Property
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {ownerStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-white/70 text-sm mb-2">{stat.title}</p>
                      <p className="text-green-400 text-xs">{stat.change}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Tenant Discovery Area */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-center flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" />
                    Discover Potential Tenants
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pb-8">
                  <ClientSwipeContainer 
                    onProfileTap={handleProfileTap}
                    onInsights={handleInsights}
                    onMessageClick={onMessageClick}
                  />
                </CardContent>
              </Card>

              {/* Property Performance */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Property Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      {propertyPerformance.map((property, index) => (
                        <div key={index} className="p-4 border-b border-white/10 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium text-sm truncate">
                              {property.name}
                            </h4>
                            <Badge 
                              variant={property.status === 'Active' ? 'default' : 'secondary'}
                              className={property.status === 'Active' ? 
                                'bg-green-500/20 text-green-400 border-green-500/30' : 
                                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              }
                            >
                              {property.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-white/60">Views</p>
                              <p className="text-white font-semibold">{property.views}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Likes</p>
                              <p className="text-white font-semibold">{property.likes}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Messages</p>
                              <p className="text-white font-semibold">{property.messages}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Revenue</p>
                              <p className="text-green-400 font-semibold">{property.revenue}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with Matches and Events */}
            <div className="space-y-6">
              {/* Recent Matches */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Recent Matches
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-80 overflow-y-auto">
                    {recentMatches.map((match) => (
                      <div key={match.id} className="p-4 border-b border-white/10 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm">{match.name}</p>
                            <p className="text-white/60 text-xs truncate">{match.property}</p>
                          </div>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                            {match.matchScore}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/50 text-xs">{match.time}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs border-white/30 ${
                              match.status === 'new' ? 'text-blue-400' :
                              match.status === 'messaged' ? 'text-green-400' :
                              match.status === 'interested' ? 'text-purple-400' :
                              'text-white/60'
                            }`}
                          >
                            {match.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{event.title}</p>
                          <p className="text-white/60 text-xs">{event.property}</p>
                          <p className="text-green-400 text-xs mt-1">{event.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full text-white border-white/20 hover:bg-white/10">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View All Messages
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-white border-white/20 hover:bg-white/10">
                    <Home className="w-4 h-4 mr-2" />
                    Manage Properties
                  </Button>
                  <Button variant="outline" size="sm" className="w-full text-white border-white/20 hover:bg-white/10">
                    <Users className="w-4 h-4 mr-2" />
                    View All Matches
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
