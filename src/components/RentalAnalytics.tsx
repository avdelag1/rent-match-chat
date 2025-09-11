import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

export function RentalAnalytics() {
  // Mock analytics data
  const metrics = {
    totalRevenue: 12500,
    revenueChange: 8.5,
    occupancyRate: 85,
    occupancyChange: -2.3,
    averageRent: 2100,
    rentChange: 5.2,
    totalProperties: 6,
    propertiesChange: 0
  };

  const monthlyData = [
    { month: 'Jan', revenue: 10500, occupancy: 90 },
    { month: 'Feb', revenue: 11200, occupancy: 88 },
    { month: 'Mar', revenue: 12100, occupancy: 92 },
    { month: 'Apr', revenue: 11800, occupancy: 85 },
    { month: 'May', revenue: 12500, occupancy: 85 },
    { month: 'Jun', revenue: 13200, occupancy: 89 }
  ];

  const propertyPerformance = [
    { property: 'Downtown Apartment', revenue: 3200, occupancy: 100, rating: 4.8 },
    { property: 'Suburban House', revenue: 2400, occupancy: 100, rating: 4.6 },
    { property: 'Studio Loft', revenue: 1800, occupancy: 0, rating: 4.2 },
    { property: 'Garden Villa', revenue: 2800, occupancy: 100, rating: 4.9 },
    { property: 'City Condo', revenue: 2300, occupancy: 100, rating: 4.4 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Rental Analytics</h1>
        <p className="text-muted-foreground">Track performance and insights for your properties</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getChangeIcon(metrics.revenueChange)}
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-sm font-medium ${getChangeColor(metrics.revenueChange)}`}>
                    {metrics.revenueChange > 0 ? '+' : ''}{metrics.revenueChange}%
                  </span>
                  <span className="text-sm text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                    <p className="text-2xl font-bold">{metrics.occupancyRate}%</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getChangeIcon(metrics.occupancyChange)}
                    <Home className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-sm font-medium ${getChangeColor(metrics.occupancyChange)}`}>
                    {metrics.occupancyChange > 0 ? '+' : ''}{metrics.occupancyChange}%
                  </span>
                  <span className="text-sm text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Rent</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.averageRent)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getChangeIcon(metrics.rentChange)}
                    <BarChart3 className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-sm font-medium ${getChangeColor(metrics.rentChange)}`}>
                    {metrics.rentChange > 0 ? '+' : ''}{metrics.rentChange}%
                  </span>
                  <span className="text-sm text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Properties</p>
                    <p className="text-2xl font-bold">{metrics.totalProperties}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-muted-foreground">Active listings</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Property Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertyPerformance.map((property, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Home className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{property.property}</h4>
                        <p className="text-sm text-muted-foreground">Rating: {property.rating}/5.0</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(property.revenue)}</p>
                        <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      </div>
                      
                      <Badge variant={property.occupancy === 100 ? "default" : "secondary"}>
                        {property.occupancy}% Occupied
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <PieChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Detailed revenue charts and projections coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Property performance metrics and trends coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Tenant Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tenant satisfaction and retention metrics coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}